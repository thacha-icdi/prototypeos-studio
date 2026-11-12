'use strict';
/* Classroom deliverables: Save locally, JSON backup, print and PDF via native print dialog. */
(()=>{
const types=['product','process','business'];
const labels={product:'Product Prototyping',process:'Process Prototyping',business:'Business Prototyping'};
const $r=id=>document.getElementById(id);
const escapeHtml=value=>String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const val=x=>Number(x)||0;
const baht=x=>'฿'+Math.round(x).toLocaleString('th-TH');
const lines=x=>escapeHtml(x||'—').replace(/\n/g,'<br>');
function get(type){return typeof active==='function'?active(type):null;}
function row(label,value){return '<tr><th>'+escapeHtml(label)+'</th><td>'+lines(value)+'</td></tr>';}
function table(rows){return '<table class="report-table">'+rows.join('')+'</table>';}
function details(p,type){
 if(type==='product'){
 const d=p.product||{},features=d.features||[];
 const thaiBalm={
 audience:'พนักงานออฟฟิศที่มีอาการไม่สบายบริเวณคอและไหล่จากการทำงานหน้าคอมพิวเตอร์เป็นเวลานาน',
 problem:'พนักงานออฟฟิศมักรู้สึกตึงบริเวณคอและไหล่หลังใช้คอมพิวเตอร์เป็นเวลานาน และต้องการผลิตภัณฑ์ที่สะดวกต่อการใช้ระหว่างทำงาน',
 solution:'พัฒนายาหม่องทาภายนอกขนาดพกพา เพื่อช่วยบรรเทาความไม่สบายเล็กน้อยบริเวณคอและไหล่',
 value:'ยาหม่องขนาดพกพาที่มีกลิ่นอ่อน ใช้งานสะดวกบนโต๊ะทำงาน และเหมาะสำหรับพื้นที่ทำงานร่วมกัน'
 };
 const englishSamples={
 audience:'Office workers who experience neck and shoulder discomfort after long hours at a computer.',
 problem:'After hours at a computer, office workers often feel tension in their neck and shoulders and want something convenient to apply at their desk.',
 solution:'A pocket-sized topical balm designed to soothe minor neck and shoulder discomfort.',
 value:'Desk-friendly comfort in a pocket-sized balm with a mild scent, designed for use in shared workspaces.'
 };
 const isBalm=/ยาหม่อง|pain\s*relief|balm/i.test([p.name,p.description].join(' '));
 const reportField=k=>{
  const v=String(d[k]||'').trim();
  if(!isBalm)return v;
  if(v===englishSamples[k] || (v && /^[A-Za-z]/.test(v) && (v.includes('office workers')||v.includes('Office workers')||v.includes('topical balm')||v.includes('Desk-friendly'))))return thaiBalm[k];
  return v;
 };

 const physical=/balm|herbal|ยาหม่อง|สมุนไพร|packaging|บรรจุภัณฑ์|cosmetic|สบู่|อาหาร|ครีม|ผลิตภัณฑ์ทางกายภาพ/i.test([p.name,p.description,d.solution,...features.map(f=>f.name)].join(' '));
 const explainFeature=(name)=>{
 const n=String(name||'').toLowerCase();
 const sample=[
 ['ทดลองกลิ่นอ่อนสำหรับใช้ในออฟฟิศ','ตัวอย่างแผน: เตรียมยาหม่องกลิ่นอ่อน 3 ระดับ (อ่อนมาก อ่อน ปานกลาง) ให้พนักงานออฟฟิศ 5 คนประเมินความเหมาะสมของกลิ่นในพื้นที่ทำงานร่วมกันด้วยคะแนน 1–5 โดยยังไม่สรุปผลก่อนทดลอง','ตัวอย่างสิ่งส่งมอบ: ภาพตัวอย่างทั้ง 3 ระดับ แบบประเมินกลิ่น ตารางเปรียบเทียบคะแนน และสรุปความคิดเห็น (รอผลจริง)'],
 ['ออกแบบตลับขนาดพกพา เปิดและปิดง่าย','ตัวอย่างแผน: ออกแบบตลับ 2 รูปแบบ เปรียบเทียบขนาด น้ำหนัก ความสะดวกในการพก และจับเวลาเปิด–ปิดกับผู้ใช้เป้าหมาย 5 คน','ตัวอย่างสิ่งส่งมอบ: ภาพร่างและภาพจำลองตลับ 2 แบบ ตารางเวลาเปิด–ปิด และแบบประเมินความสะดวก (รอผลจริง)'],
 ['ทดลองเนื้อบาล์มที่เกลี่ยง่ายและเหนียวน้อย','ตัวอย่างแผน: เตรียมตัวอย่างเนื้อบาล์ม 2 สูตรเพื่อเปรียบเทียบความหนืดและการเกลี่ย พร้อมตรวจสอบส่วนผสมและความปลอดภัยก่อนการทดสอบบนผิวหนัง','ตัวอย่างสิ่งส่งมอบ: ภาพเนื้อบาล์มแต่ละสูตร แบบบันทึกความหนืดและการเกลี่ย และแบบประเมินเมื่อทดสอบอย่างปลอดภัย (รอผลจริง)']
 ];
 const normalized=s=>String(s||'').toLowerCase().replace(/\s+/g,'').replace(/[^a-z0-9\u0e00-\u0e7f]/g,'');
 const found=sample.find(x=>normalized(x[0])===normalized(name))
   ||(n.includes('กลิ่นอ่อน')?sample[0]:null)
   ||(n.includes('ตลับ')?sample[1]:null)
   ||(n.includes('เนื้อบาล์ม')?sample[2]:null);
 if(found)return [found[1],found[2]];

 // Illustrative development plans, not claims of completed experiments.
 if(/กลิ่น|scent|fragrance|aroma/.test(n))return ['ตัวอย่างแผน: เตรียมตัวอย่างกลิ่นอ่อน 2–3 ระดับสำหรับบริบทออฟฟิศ ให้กลุ่มเป้าหมายประเมินความเหมาะสมของกลิ่นและความรบกวนต่อผู้อื่นด้วยแบบสอบถาม 1–5 คะแนน','ตัวอย่างสิ่งส่งมอบที่ควรจัดทำ: ภาพตัวอย่างกลิ่นแต่ละระดับ ตารางเปรียบเทียบคะแนน และสรุปข้อเสนอแนะ (รอเก็บผลจริง)'];
 if(/ตลับ|พกพา|เปิด|ปิด|กระปุก|container|jar|portable/.test(n))return ['ตัวอย่างแผน: ออกแบบตลับขนาดพกพา 2 แบบ เปรียบเทียบรูปทรงและฝาปิด ให้ผู้ใช้ทดลองเปิด–ปิดพร้อมจับเวลาและให้คะแนนความสะดวก','ตัวอย่างสิ่งส่งมอบที่ควรจัดทำ: ภาพร่างและภาพจำลองตลับ 2 แบบ ตารางเวลาเปิด–ปิด และแบบประเมินการใช้งาน (รอเก็บผลจริง)'];
 if(/เนื้อบาล์ม|เกลี่ย|เหนียว|texture|greasy|balm/.test(n))return ['ตัวอย่างแผน: พัฒนาต้นแบบเนื้อบาล์มที่เกลี่ยง่ายและเหนียวน้อย เปรียบเทียบความรู้สึกขณะใช้งานภายใต้การตรวจสอบส่วนผสมและความปลอดภัยที่เหมาะสม','ตัวอย่างสิ่งส่งมอบที่ควรจัดทำ: ภาพลักษณะเนื้อบาล์มแต่ละสูตร แบบบันทึกความหนืดหรือการเกลี่ย และแบบประเมินความรู้สึกหลังใช้เมื่อได้รับอนุญาตให้ทดสอบอย่างปลอดภัย (ยังไม่มีผลจริง)'];
 if(/formula|สูตร|ingredient|ส่วนผสม/.test(n))return ['กำหนดส่วนผสมและทดลองสูตรต้นแบบ','รายละเอียดสูตรและภาพตัวอย่างที่ทำจริง'];
 if(/safety|ปลอดภัย|testing|ทดสอบ/.test(n))return ['ตรวจสอบข้อมูลส่วนผสม วางแผนและดำเนินการทดสอบความปลอดภัยตามข้อกำหนด','รายการตรวจสอบและหลักฐานผลทดสอบจริง (ถ้ามี)'];
 if(/packag|บรรจุ|ฉลาก|label|design/.test(n))return ['ออกแบบรูปทรงกระปุก ฉลาก สี และข้อมูลที่ต้องแสดง','ภาพแบบร่างหรือภาพบรรจุภัณฑ์ต้นแบบ'];
 return ['อธิบายสิ่งที่จะพัฒนา วิธีทำ และวิธีประเมินผล','ภาพหรือเอกสารที่แสดงผลการพัฒนาจริง'];
 };
 const riceScore=f=>{const reach=val(f.reach),impact=val(f.impact),confidence=val(f.confidence),effort=val(f.effort);return effort>0?(reach*impact*(confidence/100)/effort):0;};
 const featureSummary=features.length?'<h2>3. Feature Prioritization &amp; RICE</h2><p class="section-lead">ลำดับความสำคัญของสิ่งที่จะพัฒนา โดยใช้ Reach × Impact × Confidence ÷ Effort</p><table class="report-table rice-table"><thead><tr><th>รายการพัฒนา</th><th>Reach</th><th>Impact</th><th>Confidence</th><th>Effort</th><th>RICE</th></tr></thead><tbody>'+[...features].sort((a,b)=>riceScore(b)-riceScore(a)).map(f=>'<tr><td><strong>'+escapeHtml(f.name)+'</strong></td><td>'+val(f.reach)+'</td><td>'+val(f.impact)+'</td><td>'+val(f.confidence)+'%</td><td>'+val(f.effort)+'</td><td><strong>'+Number(riceScore(f).toFixed(1))+'</strong></td></tr>').join('')+'</tbody></table>':'<h2>3. Feature Prioritization &amp; RICE</h2><p class="report-pending">ยังไม่มีรายการจัดลำดับความสำคัญ</p>';
 const featureRows=features.length?'<table class="report-table report-feature-table"><thead><tr><th style="width:24%">ขั้นตอน</th><th>ต้องทำอะไร?</th><th>ต้องแสดงผลงานอะไร?</th></tr></thead><tbody>'+features.map((f,i)=>{return '<tr><td><strong>'+(i+1)+'. '+escapeHtml(f.name)+'</strong></td><td>'+escapeHtml(f.action||'ยังไม่ได้บันทึก')+'</td><td>'+escapeHtml(f.deliverable||'ยังไม่ได้บันทึก')+'</td></tr>';}).join('')+'</tbody></table><p class="muted">รายการข้างต้นเป็นแนวทางดำเนินงาน ไม่ใช่หลักฐานว่าทำเสร็จแล้ว กรุณาแนบผลการพัฒนาและการทดสอบจริงก่อนส่งงาน</p>':'<p class="report-pending">ยังไม่ได้กำหนดขั้นตอนการพัฒนาต้นแบบ</p>';
 const concept='<section class="report-hero"><div class="report-hero-kicker">PRODUCT PROTOTYPE · '+(physical?'PHYSICAL PRODUCT':'DIGITAL PRODUCT')+'</div><h3>'+escapeHtml(p.name)+'</h3><p>'+lines(d.value||d.solution)+'</p></section>';
 const uploadedMockup=window.prototypeEvidence?.get(p.id)?.image||'';
 const mockupSafe=/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(uploadedMockup);
 const visual=mockupSafe?'<figure class="evidence-photo"><img alt="Product mockup" src="'+uploadedMockup+'"><figcaption>ภาพต้นแบบผลิตภัณฑ์ที่ผู้จัดทำอัปโหลด / Uploaded product mockup</figcaption></figure>':physical?'<div class="report-physical"><div class="report-jar"><div class="report-jar-lid"></div><div class="report-jar-body"><strong>'+escapeHtml(p.name)+'</strong><small>CONCEPT MOCKUP</small></div></div><div class="report-visual-copy"><strong>ภาพแนวคิดผลิตภัณฑ์ (Conceptual mockup)</strong><p>ภาพจำลองบรรจุภัณฑ์เพื่อการนำเสนอเท่านั้น ไม่ใช่ภาพผลิตภัณฑ์จริง และไม่ยืนยันสูตร ส่วนประกอบ คุณภาพ หรือความปลอดภัย</p><p>ขั้นต่อไป: แนบภาพต้นแบบจริง / ภาพฉลาก / ภาพบรรจุภัณฑ์ และระบุขนาด วัสดุ และวิธีใช้</p></div></div>':'<div class="report-digital"><div class="report-device"><strong>'+escapeHtml(p.name)+'</strong><hr><p>Home</p><p>Browse</p><p>Details</p><p>Confirm</p></div><p>ตัวอย่างลำดับหน้าจอ (conceptual wireframe) ไม่ใช่หน้าจอจริงของโครงการ กรุณาแสดงต้นแบบที่พัฒนาขึ้นและทดสอบได้</p></div>';
 return concept+'<h2>1. แนวคิดและปัญหาที่ต้องการแก้ไข</h2>'+table([row('กลุ่มผู้ใช้เป้าหมาย',reportField('audience')),row('ปัญหาของผู้ใช้',reportField('problem')),row('แนวทางแก้ปัญหา',reportField('solution')),row('คุณค่าที่แตกต่าง',reportField('value'))])+'<h2>2. ภาพต้นแบบผลิตภัณฑ์</h2>'+visual+featureSummary+'<h2>4. แผนการพัฒนาต้นแบบและสิ่งส่งมอบ</h2>'+featureRows+'<h2>5. วิธีสาธิตและการทดลอง</h2>'+(Array.isArray(d.demoSteps)&&d.demoSteps.length?'<table class="report-table"><thead><tr><th>ขั้นตอน / Step</th><th>วิธีสาธิต / Method</th><th>สิ่งที่ต้องแสดง / Evidence</th></tr></thead><tbody>'+d.demoSteps.map((s,i)=>'<tr><td>'+(i+1)+'. '+escapeHtml(s.name||'ยังไม่ได้บันทึก')+'</td><td>'+escapeHtml(s.method||'ยังไม่ได้บันทึก')+'</td><td>'+escapeHtml(s.output||'ยังไม่ได้บันทึก')+'</td></tr>').join('')+'</tbody></table>':'<p class="report-pending">ยังไม่ได้บันทึกขั้นตอนการสาธิตใน Web</p>')
 }
 if(type==='process'){
 const d=p.process||{},steps=d.steps||[],before=steps.reduce((s,x)=>s+val(x.beforeTime),0),after=steps.reduce((s,x)=>s+val(x.afterTime),0);
 return '<h2>1. Process Blueprint</h2>'+table([row('Challenge',d.current),row('Improvement target',d.goal),row('Owner',d.owner),row('Cycles per month',d.volume)])+'<h2>2. Workflow steps</h2>'+table(steps.map((s,i)=>row((i+1)+'. '+s.name,'Before '+val(s.beforeTime)+' min / After '+val(s.afterTime)+' min; cost '+baht(s.beforeCost)+' → '+baht(s.afterCost))))+'<h2>3. Comparison</h2>'+table([row('Before',before+' minutes'),row('After',after+' minutes'),row('Time reduction',before?((before-after)/before*100).toFixed(1)+'%':'Not available')]);
 }
 const d=p.business||{},f=d.finance||{},c=d.canvas||{},margin=val(f.price)-val(f.variableCost),profit=margin*val(f.customers)-val(f.fixedCost);
 const names={partners:'Key partners',activities:'Key activities',resources:'Key resources',value:'Value proposition',relationships:'Customer relationships',channels:'Channels',segments:'Customer segments',cost:'Cost structure',revenue:'Revenue streams'};
 return '<h2>1. Business Model Canvas</h2>'+table(Object.entries(names).map(([key,name])=>row(name,c[key])))+'<h2>2. Financial scenario</h2>'+table([row('Price per customer / month',baht(f.price)),row('Variable cost / customer',baht(f.variableCost)),row('Fixed monthly cost',baht(f.fixedCost)),row('Expected customers',f.customers),row('Estimated monthly profit',baht(profit)),row('Break-even customers',margin>0?Math.ceil(val(f.fixedCost)/margin):'Not achievable at this price')])+'<p>Scenario calculations are estimates based on user-entered assumptions, not verified business outcomes.</p>';
}
function report(p,type){
 const name=escapeHtml(p.name),experiments=p.experiments||[];
 const reflection=window.prototypeReflection?.get(p.id)||{};

 const savedEvidence=type==='product'?(window.prototypeEvidence?.get(p.id)||{}):{};
 const evidence=savedEvidence;
 const pendingText='ยังไม่ได้บันทึก';
 const safeImage=typeof evidence.image==='string'&&/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(evidence.image)?evidence.image:'';
 return '<!doctype html><html lang="th"><head><meta charset="utf-8"><title>'+name+' — PrototypeOS Report</title><style>@page{size:A4;margin:17mm}body{font-family:Arial,"Noto Sans Thai",sans-serif;color:#182038;font-size:11pt;line-height:1.5}h1{font-size:22pt;margin:8px 0}h2{font-size:14pt;margin:24px 0 8px;color:#5144c6;border-bottom:1px solid #ddd;padding-bottom:6px}.report-head{border-bottom:3px solid #6857e8;padding-bottom:14px}.muted{color:#69748b}.report-table{width:100%;border-collapse:collapse;table-layout:fixed}.report-table th,.report-table td{border:1px solid #dce1ec;padding:8px;text-align:left;vertical-align:top;overflow-wrap:anywhere}.report-table th{background:#f3f2ff;width:33%}.meta{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:18px 0}.meta div{border-bottom:1px solid #aaa;padding:7px}.report-hero{background:#eeebff;padding:20px;border-radius:14px;margin:16px 0}.report-hero-kicker{font-size:9pt;letter-spacing:2px;color:#5844c6}.report-hero h3{font-size:20pt;margin:8px 0}.report-physical,.report-digital{display:flex;gap:25px;align-items:center;padding:25px;border:1px solid #d8dbea;border-radius:12px;break-inside:avoid}.report-jar{width:180px;min-width:180px;text-align:center}.report-jar-lid{background:#353a4b;border-radius:15px 15px 4px 4px;height:24px;margin:0 8px}.report-jar-body{height:130px;background:linear-gradient(130deg,#d7ba78,#f7e9b4);border:5px solid #b7a17b;border-radius:8px 8px 45px 45px;display:flex;flex-direction:column;justify-content:center;gap:12px;padding:8px;overflow-wrap:anywhere}.report-jar-body small{font-size:8pt}.report-visual-copy{flex:1}.report-device{border:5px solid #202638;border-radius:20px;padding:20px;width:150px;min-width:150px;background:#f6f4ff}.report-device p{border:1px solid #ddd;padding:6px}.report-pending{border-left:4px solid #d6a23d;padding:12px;background:#fff8e8}.evidence-photo{margin:18px 0;text-align:center;break-inside:avoid}.evidence-photo img{max-width:100%;max-height:120mm;object-fit:contain;border-radius:12px}.evidence-photo figcaption{font-size:9pt;color:#68748c}.report-head{position:relative;background:linear-gradient(130deg,#121a36 0%,#25265b 58%,#5747b3 100%);color:#fff;padding:28px 32px;border:0;border-radius:14px;margin-bottom:18px;break-inside:avoid}.report-head:before{content:"PROTOTYPEOS  /  PRODUCT INNOVATION";display:block;font-size:8pt;letter-spacing:2px;font-weight:700;color:#c8c5ff;margin-bottom:18px}.report-head .muted{color:#d8dcf7}.report-head h1{font-size:28pt;line-height:1.2;margin:14px 0 10px}.report-head small{color:#d7d9f4}.report-head p{max-width:92%}.report-hero{background:linear-gradient(120deg,#f0edff,#f8faff);border-left:5px solid #6657e8;padding:22px 26px}.report-hero h3{font-size:19pt}.report-table{font-size:9.5pt}.report-table th,.report-table td{padding:10px 11px;border-color:#e2e6f1}.report-table tr:nth-child(even) td{background:#fafbfe}.report-table th{background:#f1f0fb;color:#293258}.report-feature-table th{width:auto}.rice-table{table-layout:auto}.rice-table th{width:auto;font-size:8.5pt}.rice-table td:not(:first-child),.rice-table th:not(:first-child){text-align:center;white-space:nowrap}.rice-table td:first-child{width:40%}.rice-table td:last-child{color:#5144c6;font-weight:700;background:#f6f3ff}h2{font-size:13pt;letter-spacing:.1px;color:#30366b;border-bottom:2px solid #ecebfa;margin-top:26px}.section-lead{color:#66718a;font-size:9pt}.meta div{border-bottom:1px solid #dfe3ef}.report-physical{background:#fffdf8;border-color:#ece3d2}.report-pending{border-radius:6px;background:#fff9eb}.report-table,.report-physical,.report-hero,.evidence-photo{break-inside:avoid-page}thead{display:table-header-group}body{font-family:"Times New Roman","Noto Sans Thai",Tahoma,serif;line-height:1.55}@page{size:A4;margin:14mm}@media print{body{print-color-adjust:exact;-webkit-print-color-adjust:exact}.report-head,.report-hero,.report-table th,.rice-table td:last-child{print-color-adjust:exact;-webkit-print-color-adjust:exact}.report-head{border-radius:0}h2{break-after:avoid-page}tr{break-inside:avoid-page}}.no-print{margin:16px 0;background:#6857e8;color:white;padding:12px;border:0;border-radius:8px;cursor:pointer}@media print{.no-print{display:none}h2{break-after:avoid}tr{break-inside:avoid}}</style></head><body><button class="no-print" onclick="window.print()">🖨 Print / Save as PDF</button><header class="report-head"><b>International College of Digital Innovation — Chiang Mai University</b><p class="muted">PrototypeOS · By Assoc. Prof. Dr. Thacha Lawanna</p><h1>'+name+'</h1><b>'+labels[type]+'</b><p>'+lines(p.description)+'</p><small>Report generated '+new Date().toLocaleString('th-TH')+'</small></header>'+details(p,type)+'<h2>6. แผนการทดลอง ผลการทดสอบ และหลักฐาน</h2>'+(type==='product'?table([row('สิ่งที่ทดลอง',evidence.method||'ยังไม่ได้บันทึก'),row('อุปกรณ์ / ต้นแบบ',evidence.materials||'ยังไม่ได้บันทึก'),row('ขั้นตอนการทดลอง',evidence.steps||'ยังไม่ได้บันทึก'),row('ผู้ทดลอง',evidence.participants||'ยังไม่ได้บันทึก'),row('ตัวชี้วัด',evidence.metric||'ยังไม่ได้บันทึก'),row('ผลที่พบจริง',evidence.result||pendingText),row('หลักฐานประกอบ',evidence.evidence||pendingText),row('การปรับปรุงครั้งถัดไป',evidence.decision||'ยังไม่ได้บันทึก')])+(safeImage?'<figure class="evidence-photo"><img alt="ภาพต้นแบบที่แนบ" src="'+safeImage+'"><figcaption>ภาพต้นแบบ/หลักฐานที่ผู้จัดทำแนบ</figcaption></figure>':'<p class="report-pending">ยังไม่ได้แนบภาพต้นแบบหรือหลักฐานภาพ</p>')+(!evidence.result?'<p class="report-pending">ยังไม่มีผลการทดลองจริง ไม่สามารถสรุปว่าผลิตภัณฑ์ผ่านการทดสอบ</p>':'<p class="muted">ผลข้างต้นเป็นข้อมูลที่ผู้จัดทำบันทึก กรุณาตรวจสอบหลักฐานก่อนใช้ประกอบข้อสรุป</p>'):'')+(experiments.length?table(experiments.map((e,i)=>row('การทดลอง '+(i+1)+': '+e.hypothesis,'ตัวชี้วัด: '+(e.metric||'—')+' | สถานะ: '+(e.outcome||'pending')+' | หลักฐาน: '+(e.evidence||'ยังไม่มี')))):(type==='product'?'':'<p class="report-pending">ยังไม่มีหลักฐานการทดสอบที่บันทึกไว้</p>'))+'<h2>7. บทเรียนและแนวทางพัฒนาต่อ</h2>'+table([row('สิ่งที่ได้เรียนรู้',reflection.learned||'ยังไม่ได้บันทึก'),row('สิ่งที่ต้องปรับปรุง',reflection.improve||'ยังไม่ได้บันทึก'),row('การทดลองครั้งต่อไป',reflection.next||'ยังไม่ได้บันทึก')])+'<p class="muted">ข้อมูลจากโครงการที่บันทึกในเบราว์เซอร์ กรุณาตรวจสอบความถูกต้องและหลักฐานก่อนส่งงาน</p></body></html>';
}
function openReport(type,print){
 const p=get(type);if(!p){toast('กรุณาสร้างโครงการก่อน');return;}
 let html=report(p,type);
 if(type==='product' && (String(p.name||'').includes('ยาหม่อง') || /pain relief|balm/i.test(String(p.name||'')))){
  const translations=[
   ['Office workers who experience neck and shoulder discomfort after long hours at a computer.','พนักงานออฟฟิศที่มีอาการไม่สบายบริเวณคอและไหล่จากการทำงานหน้าคอมพิวเตอร์เป็นเวลานาน'],
   ['After hours at a computer, office workers often feel tension in their neck and shoulders and want something convenient to apply at their desk.','พนักงานออฟฟิศมักรู้สึกตึงบริเวณคอและไหล่หลังใช้คอมพิวเตอร์เป็นเวลานาน และต้องการผลิตภัณฑ์ที่สะดวกต่อการใช้ระหว่างทำงาน'],
   ['A pocket-sized topical balm designed to soothe minor neck and shoulder discomfort.','พัฒนายาหม่องทาภายนอกขนาดพกพา เพื่อช่วยบรรเทาความไม่สบายเล็กน้อยบริเวณคอและไหล่'],
   ['Desk-friendly comfort in a pocket-sized balm with a mild scent, designed for use in shared workspaces.','ยาหม่องขนาดพกพาที่มีกลิ่นอ่อน ใช้งานสะดวกบนโต๊ะทำงาน และเหมาะสำหรับพื้นที่ทำงานร่วมกัน']
  ];
  for(const [en,th] of translations)html=html.split(en).join(th);
  const steps=[
   ['ทดลองกลิ่นอ่อน','ตัวอย่างแผน: เปรียบเทียบกลิ่นอ่อน 3 ระดับ ให้พนักงานออฟฟิศ 5 คนประเมินความเหมาะสมในพื้นที่ทำงานร่วมกัน (ยังไม่ทดลอง)','ตัวอย่างสิ่งส่งมอบ: ภาพกลิ่นตัวอย่าง 3 ระดับ แบบประเมิน และตารางคะแนน (รอผลจริง)'],
   ['ออกแบบตลับ','ตัวอย่างแผน: ออกแบบตลับพกพา 2 แบบ ให้ผู้ใช้ 5 คนลองเปิด–ปิดและจับเวลา (ยังไม่ทดลอง)','ตัวอย่างสิ่งส่งมอบ: ภาพร่างตลับ 2 แบบ ตารางเวลาเปิด–ปิด และแบบประเมิน (รอผลจริง)'],
   ['ทดลองเนื้อบาล์ม','ตัวอย่างแผน: เปรียบเทียบเนื้อบาล์ม 2 สูตรด้านความหนืดและการเกลี่ย ตรวจสอบความปลอดภัยก่อนทดสอบบนผิวหนัง','ตัวอย่างสิ่งส่งมอบ: ภาพเนื้อบาล์ม 2 สูตร และแบบบันทึกความหนืดกับการเกลี่ย (รอผลจริง)']
  ];
  const genericAction='อธิบายสิ่งที่จะพัฒนา วิธีทำ และวิธีประเมินผล';
  const genericEvidence='ภาพหรือเอกสารที่แสดงผลการพัฒนาจริง';
  for(const [label,action,evidence] of steps){
   const start=html.indexOf('<tr><td><strong>',html.indexOf('<h2>4. แผนการพัฒนาต้นแบบและสิ่งส่งมอบ'));
   if(start<0)continue;
   const segments=html.split('</tr>');
   html=segments.map(part=>part.includes(label)&&part.includes(genericAction)?part.replace(genericAction,action).replace(genericEvidence,evidence):part).join('</tr>');
  }
 }

 const w=window.open('','_blank');
 if(!w){toast('Browser blocked the report window. Allow pop-ups and retry.');return;}
 w.document.open();w.document.write(html);w.document.close();
 if(print)w.addEventListener('load',()=>w.print(),{once:true});
}
function backup(type){
 const p=get(type);if(!p){toast('กรุณาสร้างโครงการก่อน');return;}
 const blob=new Blob([JSON.stringify({app:'PrototypeOS',version:1,exportedAt:new Date().toISOString(),project:p},null,2)],{type:'application/json'});
 const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=(p.name||type).replace(/[^\w\u0E00-\u0E7F-]+/g,'-').slice(0,60)+'.json';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
 toast('ดาวน์โหลดไฟล์สำรองแล้ว');
}
function clear(type){
 const p=get(type);if(!p){toast('กรุณาสร้างโครงการก่อน');return;}
 if(!confirm('ล้างข้อมูลการออกแบบของ "'+p.name+'"? ข้อมูลโครงการนี้จะถูกลบจาก Lab และไม่สามารถย้อนกลับได้ กรุณา Save JSON ก่อน'))return;
 if(!confirm('ยืนยันอีกครั้ง: ต้องการล้างข้อมูล '+labels[type]+' จริงหรือไม่?'))return;
 mutate(p,x=>{if(type==='product')x.product=makeProject('Temporary','product').product;if(type==='process')x.process=makeProject('Temporary','process').process;if(type==='business')x.business=makeProject('Temporary','business').business;x.experiments=[];});
 view(type);toast('ล้างข้อมูล Lab แล้ว');
}
function install(){
 for(const type of types){
 const page=$r(type),bar=page?.querySelector('.workingbar');if(!bar||bar.querySelector('.deliverable-tools'))continue;
 const panel=document.createElement('div');panel.className='deliverable-tools';panel.innerHTML='<span class="deliverable-label">เมื่อทำงานเสร็จ / Finish your work</span><button type="button" class="primary" data-action="save">💾 Save</button><button type="button" class="outlinebtn" data-action="backup">⬇ Backup</button><button type="button" class="outlinebtn" data-action="print">🖨 Print</button><button type="button" class="outlinebtn" data-action="pdf">📄 Export PDF</button><button type="button" class="outlinebtn" data-action="clear">↺ Clear</button><small class="deliverable-hint">Save = บันทึกในเครื่องนี้ · Backup = ดาวน์โหลดไฟล์ JSON · PDF = เลือก Save as PDF ในหน้าพิมพ์</small>';
 if(type==='product' && bar.nextElementSibling?.matches('.advanced-planning')){bar.nextElementSibling.insertAdjacentElement('afterend',panel);}else{bar.insertAdjacentElement('afterend',panel);}
 panel.addEventListener('click',e=>{const b=e.target.closest('[data-action]');if(!b)return;switch(b.dataset.action){case 'save':if(!get(type)){toast('กรุณาสร้างโครงการก่อน');return;}if(persist())toast('บันทึกในเบราว์เซอร์นี้แล้ว · แนะนำ Backup ด้วย');break;case 'backup':backup(type);break;case 'print':openReport(type,true);break;case 'pdf':openReport(type,false);break;case 'clear':clear(type);break;}});
 }
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install);else install();
})();