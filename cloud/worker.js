// PrototypeOS anonymous, non-deleting Cloud API.
// Production deployment requires Neon DATABASE_URL and Cloudflare Turnstile secrets.
// A private edit key belongs to each project; never publish it or send it to the public list.
import { neon } from '@neondatabase/serverless';
const respond=(body,status=200,headers={})=>new Response(JSON.stringify(body),{status,headers:{'content-type':'application/json;charset=utf-8','cache-control':'no-store',...headers}});
const hash=async key=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(key)))).map(b=>b.toString(16).padStart(2,'0')).join('');
const validKey=k=>typeof k==='string'&&/^[a-f0-9]{64}$/.test(k);
async function turnstile(token,secret,ip){
 if(!token||!secret)return false;
 const form=new FormData();form.append('secret',secret);form.append('response',token);if(ip)form.append('remoteip',ip);
 try{const r=await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify',{method:'POST',body:form});const data=await r.json();return data.success===true}catch{return false}
}
export default {async fetch(req,env){
 const origin=req.headers.get('Origin');
 const allowed=origin===env.ALLOWED_ORIGIN;
 const cors=allowed?{'Access-Control-Allow-Origin':origin,'Vary':'Origin'}:{};
 if(req.method==='OPTIONS')return allowed?new Response(null,{status:204,headers:{...cors,'Access-Control-Allow-Headers':'Content-Type, X-Prototype-Key','Access-Control-Allow-Methods':'GET,POST,PUT,OPTIONS'}}):respond({error:'Forbidden origin'},403);
 if(origin&&!allowed)return respond({error:'Forbidden origin'},403);
 const path=new URL(req.url).pathname;
 if(path==='/health'){
  if(!env.DATABASE_URL||!env.TURNSTILE_SECRET)return respond({status:'configuration-required',cloudSaveEnabled:false},200,cors);
  try{
   const db=neon(env.DATABASE_URL);
   const checks=await db`SELECT
     EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name='prototypes' AND column_name='edit_key_hash') AS edit_key,
     EXISTS(SELECT 1 FROM pg_constraint WHERE conrelid='prototypes'::regclass AND contype='u') AS unique_ids,
     to_regclass('prototype_revisions') IS NOT NULL AS revision_history,
     EXISTS(SELECT 1 FROM pg_trigger WHERE tgname='prototypeos_project_limit' AND NOT tgisinternal) AS limit_trigger,
     EXISTS(SELECT 1 FROM pg_trigger WHERE tgname='prototypeos_no_project_delete' AND NOT tgisinternal) AS no_delete_trigger`;
   const c=checks[0]||{};
   const ready=Boolean(c.edit_key&&c.unique_ids&&c.revision_history&&c.limit_trigger&&c.no_delete_trigger);
   return respond({status:ready?'ready':'database-migration-needed',cloudSaveEnabled:ready},200,cors);
  }catch{return respond({status:'database-unavailable',cloudSaveEnabled:false},503,cors)}
 }
 if(!env.DATABASE_URL)return respond({error:'Database not configured'},503,cors);
 const sql=neon(env.DATABASE_URL);
 try{
  if(path==='/api/prototypes'&&req.method==='GET'){
   const rows=await sql`SELECT client_id,kind,title,revision,updated_at FROM prototypes WHERE owner_id=(SELECT id FROM app_users WHERE external_subject='prototypeos-anonymous') ORDER BY updated_at DESC LIMIT 2000`;
   return respond({projects:rows,count:rows.length,limit:2000},200,cors);
  }
  const detail=path.match(/^\/api\/prototypes\/([a-zA-Z0-9_-]{1,150})$/);
  if(detail&&req.method==='GET'){
   const rows=await sql`SELECT client_id,kind,title,payload,revision,updated_at FROM prototypes WHERE client_id=${detail[1]} AND owner_id=(SELECT id FROM app_users WHERE external_subject='prototypeos-anonymous') LIMIT 1`;
   return rows.length?respond({project:rows[0]},200,cors):respond({error:'Not found'},404,cors);
  }
  if(path==='/api/prototypes'&&req.method==='POST'){
   if(!env.TURNSTILE_SECRET)return respond({error:'Abuse protection not configured'},503,cors);
   const raw=await req.text();if(raw.length>250000)return respond({error:'Too large'},413,cors);
   let d;try{d=JSON.parse(raw)}catch{return respond({error:'Invalid JSON'},400,cors)}
   if(!d||!validKey(d.edit_key)||typeof d.client_id!=='string'||!/^[a-zA-Z0-9_-]{1,150}$/.test(d.client_id)||!['product','process','business'].includes(d.kind)||typeof d.title!=='string'||!d.title.trim()||d.title.length>100||!d.payload||typeof d.payload!=='object'||Array.isArray(d.payload))return respond({error:'Invalid project'},400,cors);
   if(!await turnstile(d.turnstile_token,env.TURNSTILE_SECRET,req.headers.get('CF-Connecting-IP')))return respond({error:'Human verification required'},403,cors);
   const h=await hash(d.edit_key);
   // Shared anonymous owner is only a database foreign-key placeholder, not a user login.
   const owner=await sql`INSERT INTO app_users(external_subject,role) VALUES('prototypeos-anonymous','student') ON CONFLICT(external_subject) DO UPDATE SET external_subject=EXCLUDED.external_subject RETURNING id`;
   const result=await sql`INSERT INTO prototypes(owner_id,client_id,kind,title,payload,edit_key_hash) VALUES(${owner[0].id},${d.client_id},${d.kind},${d.title},${JSON.stringify(d.payload)}::jsonb,${h}) ON CONFLICT(owner_id,client_id) DO NOTHING RETURNING revision`;
   return result.length?respond({revision:1},201,cors):respond({error:'Project ID already exists'},409,cors);
  }
  if(detail&&req.method==='PUT'){
   const key=req.headers.get('X-Prototype-Key');if(!validKey(key))return respond({error:'Project edit key required'},403,cors);
   const raw=await req.text();if(raw.length>250000)return respond({error:'Too large'},413,cors);
   let d;try{d=JSON.parse(raw)}catch{return respond({error:'Invalid JSON'},400,cors)}
   if(!d||typeof d.title!=='string'||!d.title.trim()||d.title.length>100||!['product','process','business'].includes(d.kind)||!d.payload||typeof d.payload!=='object'||Array.isArray(d.payload)||!Number.isSafeInteger(d.expected_revision)||d.expected_revision<1)return respond({error:'Invalid update'},400,cors);
   const h=await hash(key);
   const rows=await sql`UPDATE prototypes SET title=${d.title},kind=${d.kind},payload=${JSON.stringify(d.payload)}::jsonb,revision=revision+1,updated_at=now() WHERE client_id=${detail[1]} AND owner_id=(SELECT id FROM app_users WHERE external_subject='prototypeos-anonymous') AND edit_key_hash=${h} AND revision=${d.expected_revision} RETURNING revision`;
   return rows.length?respond({revision:rows[0].revision},200,cors):respond({error:'Invalid key or version conflict'},409,cors);
  }
  return respond({error:'Not found'},404,cors);
 }catch(e){
  if(e?.code==='P2000'||String(e?.message||'').includes('capacity reached'))return respond({error:'2000 project capacity reached'},409,cors);
  return respond({error:'Database request failed'},500,cors);
 }
}};
