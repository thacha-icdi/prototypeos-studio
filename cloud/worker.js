// Cloudflare Worker scaffold (not activated on GitHub Pages).
// Requires an external OIDC issuer with JWT verification and Neon HTTP driver.
// Do NOT deploy until authentication and origin settings are configured.
// Install: npm install @neondatabase/serverless jose
import { neon } from '@neondatabase/serverless';
import { createRemoteJWKSet, jwtVerify } from 'jose';

const json=(data,status=200,headers={})=>new Response(JSON.stringify(data),{status,headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store',...headers}});
export default {
 async fetch(request,env){
  const origin=request.headers.get('Origin');
  const cors=origin===env.ALLOWED_ORIGIN?{'Access-Control-Allow-Origin':origin,'Vary':'Origin'}:{};
  if(request.method==='OPTIONS')return new Response(null,{status:204,headers:{...cors,'Access-Control-Allow-Headers':'Authorization, Content-Type','Access-Control-Allow-Methods':'GET, PUT, OPTIONS'}});
  if(origin&&origin!==env.ALLOWED_ORIGIN)return json({error:'Origin not allowed'},403);
  const path=new URL(request.url).pathname;
  if(path==='/health')return json({status:'ready-for-configuration'},200,cors);
  if(!env.DATABASE_URL||!env.OIDC_ISSUER||!env.OIDC_AUDIENCE)return json({error:'Cloud backend not configured'},503,cors);
  const match=/^Bearer (.+)$/.exec(request.headers.get('Authorization')||'');
  if(!match)return json({error:'Sign in required'},401,cors);
  let subject;
  try {
   const issuer=env.OIDC_ISSUER.replace(/\/$/,'');
   const {payload}=await jwtVerify(match[1],createRemoteJWKSet(new URL(issuer+'/.well-known/jwks.json')),{issuer,audience:env.OIDC_AUDIENCE});
   subject=payload.sub;
   if(!subject)throw Error('Missing subject');
  }catch{return json({error:'Invalid session'},401,cors)}
  const sql=neon(env.DATABASE_URL);
  try{
   const users=await sql`INSERT INTO app_users(external_subject) VALUES(${subject}) ON CONFLICT(external_subject) DO UPDATE SET external_subject=EXCLUDED.external_subject RETURNING id`;
   const owner=users[0].id;
   if(path==='/api/prototypes'&&request.method==='GET'){
    const rows=await sql`SELECT client_id,kind,title,payload,revision,updated_at FROM prototypes WHERE owner_id=${owner} ORDER BY updated_at DESC LIMIT 500`;
    return json({projects:rows},200,cors);
   }
   if(path==='/api/prototypes'&&request.method==='PUT'){
    const size=Number(request.headers.get('content-length')||0);
    if(size>250000)return json({error:'Payload too large'},413,cors);
    const raw=await request.text();
    if(raw.length>250000)return json({error:'Payload too large'},413,cors);
    let data;try{data=JSON.parse(raw)}catch{return json({error:'Invalid JSON'},400,cors)}
    if(!data||typeof data.client_id!=='string'||data.client_id.length>150||!['product','process','business'].includes(data.kind)||typeof data.title!=='string'||data.title.length>200||!data.payload||Array.isArray(data.payload)||typeof data.payload!=='object'||!Number.isSafeInteger(data.expected_revision)||data.expected_revision<0)return json({error:'Invalid project data'},400,cors);
    if(data.expected_revision===0){
     const inserted=await sql`INSERT INTO prototypes(owner_id,client_id,kind,title,payload) VALUES(${owner},${data.client_id},${data.kind},${data.title},${JSON.stringify(data.payload)}::jsonb) ON CONFLICT(owner_id,client_id) DO NOTHING RETURNING revision`;
     return inserted.length?json({revision:1},201,cors):json({error:'Project already exists; refresh before saving'},409,cors);
    }
    const updated=await sql`UPDATE prototypes SET title=${data.title},kind=${data.kind},payload=${JSON.stringify(data.payload)}::jsonb,revision=revision+1,updated_at=now() WHERE owner_id=${owner} AND client_id=${data.client_id} AND revision=${data.expected_revision} RETURNING revision`;
    return updated.length?json({revision:updated[0].revision},200,cors):json({error:'Version conflict; reload before saving'},409,cors);
   }
   return json({error:'Not found'},404,cors);
  }catch{return json({error:'Database operation failed'},500,cors)}
 }
};
