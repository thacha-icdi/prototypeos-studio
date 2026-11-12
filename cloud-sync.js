'use strict';
/* Optional no-login cloud transfer. All existing local data stays on the device.
   Never uploads automatically, deletes projects, or silently overwrites records. */
(() => {
 const host=document.querySelector('.backup-restore-panel');
 if(!host)return;
 const apiKey='prototypeos.cloud.api.url.v1';
 const siteKeyStorage='prototypeos.cloud.turnstile.site.v1';
 const editPrefix='prototypeos.cloud.edit.';
 const revisionPrefix='prototypeos.cloud.revision.';
 const panel=document.createElement('section');
 panel.className='backup-restore-panel cloud-workspace-panel';
 panel.setAttribute('aria-label','Optional Cloud Workspace');
 panel.innerHTML='<div><strong>☁ Cloud Workspace (ไม่ต้อง Login)</strong><p>บันทึกและเปิดโครงการข้ามเครื่องได้หลังเชื่อมต่อ Worker และ Neon แล้ว ข้อมูลเดิมในเครื่องไม่ถูกลบและไม่อัปโหลดอัตโนมัติ</p></div>'
  +'<label class="cloud-label">Cloudflare Worker URL <input id="cloudApiUrl" type="url" spellcheck="false" placeholder="https://prototypeos-cloud-api.YOUR-SUBDOMAIN.workers.dev" autocomplete="off"></label>'
  +'<label class="cloud-label">Turnstile Site Key (รหัสสาธารณะ) <input id="cloudSiteKey" type="text" placeholder="Cloudflare Turnstile site key" autocomplete="off"></label>'
  +'<div class="cloud-controls"><button class="outlinebtn" id="cloudConnect" type="button">ตรวจสอบ Cloud</button><button class="outlinebtn" id="cloudRefresh" type="button">แสดงโครงการบน Cloud</button><button class="outlinebtn" id="cloudExportKeys" type="button">สำรองรหัสแก้ไข</button><button class="outlinebtn" id="cloudImportKeysButton" type="button">นำเข้ารหัสแก้ไข</button><input type="file" id="cloudImportKeysFile" accept=".json,application/json" hidden></div>'
  +'<label class="cloud-label">โครงการในเครื่อง <select id="cloudLocalProject"></select></label>'
  +'<div id="cloudCaptcha" aria-label="Human verification before creating a cloud project"></div>'
  +'<div class="cloud-controls"><button class="primary" id="cloudPublish" type="button">☁ บันทึกโครงการใหม่บน Cloud</button><button class="outlinebtn" id="cloudSave" type="button">บันทึกการแก้ไขบน Cloud</button><button class="outlinebtn" id="cloudAddKey" type="button">ใส่รหัสแก้ไขโครงการ</button></div>'
  +'<p class="helper">โครงการที่อัปโหลดจะเปิดอ่านได้โดยผู้ที่ทราบลิงก์หรือรหัสโครงการ ห้ามใส่ข้อมูลลับหรือข้อมูลส่วนบุคคล รหัสแก้ไขต้องเก็บไว้เอง หากสูญหายจะไม่สามารถแก้ไขโครงการข้ามเครื่องได้</p>'
  +'<div id="cloudState" role="status" aria-live="polite">Cloud ยังไม่เชื่อมต่อ — ข้อมูลยังบันทึกในเครื่องตามปกติ</div><div id="cloudRemoteList" class="cloud-remote-list"></div>';
 host.insertAdjacentElement('afterend',panel);
 const $=id=>document.getElementById(id);
 const status=message=>{$('cloudState').textContent=message};
 const editKey=id=>localStorage.getItem(editPrefix+id);
 const knownRev=id=>Number(localStorage.getItem(revisionPrefix+id)||0);
 let api='',verified=false,remote=[],captchaId=null;
 $('cloudApiUrl').value=localStorage.getItem(apiKey)||'';
 $('cloudSiteKey').value=localStorage.getItem(siteKeyStorage)||'';
 function validateUrl(){
  try{
   const u=new URL($('cloudApiUrl').value.trim());
   if(u.protocol!=='https:'||u.username||u.password||u.search||u.hash||u.port||u.pathname!=='/'&&u.pathname!=='')
    throw Error('URL');
   if(!/^prototypeos-cloud-api\.[a-z0-9-]+\.workers\.dev$/i.test(u.hostname))throw Error('Host');
   return u.origin;
  }catch{throw Error('ใช้ URL แบบ https://prototypeos-cloud-api.SUBDOMAIN.workers.dev เท่านั้น')}
 }
 async function request(path,options){
  const url=api||validateUrl();
  const controller=new AbortController();
  const timer=setTimeout(()=>controller.abort(),15000);
  try{
   const response=await fetch(url+path,{...options,signal:controller.signal,cache:'no-store'});
   let data;try{data=await response.json()}catch{data={error:'Cloud returned invalid JSON'}}
   if(!response.ok)throw Error(data.error||'HTTP '+response.status);
   return data;
  }finally{clearTimeout(timer)}
 }
 function refreshLocal(){
  const select=$('cloudLocalProject'),value=select.value;
  select.replaceChildren();
  for(const p of projects){
   const option=document.createElement('option');option.value=p.id;
   option.textContent=p.name+' · '+p.type+(editKey(p.id)?' 🔑':'');
   select.append(option);
  }
  if(projects.some(p=>p.id===value))select.value=value;
  else if(projects.some(p=>p.id===selected.insights))select.value=selected.insights;
 }
 function selectedLocal(){return projects.find(p=>p.id===$('cloudLocalProject').value)}
 function safePayload(p){
  const extra={};
  for(const type of ['reflection','evidence']){
   const raw=localStorage.getItem('prototypeos.'+type+'.'+p.id);
   if(raw){try{extra[type]=JSON.parse(raw)}catch{}}
  }
  const payload={project:p,extras:extra};
  // Worker accepts up to 250 KB. Keep large embedded images in local backup.
  if(new TextEncoder().encode(JSON.stringify(payload)).length>235000)
   throw Error('ข้อมูลเกินขนาด Cloud Save (อาจเป็นภาพ) กรุณาสำรอง Backup JSON ในเครื่องก่อน');
  return payload;
 }
 function randomKey(){
  const bytes=new Uint8Array(32);crypto.getRandomValues(bytes);
  return Array.from(bytes,b=>b.toString(16).padStart(2,'0')).join('');
 }
 function download(name,data){
  const blob=new Blob([data],{type:'application/json;charset=utf-8'});
  const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),5000);
 }
 function showRemote(){
  const container=$('cloudRemoteList');container.replaceChildren();
  const summary=document.createElement('p');summary.textContent='โครงการบน Cloud '+remote.length+' / 2,000 (อ่านได้โดยไม่ต้อง Login)';
  container.append(summary);
  for(const item of remote){
   const article=document.createElement('div');article.className='cloud-project-item';
   const name=document.createElement('span');name.textContent=(item.title||'Untitled')+' · '+item.kind;
   const button=document.createElement('button');button.className='outlinebtn';button.type='button';
   button.textContent=projects.some(p=>p.id===item.client_id)?'มีในเครื่องแล้ว':'เปิดในเครื่องนี้';
   button.disabled=projects.some(p=>p.id===item.client_id);
   button.addEventListener('click',()=>importRemote(item.client_id));
   article.append(name,button);container.append(article);
  }
 }
 async function refreshCloud(){
  if(!verified)throw Error('กดตรวจสอบ Cloud ก่อน');
  const data=await request('/api/prototypes');
  if(!Array.isArray(data.projects))throw Error('รูปแบบข้อมูล Cloud ไม่ถูกต้อง');
  remote=data.projects;showRemote();refreshLocal();
  status('เชื่อม Cloud สำเร็จ · '+remote.length+' / 2,000 โครงการ');
 }
 $('cloudConnect').addEventListener('click',async()=>{
  try{
   api=validateUrl();verified=false;
   status('กำลังตรวจสอบ Cloud...');
   const h=await request('/health');
   if(!h.cloudSaveEnabled)throw Error('Worker ยังไม่พร้อม: ต้องตั้งค่า Neon DATABASE_URL และ Turnstile');
   localStorage.setItem(apiKey,api);
   verified=true;await refreshCloud();
  }catch(e){verified=false;status('เชื่อมต่อไม่สำเร็จ: '+e.message)}
 });
 $('cloudRefresh').addEventListener('click',async()=>{try{await refreshCloud()}catch(e){status('อ่านข้อมูล Cloud ไม่สำเร็จ: '+e.message)}});
 async function installCaptcha(){
  const siteKey=$('cloudSiteKey').value.trim();
  if(!siteKey)throw Error('กรุณาใส่ Turnstile Site Key จาก Cloudflare ก่อนสร้างโครงการ');
  localStorage.setItem(siteKeyStorage,siteKey);
  if(!window.turnstile){
   await new Promise((resolve,reject)=>{
    const script=document.createElement('script');script.src='https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
    script.async=true;script.onload=resolve;script.onerror=()=>reject(Error('โหลด Turnstile ไม่สำเร็จ'));document.head.append(script);
   });
  }
  if(!window.turnstile)throw Error('Turnstile ยังไม่พร้อม กรุณาลองอีกครั้ง');
  if(captchaId===null)captchaId=window.turnstile.render($('cloudCaptcha'),{sitekey:siteKey});
  const token=window.turnstile.getResponse(captchaId);
  if(!token)throw Error('กรุณายืนยันตัวตนที่ช่อง Turnstile แล้วกดบันทึกอีกครั้ง');
  return token;
 }
 $('cloudPublish').addEventListener('click',async()=>{
  try{
   if(!verified)throw Error('กรุณาตรวจสอบ Cloud ก่อน');
   const p=selectedLocal();if(!p)throw Error('เลือกโครงการก่อน');
   if(remote.length>=2000)throw Error('ครบ 2,000 โครงการแล้ว ยังไม่มีการลบโครงการ');
   if(remote.some(x=>x.client_id===p.id))throw Error('โครงการนี้มีอยู่บน Cloud แล้ว ให้ใช้ปุ่มบันทึกการแก้ไข');
   const payload=safePayload(p);
   const token=await installCaptcha();
   if(!confirm('เผยแพร่โครงการ “'+p.name+'” บน Cloud หรือไม่? ข้อมูลโครงการจะเปิดอ่านได้โดยผู้อื่น'))return;
   const key=editKey(p.id)||randomKey();
   // Save a copy of the secret BEFORE request; recoverable even if response is lost.
   localStorage.setItem(editPrefix+p.id,key);
   const result=await request('/api/prototypes',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({client_id:p.id,kind:p.type,title:p.name,payload,edit_key:key,turnstile_token:token})});
   localStorage.setItem(revisionPrefix+p.id,String(result.revision));
   if(captchaId!==null)window.turnstile.reset(captchaId);
   download('prototypeos-edit-key-'+p.id+'.json',JSON.stringify({app:'PrototypeOS',kind:'cloud-edit-key',id:p.id,edit_key:key,createdAt:new Date().toISOString()},null,2));
   await refreshCloud();status('✓ บันทึกบน Cloud แล้ว และดาวน์โหลดรหัสแก้ไขสำรองแล้ว กรุณาเก็บไฟล์ไว้');
  }catch(e){status('ยังไม่บันทึกบน Cloud: '+e.message)}
 });
 $('cloudSave').addEventListener('click',async()=>{
  try{
   if(!verified)throw Error('กรุณาตรวจสอบ Cloud ก่อน');
   const p=selectedLocal();if(!p)throw Error('เลือกโครงการก่อน');
   const key=editKey(p.id),revision=knownRev(p.id);
   if(!key)throw Error('ไม่มีรหัสแก้ไข ให้ใช้ปุ่มใส่รหัสแก้ไขโครงการ');
   if(!revision)throw Error('ไม่ทราบเวอร์ชัน Cloud; เปิดข้อมูลโครงการจาก Cloud ก่อนเพื่อหลีกเลี่ยงเขียนทับ');
   const payload=safePayload(p);
   if(!confirm('บันทึกเวอร์ชันที่แก้ไขของ “'+p.name+'” บน Cloud?'))return;
   const result=await request('/api/prototypes/'+encodeURIComponent(p.id),{method:'PUT',headers:{'Content-Type':'application/json','X-Prototype-Key':key},body:JSON.stringify({title:p.name,kind:p.type,payload,expected_revision:revision})});
   localStorage.setItem(revisionPrefix+p.id,String(result.revision));
   await refreshCloud();status('✓ บันทึกเวอร์ชัน '+result.revision+' บน Cloud สำเร็จ');
  }catch(e){status('ไม่เขียนทับข้อมูล Cloud: '+e.message)}
 });
 async function importRemote(id){
  try{
   if(projects.some(p=>p.id===id))throw Error('มี ID นี้ในเครื่องแล้ว — ระบบไม่เขียนทับข้อมูลเดิม');
   const d=await request('/api/prototypes/'+encodeURIComponent(id)),p=d.project?.payload?.project;
   if(!p||p.id!==id||!['product','process','business'].includes(p.type)||typeof p.name!=='string'||!p.product||!p.process||!p.business)throw Error('โครงการบน Cloud ไม่ตรงกับรูปแบบที่รองรับ');
   if(projects.length>=2000)throw Error('ในเครื่องมีครบ 2,000 โครงการแล้ว');
   if(!confirm('นำเข้า “'+p.name+'” ลงเครื่องนี้โดยไม่ลบหรือเขียนทับโครงการเดิมหรือไม่?'))return;
   const merged=[...projects,p];
   localStorage.setItem(STORAGE,JSON.stringify(merged));
   const extras=d.project.payload.extras||{};
   for(const kind of ['reflection','evidence']){
    if(extras[kind]&&typeof extras[kind]==='object'){
     const key='prototypeos.'+kind+'.'+id;
     if(!localStorage.getItem(key)){try{localStorage.setItem(key,JSON.stringify(extras[kind]))}catch{}}
    }
   }
   projects.push(p);
   selected[p.type]=p.id;selected.insights=p.id;saveSelection();
   localStorage.setItem(revisionPrefix+id,String(d.project.revision));
   render();refreshLocal();showRemote();
   status('✓ เปิดโครงการจาก Cloud แล้ว ข้อมูลเดิมไม่ถูกลบ หากต้องแก้ไขข้ามเครื่อง ให้ใส่รหัสแก้ไข');
  }catch(e){status('เปิดจาก Cloud ไม่สำเร็จ: '+e.message)}
 }
 $('cloudAddKey').addEventListener('click',()=>{
  const p=selectedLocal();if(!p){status('กรุณาเลือกโครงการ');return}
  const k=prompt('ใส่รหัสแก้ไข 64 ตัวอักษรสำหรับ “'+p.name+'” (ไม่ใช่รหัส Login)');
  if(k===null)return;
  if(!/^[a-f0-9]{64}$/.test(k)){status('รหัสแก้ไขไม่ถูกต้อง');return}
  try{localStorage.setItem(editPrefix+p.id,k);refreshLocal();status('บันทึกรหัสแก้ไขในเครื่องนี้แล้ว (ยังไม่ได้ยืนยันว่ารหัสตรงกับ Cloud)')}
  catch{status('บันทึกรหัสในเครื่องไม่สำเร็จ')}
 });
 $('cloudExportKeys').addEventListener('click',()=>{
  const keys=Object.fromEntries(projects.filter(p=>editKey(p.id)).map(p=>[p.id,editKey(p.id)]));
  if(!Object.keys(keys).length){status('ยังไม่มีรหัสแก้ไข Cloud ในเครื่องนี้');return}
  download('prototypeos-cloud-edit-keys.json',JSON.stringify({app:'PrototypeOS',kind:'cloud-edit-keys',exportedAt:new Date().toISOString(),keys},null,2));
  status('ดาวน์โหลดรหัสแก้ไขแล้ว เก็บไฟล์นี้เป็นความลับ');
 });
 $('cloudImportKeysButton').addEventListener('click',()=>$('cloudImportKeysFile').click());
 $('cloudImportKeysFile').addEventListener('change',async()=>{
  const file=$('cloudImportKeysFile').files?.[0];$('cloudImportKeysFile').value='';if(!file)return;
  try{
   if(file.size>200000)throw Error('ไฟล์ใหญ่เกินไป');
   const b=JSON.parse(await file.text());
   if(b.app!=='PrototypeOS')throw Error('ไม่ใช่ไฟล์ PrototypeOS');
   const keys=b.kind==='cloud-edit-key'?{[b.id]:b.edit_key}:b.kind==='cloud-edit-keys'?b.keys:null;
   if(!keys||typeof keys!=='object')throw Error('ไม่พบรหัสแก้ไข');
   if(!confirm('นำเข้ารหัสแก้ไขโครงการโดยไม่เขียนทับรหัสเดิม?'))return;
   let count=0;
   for(const [id,key] of Object.entries(keys)){
    if(projects.some(p=>p.id===id)&&/^[a-f0-9]{64}$/.test(key)&&!editKey(id)){
     localStorage.setItem(editPrefix+id,key);count++;
    }
   }
   refreshLocal();status('นำเข้ารหัสแก้ไขใหม่ '+count+' โครงการแล้ว; รหัสเดิมไม่ถูกเขียนทับ');
  }catch(e){status('นำเข้ารหัสไม่สำเร็จ: '+e.message)}
 });
 refreshLocal();
 const previous=window.prototypeOSCloudRefresh;
 window.prototypeOSCloudRefresh=()=>{refreshLocal();if(typeof previous==='function')previous()};
})();