(()=>{
const canvas=document.querySelector('#ops-canvas');
const chaosBtn=document.querySelector('#ops-run-chaos');
const normalBtn=document.querySelector('#ops-run-normal');
const resetBtn=document.querySelector('#ops-reset');
if(!canvas||!chaosBtn||!normalBtn||!resetBtn)return;

const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
const $=id=>document.getElementById(id);
const wait=ms=>new Promise(r=>setTimeout(r,reduced?Math.min(ms,70):ms));
let running=false,startAt=0;
const jobWorker={'J-1042':'worker-a','J-1043':'worker-b','J-1044':'worker-b'};

const metrics={queued:3,running:0,retry:0,blocked:0,delivered:0,receipts:0};
const metricIds={queued:'metric-queued',running:'metric-running',retry:'metric-retry',blocked:'metric-blocked',delivered:'metric-delivered',receipts:'metric-receipts'};
function setMetric(key,val){metrics[key]=Math.max(0,val);const el=$(metricIds[key]);if(!el)return;el.textContent=metrics[key];el.classList.remove('bump');void el.offsetWidth;el.classList.add('bump')}
function addMetric(key,delta=1){setMetric(key,metrics[key]+delta)}
function stamp(){return `+${((performance.now()-startAt)/1000).toFixed(2).padStart(4,'0')}s`}
function log(text,cls=''){const box=$('ops-log');if(!box)return;const p=document.createElement('p');if(cls)p.className=cls;p.textContent=`${stamp()}  ${text}`;box.appendChild(p);box.scrollTop=box.scrollHeight}
function status(text,cls=''){const el=$('ops-status');if(!el)return;el.className=`ops-status ${cls}`.trim();el.innerHTML=`<i></i><span>${text}</span>`}
function flash(el){if(!el)return;el.classList.remove('flash');void el.offsetWidth;el.classList.add('flash');setTimeout(()=>el.classList.remove('flash'),500)}
function station(id,on=true){const el=$(id);if(el)el.classList.toggle('active',on);return el}
function worker(id,state,label){const el=$(id);if(!el)return;el.classList.remove('busy','failed','awake');if(state)el.classList.add(state);const em=el.querySelector('em');if(em&&label)em.textContent=label}
function subsystem(id,label,cls=''){const el=$(id);if(!el)return;const b=el.querySelector('b');if(b){b.textContent=label;b.className=cls}}
function queueState(job,state){const el=$(`queue-${job}`);if(el){el.classList.remove('sent','done');if(state)el.classList.add(state)}}
function receipt(job,label='COMPLETED'){const list=$('receipt-list');if(!list)return;const row=document.createElement('div');row.className='receipt';const hash=[...job].reduce((a,c)=>((a*33+c.charCodeAt(0))>>>0),5381).toString(16).slice(-5);row.innerHTML=`<i></i><span>${job} / ${label}</span><span class="hash">${hash}</span>`;list.appendChild(row);addMetric('receipts');flash($('station-ledger'))}

async function packet(from,to,label,color='',duration=460){if(!from||!to)return;if(reduced){flash(to);await wait(50);return}
 const cr=canvas.getBoundingClientRect(),fr=from.getBoundingClientRect(),tr=to.getBoundingClientRect();
 const sx=fr.left-cr.left+fr.width/2,sy=fr.top-cr.top+fr.height/2,ex=tr.left-cr.left+tr.width/2,ey=tr.top-cr.top+tr.height/2;
 const node=document.createElement('span');node.className=`job-packet ${color}`.trim();node.textContent=label;canvas.appendChild(node);
 const anim=node.animate([{transform:`translate(${sx}px,${sy}px) translate(-50%,-50%)`,opacity:.2},{offset:.15,opacity:1},{transform:`translate(${ex}px,${ey}px) translate(-50%,-50%)`,opacity:1}],{duration,easing:'cubic-bezier(.22,.75,.25,1)',fill:'forwards'});
 try{await anim.finished}catch{}node.remove();flash(to)
}

async function deliver(job,{ackLoss=false}={}){
 const qa=station('station-qa'),delivery=station('station-delivery'),ledger=station('station-ledger');
 await packet($(jobWorker[job])||$('station-workers'),qa,job,'green',390);log(`${job} / QA passed`,'ok');await wait(180);
 await packet(qa,delivery,job,'green',390);log(`${job} / delivery effect requested`);
 if(ackLoss){delivery.classList.add('active');subsystem('retry-card','RECONCILING','warn');log(`${job} / delivery ACK timeout / do not resend yet`,'warn');await wait(520);log(`${job} / remote delivery id found / retry cancelled`,'gold');subsystem('retry-card','1 / 2 AVAILABLE');}
 await packet(delivery,ledger,job,'green',360);receipt(job);addMetric('delivered');addMetric('running',-1);queueState(job,'done');log(`${job} / completed / receipt written`,'ok');
}

async function job1042(chaos){
 const job='J-1042';queueState(job,'sent');addMetric('queued',-1);addMetric('running');log(`${job} accepted / route selected`);
 await packet($(`queue-${job}`),station('station-router'),job,'',360);await packet($('station-router'),$('worker-a'),job,'',360);worker('worker-a','busy','RUNNING');log(`${job} / worker A started`);await wait(430);
 if(chaos){worker('worker-a','failed','DOWN');subsystem('health-card','A DOWN','warn');status('DEGRADED / RECOVERING','alert');log(`${job} / worker A heartbeat lost`,'warn');await wait(260);addMetric('retry');subsystem('retry-card','1 / 2 USED','warn');log(`${job} / effect not committed / retry budget consumed`,'gold');worker('worker-c','awake','AWAKE');log(`${job} / reserve worker C activated`,'ok');await packet($('worker-a'),$('worker-c'),job,'red',520);jobWorker[job]='worker-c';await wait(260);await deliver(job);subsystem('health-card','A DOWN / C ACTIVE','warn');}
 else{await wait(320);await deliver(job);worker('worker-a','','READY')}
}

async function job1043(chaos){
 const job='J-1043';queueState(job,'sent');addMetric('queued',-1);addMetric('running');log(`${job} accepted / route selected`);
 await packet($(`queue-${job}`),station('station-router'),job,'gold',360);await packet($('station-router'),$('worker-b'),job,'gold',360);worker('worker-b','busy','RUNNING');log(`${job} / worker B started`);await wait(300);
 if(chaos){log(`${job} duplicate event arrived`,'warn');await packet($('station-router'),$('guard-card'),`${job} DUP`,'red',390);addMetric('blocked');subsystem('guard-card','1 BLOCKED','warn');log(`${job} duplicate blocked by idempotency key`,'ok');await wait(230)}
 await wait(260);await deliver(job,{ackLoss:chaos});worker('worker-b','','READY')
}

async function job1044(){
 const job='J-1044';await wait(720);queueState(job,'sent');addMetric('queued',-1);addMetric('running');log(`${job} accepted / healthy route kept open`);
 await packet($(`queue-${job}`),station('station-router'),job,'green',340);const target=$('worker-b');await packet($('station-router'),target,job,'green',340);worker('worker-b','busy','2 JOBS');log(`${job} / worker B reused without waiting for A`);await wait(310);await deliver(job)
}

function reset(){running=false;startAt=performance.now();jobWorker['J-1042']='worker-a';jobWorker['J-1043']='worker-b';jobWorker['J-1044']='worker-b';Object.keys(metrics).forEach(k=>setMetric(k,k==='queued'?3:0));status('READY / 3 JOBS QUEUED');['station-router','station-qa','station-delivery','station-ledger'].forEach(id=>station(id,false));worker('worker-a','','READY');worker('worker-b','','READY');worker('worker-c','standby','STANDBY');subsystem('health-card','ALL HEALTHY');subsystem('guard-card','0 BLOCKED');subsystem('retry-card','2 / 2 AVAILABLE');['J-1042','J-1043','J-1044'].forEach(j=>queueState(j,''));const logBox=$('ops-log');if(logBox)logBox.innerHTML='<p class="muted">waiting / choose a run mode</p>';const receipts=$('receipt-list');if(receipts)receipts.innerHTML='<div class="receipt pending"><i></i><span>waiting for completed jobs</span><span class="hash">—</span></div>';chaosBtn.disabled=false;normalBtn.disabled=false;resetBtn.disabled=false}

async function run(chaos){if(running)return;running=true;startAt=performance.now();chaosBtn.disabled=true;normalBtn.disabled=true;resetBtn.disabled=true;const logBox=$('ops-log');if(logBox)logBox.innerHTML='';const receipts=$('receipt-list');if(receipts)receipts.innerHTML='';status(chaos?'RUNNING / INCIDENTS ARMED':'RUNNING / NORMAL');log(chaos?'simulation started / 3 jobs / faults armed':'simulation started / 3 jobs / normal route');
 const a=job1042(chaos);await wait(180);const b=job1043(chaos);await wait(180);const c=job1044();await Promise.all([a,b,c]);station('station-router',false);station('station-qa',false);station('station-delivery',false);station('station-ledger',false);if(chaos){status('COMPLETED / 3 JOBS / RECOVERED','done');log('all jobs completed / 1 retry / 1 duplicate blocked / 0 duplicate effects','ok')}else{status('COMPLETED / 3 JOBS','done');log('all jobs completed on normal route','ok')}chaosBtn.disabled=false;normalBtn.disabled=false;resetBtn.disabled=false;running=false}
chaosBtn.addEventListener('click',()=>run(true));normalBtn.addEventListener('click',()=>run(false));resetBtn.addEventListener('click',reset);reset();
})();