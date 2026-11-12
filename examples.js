'use strict';
/* PrototypeOS educational examples: hypothetical data, never presented as measured results. */
(() => {
const examples = {
product: () => {
 const p=makeProject('ยาหม่อง pain relief — Product Demo','product','ข้อมูลตัวอย่างเพื่อการศึกษา / Educational sample · ยาหม่องสำหรับพนักงานออฟฟิศ');
 p.product={
 audience:'พนักงานออฟฟิศที่มีอาการไม่สบายบริเวณคอและไหล่จากการทำงานหน้าคอมพิวเตอร์เป็นเวลานาน',
 problem:'พนักงานออฟฟิศมักรู้สึกตึงบริเวณคอและไหล่หลังใช้คอมพิวเตอร์เป็นเวลานาน และต้องการผลิตภัณฑ์ที่สะดวกต่อการใช้ระหว่างทำงาน',
 solution:'พัฒนายาหม่องทาภายนอกขนาดพกพา เพื่อช่วยบรรเทาความไม่สบายเล็กน้อยบริเวณคอและไหล่',
 value:'ยาหม่องขนาดพกพาที่มีกลิ่นอ่อน ใช้งานสะดวกบนโต๊ะทำงาน และเหมาะสำหรับพื้นที่ทำงานร่วมกัน',
 checklist:[false,false,false,false],
 features:[
 {name:'ทดลองกลิ่นอ่อนสำหรับใช้ในออฟฟิศ',reach:100,impact:2,confidence:80,effort:1},
 {name:'ออกแบบตลับขนาดพกพา เปิดและปิดง่าย',reach:100,impact:1,confidence:80,effort:1},
 {name:'ทดลองเนื้อบาล์มที่เกลี่ยง่ายและเหนียวน้อย',reach:100,impact:2,confidence:70,effort:2}
 ].map(x=>({id:uid(),...x}))
 };
 p.experiments=[{id:uid(),hypothesis:'ตัวอย่างสมมติ: ผู้ใช้เป้าหมายส่วนใหญ่ให้คะแนนความสะดวกในการพกพาและเปิดตลับอย่างน้อย 4 จาก 5 คะแนน',metric:'คะแนนความสะดวกเฉลี่ย ≥ 4/5; ระยะเวลาเปิด–ปิดตลับ',outcome:'pending',evidence:'แผนการทดลองเท่านั้น: เชิญพนักงานออฟฟิศ 5 คนประเมินต้นแบบและบันทึกผลจริงหลังตรวจสอบความปลอดภัย',createdAt:new Date().toISOString()}];
 return p;
},
process: () => {
 const p=makeProject('Smart Student Service Workflow — Process Demo','process','DEMO DATA · Digital student service request optimization');
 p.process={current:'Paper requests, manual verification and approvals cause long processing times.',goal:'Reduce handling time from 60 to 20 minutes per request (66.7% target).',owner:'University Student Services',volume:1000,steps:[
 ['Submit request',10,3],['Verify student information',15,2],['Administrative approval',20,10],['Record and notify',15,5]
 ].map(([name,beforeTime,afterTime])=>({id:uid(),name,beforeTime,afterTime,beforeCost:beforeTime*2.5,afterCost:afterTime*2.5}))};
 p.experiments=[{id:uid(),hypothesis:'Digitization reduces processing time by at least 50%.',metric:'Median handling time reduction ≥ 50%; error rate ≤ 5%',outcome:'pending',evidence:'DEMO PLAN ONLY: compare 100 pilot requests with historical baseline; track rework and errors.',createdAt:new Date().toISOString()}];
 return p;
},
business: () => {
 const p=makeProject('SmartCampus SaaS — Business Demo','business','DEMO DATA · University subscription business model');
 p.business.canvas={partners:'Universities; cloud infrastructure providers; systems integrators',activities:'Product development; integration; onboarding; cybersecurity; customer support',resources:'Engineering team; software platform; hosting; institutional relationships',value:'Reduce university administrative workload while improving the student experience',relationships:'Institutional onboarding; account management; training and support',channels:'Direct institutional sales; education conferences; partner referrals',segments:'Universities; colleges; education groups',cost:'Development; hosting; security; marketing; administration; support',revenue:'Monthly institutional subscriptions; setup fees; integrations'};
 p.business.finance={price:25000,variableCost:5000,fixedCost:180000,customers:12};
 p.experiments=[{id:uid(),hypothesis:'At least three universities will commit to qualified paid pilots.',metric:'≥ 3 qualified pilot commitments from 10 decision-maker interviews',outcome:'pending',evidence:'DEMO PLAN ONLY: interview decision-makers, validate procurement requirements and willingness to pay.',createdAt:new Date().toISOString()}];
 return p;
}
};
function load(type){
 const p=examples[type]();projects.push(p);selected[type]=p.id;selected.insights=p.id;
 persist();view(type);toast('Example loaded — hypothetical demo data. Edit freely.');
}
function install(){
 const target=document.querySelector('.topactions');
 if(!target||document.getElementById('examplePicker'))return;
 const wrap=document.createElement('div');wrap.className='example-picker';wrap.innerHTML='<label for="examplePicker" class="sr-only">Load example project</label><select id="examplePicker" aria-label="Load a sample prototype"><option value="">✦ Load example / โหลดตัวอย่าง</option><option value="product">Product · ยาหม่อง pain relief</option><option value="process">Process · Student Workflow</option><option value="business">Business · SmartCampus SaaS</option><option value="all">Load all three examples</option></select>';
 target.insertBefore(wrap,target.querySelector('#topNew'));
 wrap.querySelector('select').addEventListener('change',e=>{
 const type=e.target.value;e.target.value='';if(!type)return;
 if(type==='all'){const created=['product','process','business'].map(t=>examples[t]());projects.push(...created);created.forEach(p=>selected[p.type]=p.id);selected.insights=created[0].id;persist();view('projects');toast('Three example projects loaded.');}
 else load(type);
 });
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install);else install();
})();
