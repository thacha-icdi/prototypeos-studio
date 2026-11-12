'use strict';
/* Safe local backup restore. Never replaces existing projects or automatically uploads data. */
(() => {
 const input=document.getElementById('restoreBackupFile');
 const button=document.getElementById('restoreBackupButton');
 const status=document.getElementById('restoreStatus');
 if(!input||!button||!status)return;
 const say=s=>{status.textContent=s};
 button.addEventListener('click',()=>input.click());
 input.addEventListener('change',async()=>{
   const file=input.files?.[0];input.value='';
   if(!file)return;
   if(file.size>8*1024*1024){say('ไฟล์ใหญ่เกิน 8 MB กรุณาเลือกไฟล์ Backup JSON ที่เล็กกว่า');return}
   let backup;
   try{backup=JSON.parse(await file.text())}catch{say('ไฟล์ไม่ใช่ JSON ที่อ่านได้');return}
   const items=Array.isArray(backup?.projects)?backup.projects:
     backup&&typeof backup==='object'&&backup.id?[backup]:[];
   if(backup?.app&&backup.app!=='PrototypeOS'){say('ไฟล์นี้ไม่ใช่ PrototypeOS Backup');return}
   if(!items.length){say('ไม่พบข้อมูลโครงการในไฟล์');return}
   const allowed=new Set(['product','process','business']);
   const valid=items.filter(p=>p&&typeof p==='object'&&!Array.isArray(p)&&typeof p.id==='string'&&p.id.length<=150&&typeof p.name==='string'&&p.name.length<=100&&allowed.has(p.type)&&p.product&&p.process&&p.business);
   if(valid.length!==items.length){say('บางโครงการมีรูปแบบข้อมูลไม่ถูกต้อง จึงยังไม่นำเข้า');return}
   const existing=new Set(projects.map(p=>p.id));
   const unique=[];const seen=new Set();
   for(const p of valid){if(!existing.has(p.id)&&!seen.has(p.id)){unique.push(p);seen.add(p.id)}}
   if(!unique.length){say('โครงการทั้งหมดอยู่ในเครื่องนี้แล้ว ไม่มีข้อมูลถูกเขียนทับ');return}
   const names=unique.slice(0,8).map(p=>'• '+p.name).join('\n');
   const msg='นำเข้า '+unique.length+' โครงการโดยไม่ลบหรือเขียนทับโครงการเดิม?\n'+names+(unique.length>8?'\n...':'')+'\n\nข้อมูลจะถูกบันทึกไว้ในเบราว์เซอร์เครื่องนี้ ยังไม่ใช่ Cloud Sync';
   if(!confirm(msg)){say('ยกเลิกการนำเข้าแล้ว ข้อมูลเดิมไม่เปลี่ยน');return}
   // First make sure browser can store the merged collection without losing old records.
   const merged=[...projects,...unique];
   try{
     localStorage.setItem(STORAGE,JSON.stringify(merged));
     for(const p of unique){
       const ex=backup.extras?.[p.id];
       for(const [name,key] of [['reflection','prototypeos.reflection.'],['evidence','prototypeos.evidence.']]){
         const value=ex?.[name];
         if(typeof value==='string'&&value.length<1400000&&!localStorage.getItem(key+p.id)) {
           try{JSON.parse(value);localStorage.setItem(key+p.id,value)}catch{}
         }
       }
     }
   }catch{
     // Keep in-memory list unchanged; safe report, not an unverified success.
     say('พื้นที่เก็บข้อมูลไม่เพียงพอ กรุณาลดขนาดไฟล์ภาพใน Backup และลองใหม่');
     return;
   }
   projects.push(...unique);
   const first=unique.find(p=>p.type==='product')||unique[0];
   selected[first.type]=first.id;selected.insights=first.id;
   if(typeof saveSelection==='function')saveSelection();
   render();
   say('✓ นำเข้า '+unique.length+' โครงการสำเร็จ กด Open ที่โครงการเพื่อทำงานต่อ');
   toast('นำเข้าโครงการแล้ว — ข้อมูลเดิมไม่ถูกลบ');
 });
})();
