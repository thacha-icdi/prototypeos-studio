'use strict';
/* Student reflection: saved per project and printed in the report. */
(()=>{
const key=id=>'prototypeos.reflection.'+id;
const get=id=>{try{return JSON.parse(localStorage.getItem(key(id))||'{}')}catch{return {}}};
window.prototypeReflection={get};
function install(){
 const product=document.getElementById('product');if(!product)return;
 const section=document.createElement('section');section.className='panel reflection-panel';
 section.innerHTML='<div class="panelhead"><h3>6. สรุปผลและแผนปรับปรุงผลิตภัณฑ์</h3><span class="step">REFLECTION</span></div><p class="helper">กรอกผลจากการทดลองหรือสิ่งที่ได้เรียนรู้จริง ข้อมูลนี้จะปรากฏในรายงาน Print / PDF</p><label>สิ่งที่ได้เรียนรู้ / What worked?<textarea id="reflectionLearned" rows="3" placeholder="อธิบายผลที่สังเกตได้จริง ไม่ใช่สิ่งที่คาดเดา"></textarea></label><label>สิ่งที่ต้องปรับปรุง / What should improve?<textarea id="reflectionImprove" rows="3" placeholder="ปัญหาที่พบและสิ่งที่ต้องแก้ไข"></textarea></label><label>การทดลองครั้งถัดไป / Next experiment<textarea id="reflectionNext" rows="3" placeholder="จะทดลองกับใคร วัดผลอย่างไร และเมื่อใด"></textarea></label><div class="reflection-actions"><button type="button" class="primary" id="reflectionSave">💾 Save reflection</button><button type="button" class="outlinebtn" id="reflectionCancel">↶ Cancel changes</button><span id="reflectionStatus" role="status"></span></div>';
 const anchor=document.querySelector('#product .advanced-planning')||document.querySelector('#product .workingbar');
 anchor.insertAdjacentElement('afterend',section);
 const fields=[['reflectionLearned','learned'],['reflectionImprove','improve'],['reflectionNext','next']];
 const activeProject=()=>typeof active==='function'?active('product'):null;
 let current=null;
 function load(){const p=activeProject();current=p?.id||null;const data=current?get(current):{};fields.forEach(([id,k])=>document.getElementById(id).value=data[k]||'');document.getElementById('reflectionStatus').textContent=current?'พร้อมบันทึก':'เลือกโครงการก่อน';}
 function save(){const p=activeProject();if(!p)return;const data={};fields.forEach(([id,k])=>data[k]=document.getElementById(id).value.trim());try{localStorage.setItem(key(p.id),JSON.stringify(data));document.getElementById('reflectionStatus').textContent='✓ บันทึกแล้ว';if(typeof toast==='function')toast('บันทึกผลสะท้อนคิดแล้ว')}catch{document.getElementById('reflectionStatus').textContent='บันทึกไม่สำเร็จ';}}
 document.getElementById('reflectionSave').onclick=save;
 document.getElementById('reflectionCancel').onclick=load;
 fields.forEach(([id])=>document.getElementById(id).addEventListener('input',()=>document.getElementById('reflectionStatus').textContent='มีการแก้ไขที่ยังไม่ได้บันทึก'));
 document.getElementById('productProject')?.addEventListener('change',()=>setTimeout(load,0));
 document.querySelector('[data-view="product"]')?.addEventListener('click',()=>{if(activeProject()?.id!==current)load()});
 load();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install);else install();
})();