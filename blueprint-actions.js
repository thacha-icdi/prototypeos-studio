'use strict';
/* Explicit checkpoints for the Product Blueprint. Existing auto-save remains active. */
(()=>{
const $=id=>document.getElementById(id);
let baseline=null,projectId=null,dirty=false;
function project(){return typeof active==='function'?active('product'):null;}
function clone(x){return JSON.parse(JSON.stringify(x));}
function status(s){const el=$('blueprintEditStatus');if(el)el.textContent=s;}
function capture(){const p=project();projectId=p?.id||null;baseline=p?clone(p.product||{}):null;dirty=false;status(p?'✓ ข้อมูลปัจจุบันพร้อมใช้งาน':'เลือกโครงการก่อน');}
function save(){const p=project();if(!p){toast('กรุณาเลือกโครงการก่อน');return;}if(typeof persist!=='function'||!persist()){toast('ไม่สามารถบันทึกได้ กรุณาสำรองข้อมูลเป็น JSON');return;}baseline=clone(p.product||{});projectId=p.id;dirty=false;status('✓ บันทึกข้อมูลแล้ว · '+new Date().toLocaleTimeString('th-TH'));toast('บันทึก Product Blueprint แล้ว');}
function cancel(){const p=project();if(!p||!baseline||p.id!==projectId){toast('ไม่มีข้อมูลที่ต้องยกเลิก');return;}if(!dirty){toast('ไม่มีการแก้ไขใหม่');return;}if(!confirm('ยกเลิกการแก้ไขล่าสุด และย้อนกลับไปยังจุดที่กด Save ครั้งก่อนหรือเมื่อเปิดหน้านี้?'))return;mutate(p,x=>{x.product=clone(baseline)});renderProduct();dirty=false;status('↶ ยกเลิกการแก้ไขล่าสุดแล้ว');toast('คืนค่าข้อมูลก่อนแก้ไขแล้ว');}
function install(){
 const root=$('productFields');if(!root)return;
 const panel=document.createElement('div');panel.className='blueprint-edit-actions';
 panel.innerHTML='<div><strong>จัดการ Product Blueprint</strong><small id="blueprintEditStatus" role="status">ข้อมูลบันทึกอัตโนมัติในเบราว์เซอร์</small></div><div class="blueprint-buttons"><button type="button" class="primary" id="blueprintSave">💾 Save / บันทึก</button><button type="button" class="outlinebtn" id="blueprintCancel">↶ Cancel / ยกเลิก</button></div>';
 const anchor=root.closest('.panel')||root.parentElement;
 anchor.appendChild(panel);
 $('blueprintSave').onclick=save;$('blueprintCancel').onclick=cancel;
 // Listen for edits throughout the blueprint, including dynamically rendered feature rows.
 const page=$('product');
 page.addEventListener('input',e=>{if(!project()||project().id!==projectId)return;if(e.target.closest('#productFields,#featureRows,#featureInput')){dirty=true;status('● มีการแก้ไข · กด Save เพื่อกำหนดจุดย้อนกลับ');}});
 page.addEventListener('change',e=>{if(!project()||project().id!==projectId)return;if(e.target.closest('#productFields,#featureRows,#productChecklist')){dirty=true;status('● มีการแก้ไข · กด Save เพื่อกำหนดจุดย้อนกลับ');}});
 const selector=$('productProject');selector?.addEventListener('change',()=>setTimeout(capture,0));
 const observer=new MutationObserver(()=>{const p=project();if(p?.id!==projectId)capture();});
 observer.observe(selector,{childList:true});
 // Capture once on page load. Selecting another project resets the cancel checkpoint.
 capture();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install);else install();
})();