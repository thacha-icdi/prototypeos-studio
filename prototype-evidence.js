'use strict';
/* Per-project guided prototype demonstration and evidence. Local-only, no fabricated results. */
(()=>{
const key=id=>'prototypeos.evidence.'+id;
const get=id=>{try{return JSON.parse(localStorage.getItem(key(id))||'{}')}catch{return {}}};
window.prototypeEvidence={get};
const $=id=>document.getElementById(id);
const fields=[['evMethod','method'],['evMaterials','materials'],['evSteps','steps'],['evParticipants','participants'],['evMetric','metric'],['evResult','result'],['evEvidence','evidence'],['evDecision','decision']];
function install(){
 const page=$('product');if(!page)return;
 const panel=document.createElement('section');panel.className='panel evidence-panel';
 panel.innerHTML='<div class="panelhead"><h3>6. แผนการทดลอง ผลการทดสอบ และหลักฐาน</h3><span class="step">TEST & EVIDENCE</span></div><p class="helper">ทำตามลำดับ: วางแผน → ทดลองจริง → บันทึกผล → แนบหลักฐาน → สรุปการปรับปรุง รายงาน PDF จะใช้ข้อมูลที่บันทึกไว้</p><div class="evidence-guide"><strong>ตัวอย่างสำหรับยาหม่องสมุนไพร</strong><p>สาธิตบรรจุภัณฑ์และวิธีเปิด–ปิดกระปุก ประเมินความสะดวกในการใช้งานกับกลุ่มเป้าหมาย บันทึกจำนวนผู้ทดลองและผลตามจริง ส่วนการทดสอบความปลอดภัยต้องใช้วิธีและผู้เชี่ยวชาญที่เหมาะสมแยกต่างหาก</p></div><div class="evidence-grid"><label>1. จะสาธิตหรือทดสอบอะไร?<textarea id="evMethod" placeholder="เช่น ประเมินความสะดวกในการเปิด–ปิดกระปุกต้นแบบ"></textarea></label><label>2. อุปกรณ์หรือต้นแบบที่ใช้<textarea id="evMaterials" placeholder="เช่น กระปุกตัวอย่าง ฉลาก แบบประเมิน"></textarea></label><label>3. ขั้นตอนการทดลอง<textarea id="evSteps" placeholder="เช่น อธิบายงาน → ให้ทดลองเปิดกระปุก → สังเกต → สอบถาม"></textarea></label><label>4. ผู้ทดลอง / จำนวนคน<input id="evParticipants" placeholder="เช่น ผู้ใช้เป้าหมาย 5 คน (กรอกเฉพาะเมื่อทดลองจริง)"></label><label>5. ตัวชี้วัดความสำเร็จ<input id="evMetric" placeholder="เช่น เปิดกระปุกได้สำเร็จภายใน 15 วินาที"></label><label>6. ผลที่พบจริง<textarea id="evResult" placeholder="เช่น จำนวนผู้ที่ทำสำเร็จ เวลาเฉลี่ย และข้อสังเกต — อย่าคาดเดาผล"></textarea></label><label>7. หลักฐานที่เก็บไว้<textarea id="evEvidence" placeholder="เช่น รูปต้นแบบ A, แบบประเมินหมายเลข 01–05, วันที่ทดสอบ"></textarea></label><label>8. จะปรับปรุงอะไรต่อ?<textarea id="evDecision" placeholder="เช่น ปรับฝาให้จับง่ายขึ้น แล้วทดลองซ้ำ"></textarea></label></div><div class="evidence-image"><label>ภาพต้นแบบ / หลักฐานภาพ (ไม่บังคับ)<input id="evImage" type="file" accept="image/png,image/jpeg,image/webp"></label><img id="evImagePreview" alt="ภาพต้นแบบที่แนบ" hidden><button type="button" id="evRemoveImage" class="outlinebtn">ลบภาพ</button><small>ภาพถูกย่อก่อนบันทึกในเบราว์เซอร์นี้ ไม่อัปโหลดขึ้น GitHub หรือเซิร์ฟเวอร์ กรุณาสำรองภาพต้นฉบับแยกต่างหาก</small></div><div class="reflection-actions"><button type="button" class="primary" id="evSave">💾 บันทึกการทดลอง</button><button type="button" class="outlinebtn" id="evCancel">↶ ยกเลิกการแก้ไข</button><span id="evStatus" role="status"></span></div>';
 const anchor=$('product').querySelector('.reflection-panel')||$('product').querySelector('.advanced-planning')||$('product').querySelector('.workingbar');
 anchor.insertAdjacentElement('beforebegin',panel);
 const mockupSlot=$('productMockupUpload');
 const imageWidget=panel.querySelector('.evidence-image');
 if(mockupSlot&&imageWidget){mockupSlot.appendChild(imageWidget);imageWidget.querySelector('label').firstChild.textContent='Upload Product Mockup / อัปโหลดภาพต้นแบบผลิตภัณฑ์';}

 const balmPlan={
  method:'ทดสอบความสะดวกในการใช้งานยาหม่อง Pain Relief สำหรับพนักงานออฟฟิศ โดยประเมินการเปิด–ปิดตลับ การพกพา ความสะดวกในการทา และความเหมาะสมของกลิ่นอ่อนในพื้นที่ทำงานร่วมกัน (ไม่ใช่การทดสอบประสิทธิผลทางการแพทย์)',
  materials:'ต้นแบบยาหม่อง Pain Relief ในตลับพกพา ฉลากส่วนผสมและคำเตือน แบบประเมินความพึงพอใจ แบบบันทึกเวลาการเปิด–ปิดตลับ และอุปกรณ์จับเวลา',
  steps:'1. ชี้แจงวัตถุประสงค์และขอความยินยอม 2. ให้ผู้ร่วมทดสอบดูและทดลองเปิด–ปิดตลับ 3. ประเมินความสะดวกในการพกพาและการใช้งาน 4. ให้ประเมินความเหมาะสมของกลิ่นจากตัวอย่างโดยสมัครใจ 5. บันทึกเวลา คะแนน และข้อเสนอแนะตามจริง หลีกเลี่ยงการใช้บนผิวหนังจนกว่าจะตรวจสอบสูตรและความปลอดภัยอย่างเหมาะสม',
  participants:'แผนรับสมัครพนักงานออฟฟิศ 5 คน ที่ใช้คอมพิวเตอร์เป็นเวลานาน (ยังไม่ได้ดำเนินการทดลอง)',
  metric:'เป้าหมาย: ผู้เข้าร่วมอย่างน้อย 4 ใน 5 คนเปิด–ปิดตลับได้ภายใน 15 วินาที; คะแนนความสะดวกและความเหมาะสมของกลิ่นเฉลี่ยไม่น้อยกว่า 4/5; บันทึกผลจริงหลังทดลอง',
  decision:'หลังทดลอง วิเคราะห์คะแนนและข้อเสนอแนะเพื่อปรับกลิ่นให้เหมาะกับพื้นที่ทำงาน ปรับฝาตลับให้เปิดง่าย และปรับเนื้อบาล์มให้เกลี่ยง่ายและเหนียวน้อย ก่อนทดสอบซ้ำ'
 };
 const activeProject=()=>typeof active==='function'?active('product'):null;
 let current=null,image='';
 function load(){const p=activeProject();current=p?.id||null;const d=current?get(current):{};const isBalm=p?.name==='ยาหม่อง pain relief';const display={...d};if(isBalm){for(const [k,v] of Object.entries(balmPlan)){if(!display[k])display[k]=v;}}fields.forEach(([id,k])=>$(id).value=display[k]||'');image=d.image||'';$('evImagePreview').src=image||'';$('evImagePreview').hidden=!image;$('evStatus').textContent='พร้อมบันทึก';$('evImage').value='';}
 function save(){const p=activeProject();if(!p)return;const d={};fields.forEach(([id,k])=>d[k]=$(id).value.trim());d.image=image;d.savedAt=new Date().toISOString();try{localStorage.setItem(key(p.id),JSON.stringify(d));$('evStatus').textContent='✓ บันทึกแล้ว';if(typeof toast==='function')toast('บันทึกข้อมูลการทดลองแล้ว')}catch(e){$('evStatus').textContent='พื้นที่บันทึกไม่เพียงพอ กรุณาลดขนาดภาพ';}}
 $('evSave').onclick=save;$('evCancel').onclick=load;
 fields.forEach(([id])=>$(id).addEventListener('input',()=>{$('evStatus').textContent='มีการแก้ไขที่ยังไม่ได้บันทึก'}));
 $('evRemoveImage').onclick=()=>{image='';$('evImagePreview').hidden=true;$('evImage').value='';$('evStatus').textContent='ภาพถูกลบจากแบบฟอร์ม กดบันทึกเพื่อยืนยัน'};
 $('evImage').onchange=()=>{const file=$('evImage').files?.[0];if(!file)return;if(!['image/jpeg','image/png','image/webp'].includes(file.type)||file.size>12*1024*1024){$('evStatus').textContent='ใช้ภาพ JPG/PNG/WebP ขนาดไม่เกิน 12 MB';return;}const reader=new FileReader();reader.onload=()=>{const img=new Image();img.onload=()=>{const ratio=Math.min(1,1000/Math.max(img.width,img.height));const canvas=document.createElement('canvas');canvas.width=Math.round(img.width*ratio);canvas.height=Math.round(img.height*ratio);canvas.getContext('2d').drawImage(img,0,0,canvas.width,canvas.height);image=canvas.toDataURL('image/jpeg',.7);$('evImagePreview').src=image;$('evImagePreview').hidden=false;$('evStatus').textContent='เพิ่มภาพแล้ว กดบันทึกเพื่อเก็บข้อมูล'};img.src=reader.result};reader.readAsDataURL(file)};
 $('productProject')?.addEventListener('change',()=>setTimeout(load,0));
 document.querySelector('[data-view="product"]')?.addEventListener('click',()=>{if(activeProject()?.id!==current)load()});
 load();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install);else install();
})();