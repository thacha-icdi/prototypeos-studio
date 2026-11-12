'use strict';
/* Project-aware product preview: physical products are not phone applications. */
(()=>{
const $=id=>document.getElementById(id);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const physical=p=>/balm|herbal|ยาหม่อง|สมุนไพร|packaging|บรรจุภัณฑ์|cosmetic|สบู่|ครีม|ผลิตภัณฑ์|เครื่องสำอาง|อาหาร|น้ำหอม/i.test([p.name,p.description,p.product?.solution,...(p.product?.features||[]).map(f=>f.name)].join(' '));
let showing=null;
function render(){
 const p=typeof active==='function'?active('product'):null,holder=$('physicalProductPreview'),demo=$('productPrototypeStudio'),quick=document.querySelector('#product .prototype-quickstart');
 if(!holder||!demo)return;
 if(!p){holder.hidden=true;demo.hidden=false;return;}
 const isPhysical=physical(p);
 holder.hidden=!isPhysical;demo.hidden=isPhysical;
 if(quick)quick.innerHTML=isPhysical?'<strong>ต้นแบบผลิตภัณฑ์ของคุณ</strong><span>1. ดูภาพแนวคิด → 2. ตรวจสอบองค์ประกอบ → 3. ออกแบบ/ถ่ายภาพต้นแบบจริง → 4. นำเสนอและบันทึกผล</span>':'<strong>ต้นแบบแอปตัวอย่าง (Digital demo)</strong><span>ต้นแบบนี้เป็นตัวอย่างสำหรับฝึกทดลอง ไม่ได้สร้างจากโครงการที่เลือกโดยอัตโนมัติ</span>';
 if(!isPhysical)return;
 const d=p.product||{},features=d.features||[];
 $('physicalProductName').textContent=p.name;
 $('physicalProductConcept').textContent=d.value||d.solution||'กรุณาเพิ่มแนวคิดผลิตภัณฑ์ใน Product Blueprint';
 $('physicalProductAudience').textContent=d.audience||'ยังไม่ได้ระบุกลุ่มเป้าหมาย';
 $('physicalProductProblem').textContent=d.problem||'ยังไม่ได้ระบุปัญหา';
 $('physicalProductFeatures').innerHTML=features.length?features.map((f,i)=>'<li><b>'+(i+1)+'. '+esc(f.name)+'</b></li>').join(''):'<li>เพิ่มองค์ประกอบต้นแบบใน Product Blueprint</li>';
 $('physicalProductCaption').textContent='ภาพจำลองแนวคิดของ '+p.name+' — ไม่ใช่ภาพผลิตภัณฑ์จริง';
 showing=p.id;
}
function install(){
 const demo=$('productPrototypeStudio');if(!demo)return;
 const panel=document.createElement('section');panel.id='physicalProductPreview';panel.className='physical-preview prototype-studio';panel.hidden=true;
 panel.innerHTML='<div class="panelhead"><h3>📦 ดูต้นแบบผลิตภัณฑ์ของคุณ / Your Product</h3><span class="step">PHYSICAL PRODUCT CONCEPT</span></div><p class="helper">หน้านี้แสดงแนวคิดผลิตภัณฑ์ที่เลือก ไม่ใช่แอปจองบริการ หากต้องการต้นแบบที่สมบูรณ์ ต้องออกแบบและทดสอบชิ้นงานจริง</p><div class="physical-preview-grid"><div class="physical-object"><div class="physical-lid"></div><div class="physical-jar"><div class="physical-label"><strong id="physicalProductName"></strong><small>PRODUCT CONCEPT</small></div></div><p id="physicalProductCaption"></p></div><div class="physical-story"><h3>ผลิตภัณฑ์นี้คืออะไร?</h3><p id="physicalProductConcept"></p><h4>สร้างเพื่อใคร?</h4><p id="physicalProductAudience"></p><h4>แก้ปัญหาอะไร?</h4><p id="physicalProductProblem"></p><h4>องค์ประกอบที่ต้องพัฒนา</h4><ol id="physicalProductFeatures"></ol><div class="physical-preview-actions"><button type="button" class="primary" id="physicalViewBlueprint">✎ แก้ไขรายละเอียดผลิตภัณฑ์</button><button type="button" class="outlinebtn" id="physicalPresent">▶ Present / นำเสนอ</button><button type="button" class="outlinebtn" id="physicalPrint">🖨 Print / PDF</button></div></div></div>';
 demo.parentElement.insertBefore(panel,demo);
 $('physicalViewBlueprint').onclick=()=>{const details=document.querySelector('#product .advanced-planning');if(details)details.open=true;details?.scrollIntoView({behavior:'smooth',block:'start'});};
 $('physicalPresent').onclick=()=>document.querySelector('#product .deliverable-tools button.primary:not([data-action])')?.click();
 $('physicalPrint').onclick=()=>document.querySelector('#product .deliverable-tools [data-action="pdf"]')?.click();
 const selector=$('productProject');selector?.addEventListener('change',()=>setTimeout(render,0));
 document.querySelector('[data-view="product"]')?.addEventListener('click',()=>setTimeout(render,0));
 document.querySelector('#product .advanced-planning')?.addEventListener('input',()=>setTimeout(render,150));
 document.querySelector('#product .advanced-planning')?.addEventListener('change',()=>setTimeout(render,100));
 render();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install);else install();
})();