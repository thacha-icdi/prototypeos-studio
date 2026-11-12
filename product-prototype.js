'use strict';
/* Clickable, simulated prototype and usability testing; no purchases or bookings occur. */
(()=>{
const $p=id=>document.getElementById(id);
let mode='food',screen='home',selectedItem=null,cart=[],testing=false,started=0,clicks=0,finished=false,elapsed=0;
const catalog={food:[['ข้าวกะเพราไก่','65','🍛'],['ข้าวผัดกุ้ง','75','🍤'],['ชาไทย','45','🧋'],['สลัดผัก','59','🥗']],service:[['ปรึกษาเรื่องการเรียน','0','🎓'],['นัดพบอาจารย์','0','👩‍🏫'],['บริการเอกสาร','0','📄'],['แนะแนวอาชีพ','0','💼']]};
const safe=s=>String(s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const button=(label,action,cls='')=>'<button type="button" class="proto-btn '+cls+'" data-proto="'+action+'">'+label+'</button>';
function render(){
 const el=$p('protoScreen');if(!el)return;
 const title=mode==='food'?'Miracle Food':'Campus Services';
 const p=typeof active==='function'?active('product'):null;
 let body='';
 if(screen==='home')body='<div class="proto-greeting">WELCOME TO YOUR PROTOTYPE</div><h2>'+title+'</h2><p>'+(mode==='food'?'สั่งอาหารอร่อย ง่ายและรวดเร็ว':'จองบริการมหาวิทยาลัยได้ในที่เดียว')+'</p><div class="proto-banner">'+(mode==='food'?'🍽️ เลือกเมนูที่ชอบ':'📅 เลือกบริการที่ต้องการ')+'</div>'+button(mode==='food'?'ดูเมนูอาหาร →':'ดูรายการบริการ →','catalog','main');
 if(screen==='catalog')body='<h2>'+(mode==='food'?'เลือกเมนูอาหาร':'เลือกบริการ')+'</h2><p>แตะรายการเพื่อดูรายละเอียด</p>'+catalog[mode].map((x,i)=>'<button class="proto-item" data-proto="item:'+i+'"><span class="proto-emoji">'+x[2]+'</span><span><b>'+x[0]+'</b><small>'+(mode==='food'?'฿'+x[1]:'จองเวลารับบริการ')+'</small></span><span>›</span></button>').join('')+button('← กลับ','home');
 if(screen==='detail'){const x=catalog[mode][selectedItem];body='<div class="proto-bigemoji">'+x[2]+'</div><h2>'+x[0]+'</h2><p>'+(mode==='food'?'ราคา ฿'+x[1]+' · เมนูตัวอย่าง':'เลือกบริการนี้เพื่อเข้าสู่ขั้นตอนการจอง')+'</p>'+button(mode==='food'?'เพิ่มลงตะกร้า':'เลือกบริการ','add','main')+button('← เลือกรายการอื่น','catalog');}
 if(screen==='cart')body='<h2>'+(mode==='food'?'ตะกร้าของฉัน':'สรุปการจอง')+'</h2>'+cart.map(x=>'<div class="proto-cartrow">'+safe(x[0])+' <b>'+(mode==='food'?'฿'+x[1]:'')+'</b></div>').join('')+'<p>'+(mode==='food'?'รวม ฿'+cart.reduce((a,x)=>a+Number(x[1]),0):'บริการที่เลือก '+cart.length+' รายการ')+'</p>'+button(mode==='food'?'ยืนยันคำสั่งซื้อ (จำลอง)':'ยืนยันการจอง (จำลอง)','confirm','main')+button('← เพิ่มรายการ','catalog');
 if(screen==='done')body='<div class="proto-success">✓</div><h2>'+(mode==='food'?'สั่งอาหารสำเร็จ!':'จองบริการสำเร็จ!')+'</h2><p>นี่คือการจำลองเท่านั้น ไม่มีการสั่งซื้อหรือจองบริการจริง</p>'+button('เริ่มทดลองใหม่','reset','main');
 el.innerHTML='<div class="proto-apphead"><span>◈ '+title+'</span><span>'+(cart.length?'◉ '+cart.length:'○')+'</span></div><div class="proto-screenbody">'+body+'</div>';
 const journey=['home','catalog','detail','cart','done'];const step=journey.indexOf(screen);
 $p('protoJourney').innerHTML=journey.map((s,i)=>'<div class="proto-journey-step '+(i<=step?'reached':'')+'"><span>'+(i+1)+'</span>' +['Home','Browse','Details','Review','Success'][i]+'</div>').join('');
 const status=$p('protoTestStatus');status.textContent=testing?(finished?'Task completed · '+elapsed.toFixed(1)+' sec · '+clicks+' actions':'Testing in progress · '+clicks+' actions'):finished?'Completed · '+elapsed.toFixed(1)+' sec':'Not testing';
 const history=(p?.experiments||[]).filter(x=>x.prototypeTest).slice(0,5);
 $p('protoTestHistory').innerHTML=history.length?'<strong>Recent test sessions</strong>'+history.map(x=>'<p>'+safe(x.evidence)+'</p>').join(''):'No saved usability tests yet.';
}
function reset(){screen='home';selectedItem=null;cart=[];testing=false;finished=false;clicks=0;elapsed=0;render();}
function start(){reset();testing=true;started=performance.now();render();}
function navigate(action){
 if(testing&&!finished)clicks++;
 if(action==='reset'){reset();return;}
 if(action==='home'||action==='catalog'){screen=action;}
 else if(action.startsWith('item:')){selectedItem=Number(action.split(':')[1]);screen='detail';}
 else if(action==='add'){cart.push(catalog[mode][selectedItem]);screen='cart';}
 else if(action==='confirm'){screen='done';if(testing){finished=true;elapsed=(performance.now()-started)/1000;}}
 render();
}
function save(){
 const p=active('product');if(!p){toast('Create a Product project first');return;}
 if(!testing||!finished){toast('Start and complete a usability test first');return;}
 const rating=Number($p('protoSatisfaction').value);
 if(!rating){toast('Choose a satisfaction rating first');return;}
 const record={id:uid(),hypothesis:'User can complete the '+(mode==='food'?'food ordering':'service booking')+' prototype task',metric:'Task completion, elapsed time, actions and satisfaction',outcome:'validated',evidence:'Simulated prototype session: completed in '+elapsed.toFixed(1)+' seconds; '+clicks+' actions; satisfaction '+rating+'/5. One session only; not evidence of broader usability.',createdAt:new Date().toISOString(),prototypeTest:true};
 mutate(p,x=>{x.experiments||=[];x.experiments.unshift(record)});
 selected.insights=p.id;toast('Usability test saved to Validation & Insights');testing=false;render();
}
function install(){
 if(!$p('protoScreen'))return;
 $p('prototypeMode').addEventListener('change',e=>{mode=e.target.value;reset()});
 $p('prototypeReset').addEventListener('click',reset);
 $p('prototypeStartTest').addEventListener('click',start);
 $p('protoSaveTest').addEventListener('click',save);
 $p('protoScreen').addEventListener('click',e=>{const b=e.target.closest('[data-proto]');if(b)navigate(b.dataset.proto)});
 const select=$p('productProject');select?.addEventListener('change',()=>setTimeout(render,0));
 document.querySelector('[data-view="product"]')?.addEventListener('click',()=>setTimeout(render,0));
 render();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install);else install();
})();
