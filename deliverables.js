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
 return '<h2>1. Product Blueprint</h2>'+table([row('Target users',d.audience),row('Problem',d.problem),row('Proposed solution',d.solution),row('Unique value',d.value)])+'<h2>2. Features and priorities</h2>'+table(features.map(f=>row(f.name,'Reach '+val(f.reach)+' · Impact '+val(f.impact)+' · Confidence '+val(f.confidence)+'% · Effort '+val(f.effort))))+'<h2>3. Interactive prototype</h2><p>The in-browser interactive example is a simulation, not a deployed application. Demonstrate it live in Product Lab.</p>';
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
 return '<!doctype html><html lang="th"><head><meta charset="utf-8"><title>'+name+' — PrototypeOS Report</title><style>@page{size:A4;margin:17mm}body{font-family:Arial,"Noto Sans Thai",sans-serif;color:#182038;font-size:11pt;line-height:1.5}h1{font-size:22pt;margin:8px 0}h2{font-size:14pt;margin:24px 0 8px;color:#5144c6;border-bottom:1px solid #ddd;padding-bottom:6px}.report-head{border-bottom:3px solid #6857e8;padding-bottom:14px}.muted{color:#69748b}.report-table{width:100%;border-collapse:collapse;table-layout:fixed}.report-table th,.report-table td{border:1px solid #dce1ec;padding:8px;text-align:left;vertical-align:top;overflow-wrap:anywhere}.report-table th{background:#f3f2ff;width:33%}.meta{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:18px 0}.meta div{border-bottom:1px solid #aaa;padding:7px}.no-print{margin:16px 0;background:#6857e8;color:white;padding:12px;border:0;border-radius:8px;cursor:pointer}@media print{.no-print{display:none}h2{break-after:avoid}tr{break-inside:avoid}}</style></head><body><button class="no-print" onclick="window.print()">🖨 Print / Save as PDF</button><header class="report-head"><b>International College of Digital Innovation — Chiang Mai University</b><p class="muted">PrototypeOS · By Assoc. Prof. Dr. Thacha Lawanna</p><h1>'+name+'</h1><b>'+labels[type]+'</b><p>'+lines(p.description)+'</p><small>Report generated '+new Date().toLocaleString('th-TH')+'</small></header><div class="meta"><div>Student name: _______________________</div><div>Student ID: _______________________</div><div>Course: _______________________</div><div>Class / Group: _______________________</div></div>'+details(p,type)+'<h2>4. Validation and learning</h2>'+(experiments.length?table(experiments.map((e,i)=>row('Experiment '+(i+1)+': '+e.hypothesis,'Metric: '+(e.metric||'—')+' | Status: '+(e.outcome||'pending')+' | Evidence: '+(e.evidence||'Not yet recorded')))):'<p>No validation records yet. Collect evidence before claiming success.</p>')+'<h2>5. Reflection and next iteration</h2><p>What worked? __________________________________________________</p><p>What should improve? __________________________________________</p><p>Next experiment: ______________________________________________</p><p class="muted">Generated from locally stored project data. Verify figures and evidence before submission.</p></body></html>';
}
function openReport(type,print){
 const p=get(type);if(!p){toast('กรุณาสร้างโครงการก่อน');return;}
 const html=report(p,type);
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
 bar.insertAdjacentElement('afterend',panel);
 panel.addEventListener('click',e=>{const b=e.target.closest('[data-action]');if(!b)return;switch(b.dataset.action){case 'save':if(!get(type)){toast('กรุณาสร้างโครงการก่อน');return;}persist();toast('บันทึกในเบราว์เซอร์นี้แล้ว · แนะนำ Backup ด้วย');break;case 'backup':backup(type);break;case 'print':openReport(type,true);break;case 'pdf':openReport(type,false);break;case 'clear':clear(type);break;}});
 }
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install);else install();
})();