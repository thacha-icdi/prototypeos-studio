'use strict';
/* Presentation mode: project-specific 7-slide storytelling, browser print/PDF, live demo link. */
(()=>{
const $=id=>document.getElementById(id);
const safe=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const txt=x=>safe(x||'ยังไม่ได้ระบุข้อมูล').replace(/\n/g,'<br>');
const n=x=>Number(x)||0;
let index=0,slides=[],type='product';
const names={product:'Product',process:'Process',business:'Business'};
function get(){return typeof active==='function'?active(type):null;}
function card(label,value){return '<div class="present-card"><small>'+safe(label)+'</small><p>'+txt(value)+'</p></div>';}
function build(p){
 const d=p.product||{},features=(d.features||[]).filter(f=>f.name),experiments=p.experiments||[];
 const rows=features.length?features.map((f,i)=>'<div class="present-feature"><span>'+String(i+1).padStart(2,'0')+'</span><b>'+safe(f.name)+'</b></div>').join(''):'<p>เพิ่มฟีเจอร์ใน Product Blueprint เพื่อแสดงรายการ</p>';
 const ev=experiments.length?experiments.slice(0,4).map(e=>card(e.hypothesis||'Test',e.evidence||'ยังไม่มีหลักฐาน')).join(''):'<p class="present-notice">ยังไม่มีข้อมูลการทดสอบจริง กรุณาทดลองกับผู้ใช้และบันทึกผลก่อนสรุปว่าผลิตภัณฑ์ใช้งานได้ดี</p>';
 const screens='<div class="present-screens"><div><span>01</span><b>Home</b><p>หน้าหลัก</p></div><div><span>02</span><b>Browse</b><p>เลือกบริการหรือสินค้า</p></div><div><span>03</span><b>Confirm</b><p>ยืนยันรายการ</p></div><div><span>04</span><b>Success</b><p>แสดงผลลัพธ์</p></div></div>';
 return [
 ['PRODUCT CONCEPT','เรากำลังสร้างอะไร?','<h2>'+safe(p.name)+'</h2><p class="present-lead">'+txt(p.description||d.solution)+'</p><div class="present-tag">Product Prototype · Concept Demonstration</div>'],
 ['PROBLEM & USERS','ทำไมต้องมีผลิตภัณฑ์นี้?',card('กลุ่มผู้ใช้เป้าหมาย',d.audience)+card('ปัญหาที่ต้องแก้',d.problem)+card('วิธีแก้ปัญหาที่เสนอ',d.solution)],
 ['PRODUCT DESIGN','ผลิตภัณฑ์หน้าตาอย่างไร?','<p>แผนผังหน้าจอสำหรับอธิบายแนวคิด ไม่ใช่ภาพหน้าจอของแอปที่พัฒนาเสร็จแล้ว</p>'+screens],
 ['FEATURES','ผลิตภัณฑ์ทำอะไรได้บ้าง?',rows+card('จุดเด่นที่แตกต่าง',d.value)],
 ['LIVE DEMO','กดทดลองผลิตภัณฑ์', '<div class="present-demo">📱<h2>ลองใช้งานต้นแบบ</h2><p>Home → เลือกรายการ → ตรวจสอบ → Confirm → Success</p><button id="presentDemo" class="present-action">▶ เปิดต้นแบบที่กดทดลองได้</button><p class="present-note">การทำงานเป็นการจำลอง ไม่มีการซื้อหรือจองจริง</p></div>'],
 ['TESTING & FEEDBACK','ทดลองแล้วได้ผลอย่างไร?',ev],
 ['NEXT ITERATION','ต้องพัฒนาอะไรต่อ?',card('สิ่งที่ควรตรวจสอบ','ทดสอบกับกลุ่มผู้ใช้เป้าหมาย และบันทึกข้อผิดพลาดจริง')+card('การปรับปรุง','ปรับขั้นตอนและหน้าจอตามผลการทดสอบ')+card('ข้อเสนอคุณค่า',d.value)]
 ];
}
function other(p){
 if(type==='process'){const steps=p.process?.steps||[],before=steps.reduce((a,s)=>a+n(s.beforeTime),0),after=steps.reduce((a,s)=>a+n(s.afterTime),0);return [['PROCESS CONCEPT','กระบวนการนี้คืออะไร?',card('ชื่อกระบวนการ',p.name)+card('ปัญหาปัจจุบัน',p.process?.current)],['CURRENT WORKFLOW','ขั้นตอนก่อนปรับปรุง',steps.map((s,i)=>card((i+1)+'. '+s.name,n(s.beforeTime)+' นาที')).join('')],['IMPROVED WORKFLOW','ขั้นตอนหลังปรับปรุง',steps.map((s,i)=>card((i+1)+'. '+s.name,n(s.afterTime)+' นาที')).join('')],['COMPARISON','ดีขึ้นอย่างไร?',card('ก่อนปรับปรุง',before+' นาที')+card('หลังปรับปรุง',after+' นาที')+card('ลดเวลาลง',before?((before-after)/before*100).toFixed(1)+'%':'ไม่มีข้อมูล')],['TEST & LEARN','ต้องทดสอบอะไร?',card('ข้อควรระวัง','ผลนี้เป็นการคำนวณจากค่าที่กรอก ยังไม่ใช่ผลทดสอบกระบวนการจริง')]];}
 const f=p.business?.finance||{},c=p.business?.canvas||{},profit=(n(f.price)-n(f.variableCost))*n(f.customers)-n(f.fixedCost);
 return [['BUSINESS CONCEPT','ธุรกิจนี้คืออะไร?',card('ชื่อธุรกิจ',p.name)+card('คำอธิบาย',p.description)],['CUSTOMER & VALUE','ลูกค้าคือใคร?',card('กลุ่มลูกค้า',c.segments)+card('คุณค่าที่นำเสนอ',c.value)],['BUSINESS MODEL','ธุรกิจทำงานอย่างไร?',card('ช่องทาง',c.channels)+card('รายได้',c.revenue)+card('ต้นทุน',c.cost)],['SCENARIO','ผลลัพธ์ทางการเงิน',card('ลูกค้าต่อเดือน',f.customers)+card('ราคาต่อลูกค้า','฿'+n(f.price).toLocaleString())+card('กำไรประมาณการ','฿'+profit.toLocaleString())],['VALIDATE','จะพิสูจน์ธุรกิจอย่างไร?',card('ข้อควรระวัง','ตัวเลขเป็นเพียงสมมติฐาน ต้องทดสอบความต้องการซื้อจริงก่อนสรุป')]];
}
function render(){
 const p=get();if(!p)return;
 const s=slides[index];$('presentIndex').textContent=(index+1)+' / '+slides.length;
 $('presentKicker').textContent=s[0];$('presentTitle').textContent=s[1];$('presentContent').innerHTML=s[2];
 $('presentPrev').disabled=index===0;$('presentNext').disabled=index===slides.length-1;
 $('presentDots').innerHTML=slides.map((_,i)=>'<button class="'+(i===index?'selected':'')+'" data-slide="'+i+'" aria-label="Slide '+(i+1)+'"></button>').join('');
 $('presentDemo')?.addEventListener('click',()=>{close();view('product');document.getElementById('productPrototypeStudio')?.scrollIntoView({behavior:'smooth'});});
}
function open(t){type=t;const p=get();if(!p){toast('กรุณาเลือกหรือสร้างโครงการก่อน');return;}slides=t==='product'?build(p):other(p);index=0;$('presentOverlay').hidden=false;document.body.classList.add('presentation-open');render();}
function close(){$('presentOverlay').hidden=true;document.body.classList.remove('presentation-open');}
function print(){const p=get();if(!p)return;const styles='<style>@page{size:A4 landscape;margin:10mm}body{font-family:Arial,"Noto Sans Thai",sans-serif;color:#16213b}.slide{height:180mm;box-sizing:border-box;page-break-after:always;padding:20mm;background:#fafaff;border:1px solid #ddd}h1{font-size:28pt}h2{font-size:22pt}small{color:#6c57db}.present-card{display:inline-block;vertical-align:top;width:42%;padding:12px;margin:8px;border:1px solid #ddd;border-radius:12px}.present-card p{font-size:13pt}.present-feature{padding:12px;border-bottom:1px solid #ddd}.present-feature span{margin-right:16px}.present-screens{display:flex;gap:10px}.present-screens div{padding:18px;border:1px solid #ccc;flex:1}.present-action{display:none}.present-notice{padding:16px;background:#fff3e5}</style>';
 const body=slides.map((s,i)=>'<section class="slide"><small>'+safe(s[0])+' · '+(i+1)+' / '+slides.length+'</small><h1>'+safe(s[1])+'</h1>'+s[2]+'</section>').join('');
 const w=window.open('','_blank');if(!w){toast('กรุณาอนุญาต Pop-up เพื่อพิมพ์');return;}w.document.open();w.document.write('<!doctype html><html lang="th"><head><meta charset="utf-8"><title>'+safe(p.name)+' Presentation</title>'+styles+'</head><body>'+body+'</body></html>');w.document.close();w.addEventListener('load',()=>w.print(),{once:true});}
function install(){
 const root=document.createElement('div');root.id='presentOverlay';root.hidden=true;root.innerHTML='<div class="present-shell" role="dialog" aria-modal="true" aria-label="Prototype presentation"><header><strong>PrototypeOS · Presentation</strong><span id="presentIndex"></span><button id="presentPrint">🖨 Print / Save PDF</button><button id="presentClose" aria-label="Close presentation">✕ Close</button></header><main class="present-slide"><div class="present-institution">International College of Digital Innovation · Chiang Mai University</div><div id="presentKicker"></div><h1 id="presentTitle"></h1><div id="presentContent"></div><footer>By Assoc. Prof. Dr. Thacha Lawanna</footer></main><nav><button id="presentPrev">← Previous</button><div id="presentDots"></div><button id="presentNext">Next →</button></nav></div>';
 document.body.append(root);
 for(const t of ['product','process','business']){
 const bar=document.querySelector('#'+t+' .deliverable-tools');if(!bar)continue;
 const b=document.createElement('button');b.type='button';b.className='primary';b.textContent='▶ Present';b.title='นำเสนอผลงานแบบเต็มหน้าจอ';b.addEventListener('click',()=>open(t));bar.insertBefore(b,bar.querySelector('[data-action="print"]'));
 }
 $('presentClose').onclick=close;$('presentPrev').onclick=()=>{index--;render()};$('presentNext').onclick=()=>{index++;render()};$('presentPrint').onclick=print;
 $('presentDots').onclick=e=>{const b=e.target.closest('[data-slide]');if(b){index=Number(b.dataset.slide);render();}};
 document.addEventListener('keydown',e=>{if(root.hidden)return;if(e.key==='Escape')close();if(e.key==='ArrowRight'&&index<slides.length-1){index++;render();}if(e.key==='ArrowLeft'&&index>0){index--;render();}});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install);else install();
})();