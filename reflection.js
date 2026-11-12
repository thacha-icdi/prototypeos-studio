'use strict';
/* Student reflection: saved per project and printed in the report. */
(()=>{
const key=id=>'prototypeos.reflection.'+id;
const sample={
 learned:'ตัวอย่างสำหรับนักศึกษา (ยังไม่ใช่ผลทดลองจริง): การออกแบบยาหม่องสำหรับพนักงานออฟฟิศควรให้ความสำคัญกับกลิ่นอ่อน ตลับขนาดพกพาที่เปิด–ปิดสะดวก และเนื้อบาล์มที่เกลี่ยง่าย โดยต้องรับฟังความคิดเห็นของกลุ่มเป้าหมายก่อนสรุปผล',
 improve:'ตัวอย่างประเด็นที่ควรปรับปรุง: ทดสอบระดับความเข้มของกลิ่นให้เหมาะกับพื้นที่ทำงานร่วมกัน ปรับฝาตลับให้จับถนัดมือ ลดความเหนียวของเนื้อบาล์ม และตรวจสอบฉลาก ส่วนผสม และความปลอดภัยก่อนการใช้จริง',
 next:'แผนทดลองครั้งถัดไป (ยังไม่ได้ดำเนินการ): เชิญพนักงานออฟฟิศ 5 คน ทดลองเปิด–ปิดตลับและประเมินกลิ่นกับความสะดวกในการใช้งาน เป้าหมายคืออย่างน้อย 4 ใน 5 คนเปิดตลับได้ภายใน 15 วินาที และได้คะแนนความสะดวกเฉลี่ยอย่างน้อย 4/5 โดยบันทึกผลและหลักฐานจริง'
};
const get=id=>{try{return JSON.parse(localStorage.getItem(key(id))||'{}')}catch{return {}}};
function forProject(p){const saved=p?get(p.id):{};if(p?.type==='product'&&p.name==='ยาหม่อง pain relief'){const merged={...saved};for(const [k,v] of Object.entries(sample))if(!merged[k])merged[k]=v;return merged;}return saved;}
window.prototypeReflection={get,forProject};
function install(){
 const product=document.getElementById('product');if(!product)return;
 const section=document.createElement('section');section.className='panel reflection-panel';
 section.innerHTML='<div class="panelhead"><h3>7. บทเรียนและแนวทางพัฒนาต่อ</h3><span class="step">REFLECTION</span></div><p class="helper">กรอกผลจากการทดลองหรือสิ่งที่ได้เรียนรู้จริง ข้อมูลนี้จะปรากฏในรายงาน Print / PDF</p><label>สิ่งที่ได้เรียนรู้ / What worked?<textarea id="reflectionLearned" rows="3" placeholder="อธิบายผลที่สังเกตได้จริง ไม่ใช่สิ่งที่คาดเดา"></textarea></label><label>สิ่งที่ต้องปรับปรุง / What should improve?<textarea id="reflectionImprove" rows="3" placeholder="ปัญหาที่พบและสิ่งที่ต้องแก้ไข"></textarea></label><label>การทดลองครั้งถัดไป / Next experiment<textarea id="reflectionNext" rows="3" placeholder="จะทดลองกับใคร วัดผลอย่างไร และเมื่อใด"></textarea></label><div class="reflection-actions"><button type="button" class="primary" id="reflectionSave">💾 Save reflection</button><button type="button" class="outlinebtn" id="reflectionCancel">↶ Cancel changes</button><span id="reflectionStatus" role="status"></span></div>';
 const anchor=document.querySelector('#product .advanced-planning')||document.querySelector('#product .workingbar');
 anchor.insertAdjacentElement('afterend',section);
 const fields=[['reflectionLearned','learned'],['reflectionImprove','improve'],['reflectionNext','next']];
 const activeProject=()=>typeof active==='function'?active('product'):null;
 let current=null;
 function load(){const p=activeProject();current=p?.id||null;const data=p?forProject(p):{};fields.forEach(([id,k])=>document.getElementById(id).value=data[k]||'');document.getElementById('reflectionStatus').textContent=current?'พร้อมบันทึก':'เลือกโครงการก่อน';}
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