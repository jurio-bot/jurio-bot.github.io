(()=>{
'use strict';
const demos=window.PD_DEMOS||[],$=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const params=new URLSearchParams(location.search),id=params.get('id'),demo=demos.find(d=>d.id===id)||demos[0];
if(!demo){location.href='/demo.html';return}
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
const sleep=ms=>new Promise(r=>setTimeout(r,reduced?Math.min(ms,40):ms));
const rand=(a,b)=>Math.floor(Math.random()*(b-a+1))+a,pick=a=>a[Math.floor(Math.random()*a.length)],clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
let running=false,chaos=false,speed=4,spawnTimer=null,chaosTimer=null,clockTimer=null,startAt=performance.now(),epoch=1,seq=1;
const state={processed:0,active:0,recovered:0,blocked:0,outputs:0,latencies:[],chart:Array(36).fill(0),pending:[],inflight:new Set()};
const topologyFamilies=new Set(['network','router','receipt','rag','trace']);
const creativeFamilies=new Set(['creative','design','shop','form']);
const dataFamilies=new Set(['table','report','chart','files']);
const mediaFamilies=new Set(['media','audio']);
const sheetFamilies=new Set(['doc','text']);
const researchFamilies=new Set(['research']);
const terminalFamilies=new Set(['terminal']);
const deviceFamilies=new Set(['web','checks']);
const benchFamilies=new Set(['benchmark','stack']);
function esc(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function hash(s){let h=2166136261;for(const c of s){h^=c.charCodeAt(0);h=Math.imul(h,16777619)}return(h>>>0).toString(16).slice(-7)}
function setText(id,v){const e=$(id);if(e)e.textContent=String(v)}
function append(box,text,cls=''){if(!box)return;const p=document.createElement('p');p.className=cls;p.textContent=text;box.prepend(p);while(box.children.length>70)box.lastChild.remove()}
function draw(){const p=$('#de-chart polyline');if(!p)return;const a=state.chart,max=Math.max(1,...a),min=Math.min(0,...a);p.setAttribute('points',a.map((v,i)=>`${i/(a.length-1)*300},${94-(v-min)/(max-min||1)*86}`).join(' '))}
function p95(){if(!state.latencies.length)return 0;const a=[...state.latencies].sort((x,y)=>x-y);return a[Math.floor((a.length-1)*.95)]}
function sync(){setText('#m-processed',state.processed);setText('#m-active',state.active);setText('#m-p95',p95()+'ms');setText('#m-recovered',state.recovered);setText('#m-blocked',state.blocked);setText('#m-output',state.outputs);draw();const r=$('#de-fault-readout');if(r)r.innerHTML=state.pending.length?state.pending.map(x=>`<div>ARMED / ${esc(x)}</div>`).join(''):'NO PENDING FAULT'}
function timeNow(){const s=Math.floor((performance.now()-startAt)/1000);setText('#de-clock',`${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`)}
function baseDelay(){return reduced?12:Math.max(55,260/speed)}
function buildPage(){document.title=`${demo.title} | DEMO | paper-daemon`;$('#de-breadcrumb').textContent=`DEMO / ${demo.group==='works'?'WORK':'SERVICE'} / ${demo.cat}`;$('#de-kicker').textContent=`${demo.cat} / ${demo.family.toUpperCase()} / LIVE SIMULATION`;$('#de-title').textContent=demo.title;$('#de-desc').textContent=demo.desc;document.documentElement.style.setProperty('--steps',demo.steps.length);$('#de-pipeline').innerHTML=demo.steps.map((s,i)=>`<div class="de-step" data-step="${i}"><small>0${i+1}</small><br>${esc(s)}</div>`).join('');$('#de-faults').innerHTML=`<header><small>FAULT INJECTION</small><b>途中から壊せる。</b></header>${demo.faults.map((f,i)=>`<button data-fault="${esc(f)}"><b>${esc(f)}</b><small>inject incident ${String(i+1).padStart(2,'0')}</small></button>`).join('')}<div id="de-fault-readout" class="de-fault-readout">NO PENDING FAULT</div>`;if(demo.proof){const a=$('#de-proof');a.href=demo.proof;a.classList.add('show')}renderScene();wire();sync()}
function node(x,y,k,n,d){return`<div class="node" data-node="${esc(n)}" style="left:${x}%;top:${y}%"><small>${esc(k)}</small><b>${esc(n)}</b><span>${esc(d)}</span><i></i></div>`}
function renderScene(){const s=$('#de-stage');s.innerHTML='';const f=demo.family;
 if(topologyFamilies.has(f)){s.innerHTML=`${node(4,38,'01 / INPUT','INGRESS','accept + validate')}${node(24,18,'02 / BUFFER','QUEUE','durable work')}${node(24,62,'03 / POLICY','GUARD','dedupe + risk')}${node(47,8,'04A / PRIMARY','WORKER A','fast path')}${node(47,39,'04B / SECONDARY','WORKER B','parallel path')}${node(47,70,'04C / RESERVE','WORKER C','fallback')}${node(72,20,'05 / VERIFY','QA / CHECK','result validation')}${node(72,62,'06 / EFFECT','DELIVERY','side effect')}${node(87,41,'07 / PROOF','RECEIPT','effect ledger')}`;return}
 if(creativeFamilies.has(f)){s.innerHTML=`<div class="asset-wall">${Array.from({length:24},(_,i)=>`<div class="asset" data-asset="${i}"><small>V${String(i+1).padStart(2,'0')}</small></div>`).join('')}</div>`;return}
 if(dataFamilies.has(f)){s.innerHTML=`<div class="row-wall">${Array.from({length:12},(_,i)=>`<div class="row" data-row="${i}"><b>#${1001+i}</b><span>${i%3?'2026-09-03':'09/03/26'}</span><span>${i%5?rand(1200,9800):'NULL'}</span><span>${['A','B','C'][i%3]}</span><span>${i%4?'OK':'CHECK'}</span></div>`).join('')}</div>`;return}
 if(mediaFamilies.has(f)){s.innerHTML=`<div class="media-stage"><div class="wave">${Array.from({length:58},(_,i)=>`<i style="--h:${12+((i*37)%82)}%"></i>`).join('')}</div><div class="timeline">${Array.from({length:12},()=>'<i></i>').join('')}</div></div>`;return}
 if(sheetFamilies.has(f)){s.innerHTML=`<div class="sheet-stage"><div class="paper source"><b>SOURCE / RAW</b>${'<span></span>'.repeat(14)}</div><div class="transformer">${demo.steps.map(x=>`<span>${esc(x)}</span>`).join('')}</div><div class="paper output"><b>DELIVERABLE / EDITABLE</b>${'<span></span>'.repeat(14)}</div></div>`;return}
 if(researchFamilies.has(f)||f==='rag'){s.innerHTML=`<div class="source-wall">${Array.from({length:12},(_,i)=>`<div class="source" data-source="${i}"><b>SOURCE ${String(i+1).padStart(2,'0')}</b>${'<span></span>'.repeat(5)}</div>`).join('')}</div>`;return}
 if(terminalFamilies.has(f)){s.innerHTML=`<div class="terminal" id="de-terminal"><div>$ observe --system</div><div>service: ready</div><div>network: ready</div><div>filesystem: ready</div><div>waiting for run...</div></div>`;return}
 if(deviceFamilies.has(f)){s.innerHTML=`<div class="device-wall"><div class="device"><div class="screen"></div></div><div class="device"><div class="screen"></div></div><div class="device"><div class="screen"></div></div></div>`;return}
 if(benchFamilies.has(f)){const labels=f==='benchmark'?['MODEL A','MODEL B','MODEL C','MODEL D','MODEL E','MODEL F']:['LOCAL','CLOUD API','NO-CODE','CUSTOM','HYBRID','MANUAL'];s.innerHTML=`<div class="bench">${labels.map((x,i)=>`<div class="bench-row" data-bench="${i}"><b>${x}</b><span class="bench-track"><i style="--score:${25+i*9}%"></i></span><em>${rand(24,110)}ms</em></div>`).join('')}</div>`;return}
 if(f==='chain'){s.innerHTML=`<div class="chain-stage">${['DATA','HASH','TIME','BLOCK','VERIFY'].map((x,i)=>`<div class="block" data-block="${i}"><small>0${i+1}</small><b>${x}</b><span>${hash(x+i)}</span></div>`).join('')}</div>`;return}
 if(f==='inspector'){s.innerHTML=`<div class="media-stage"><div class="wave">${Array.from({length:58},(_,i)=>`<i style="--h:${18+((i*29)%75)}%"></i>`).join('')}</div><div class="timeline">${Array.from({length:12},()=>'<i></i>').join('')}</div></div>`;return}
 s.innerHTML=`<div class="terminal"><div>demo family: ${esc(f)}</div><div>ready / waiting</div></div>`}
function wire(){
 $('#de-start').addEventListener('click',()=>running?pause():start());$('#de-chaos').addEventListener('click',toggleChaos);$('#de-reset').addEventListener('click',reset);$('#de-speed').addEventListener('click',()=>{speed=speed===1?2:speed===2?4:1;$('#de-speed').textContent=`SPEED ×${speed}`});
 $$('#de-faults [data-fault]').forEach(b=>b.addEventListener('click',()=>{const f=b.dataset.fault;state.pending.push(f);b.classList.add('active');setTimeout(()=>b.classList.remove('active'),500);append($('#de-log'),`manual fault armed / ${f}`,'warn');if(!running)start();sync()}));
 $('#de-stage').addEventListener('pointermove',e=>{const r=e.currentTarget.getBoundingClientRect();e.currentTarget.style.setProperty('--mx',`${(e.clientX-r.left)/r.width*100}%`);e.currentTarget.style.setProperty('--my',`${(e.clientY-r.top)/r.height*100}%`)})
}
function start(){if(running)return;running=true;startAt=performance.now();$('#de-start').textContent='PAUSE';$('#de-status').className='de-status running';$('#de-status span').textContent='RUNNING / LIVE';append($('#de-log'),'simulation started','ok');spawnTimer=setInterval(spawn,reduced?900:Math.max(240,900/speed));spawn();clockTimer=setInterval(timeNow,250)}
function pause(){running=false;clearInterval(spawnTimer);clearInterval(clockTimer);spawnTimer=clockTimer=null;$('#de-start').textContent='START';$('#de-status').className='de-status';$('#de-status span').textContent='PAUSED'}
function toggleChaos(){chaos=!chaos;$('#de-chaos').classList.toggle('on',chaos);$('#de-chaos').textContent=chaos?'AUTO CHAOS ON':'AUTO CHAOS';clearInterval(chaosTimer);if(chaos){if(!running)start();chaosTimer=setInterval(()=>{const f=pick(demo.faults);state.pending.push(f);append($('#de-log'),`auto fault armed / ${f}`,'warn');sync()},reduced?5000:Math.max(1800,5200/speed))}}
function reset(){epoch++;pause();chaos=false;clearInterval(chaosTimer);$('#de-chaos').classList.remove('on');$('#de-chaos').textContent='AUTO CHAOS';Object.assign(state,{processed:0,active:0,recovered:0,blocked:0,outputs:0,latencies:[],chart:Array(36).fill(0),pending:[],inflight:new Set()});seq=1;$('#de-log').innerHTML='<p>waiting / simulation paused</p>';$('#de-output').innerHTML='<p>no output yet</p>';renderScene();sync()}
function stepOn(i,on=true){const e=$(`.de-step[data-step="${i}"]`);if(e)e.classList.toggle('on',on)}
function consumeFault(){return state.pending.shift()||((chaos||Math.random()<.08)?(Math.random()<.15?pick(demo.faults):''): '')}
function makeEntity(job){const s=$('#de-stage'),f=demo.family;
 if(topologyFamilies.has(f)){const p=document.createElement('div');p.className='packet';p.textContent=job;p.style.left='8%';p.style.top='48%';s.appendChild(p);return p}
 if(creativeFamilies.has(f)){const a=pick($$('.asset',s));a.classList.remove('bad','fix','on');a.classList.add('on');return a}
 if(dataFamilies.has(f)){const r=pick($$('.row',s));r.classList.remove('bad','fix','on');r.classList.add('on');return r}
 if(mediaFamilies.has(f)||f==='inspector'){const wave=$$('.wave i',s),seg=pick(wave);seg.classList.add('on');const t=pick($$('.timeline i',s));t.classList.add('on');return seg}
 if(sheetFamilies.has(f)){const out=$('.paper.output',s);out.classList.add('on');return out}
 if(researchFamilies.has(f)){const src=pick($$('.source',s));src.classList.add('on');return src}
 if(terminalFamilies.has(f)){return $('#de-terminal')}
 if(deviceFamilies.has(f)){const d=pick($$('.device',s));d.classList.add('on');return d}
 if(benchFamilies.has(f)){const r=pick($$('.bench-row',s));r.classList.add('on');return r}
 if(f==='chain'){const b=pick($$('.block',s));b.classList.add('on');return b}
 return s}
function topologyPos(i){const pts=[[8,48],[28,28],[29,70],[51,18],[51,48],[51,78],[76,30],[76,70],[90,50]];return pts[Math.min(i,pts.length-1)]}
async function moveEntity(entity,i){if(!entity)return;const f=demo.family;if(topologyFamilies.has(f)&&entity.classList.contains('packet')){const [x,y]=topologyPos(Math.round(i/(Math.max(1,demo.steps.length-1))*8));entity.style.left=x+'%';entity.style.top=y+'%';const nodes=$$('.node');nodes.forEach(n=>n.classList.remove('on'));const nearest=nodes[Math.min(nodes.length-1,Math.round(i/(Math.max(1,demo.steps.length-1))*(nodes.length-1)))];nearest?.classList.add('on')}
 else if(sheetFamilies.has(f)){const ts=$$('.transformer span');ts[i%ts.length]?.classList.add('on')}
 else if(benchFamilies.has(f)){const rows=$$('.bench-row');rows.forEach((r,j)=>r.classList.toggle('win',j===i%rows.length))}
 else if(f==='chain'){$$('.block').slice(0,i+1).forEach(b=>b.classList.add('on'))}
 await sleep(baseDelay())}
async function applyFault(entity,fault,job){if(!fault)return;$('#de-status').className='de-status warn';$('#de-status span').textContent=`INCIDENT / ${fault.toUpperCase()}`;append($('#de-log'),`${job} fault / ${fault}`,'warn');const family=demo.family;
 if(entity?.classList){entity.classList.add('bad')}
 if(topologyFamilies.has(family)){const n=pick($$('.node'));n.classList.add('bad');await sleep(baseDelay()*1.6);n.classList.remove('bad');n.classList.add('fix');await sleep(baseDelay());n.classList.remove('fix');n.classList.add('on')}
 else if(deviceFamilies.has(family)){$$('.device').forEach((d,i)=>d.classList.toggle('bad',i===2));await sleep(baseDelay()*2);$$('.device').forEach(d=>{d.classList.remove('bad');d.classList.add('fix')});await sleep(baseDelay());$$('.device').forEach(d=>{d.classList.remove('fix');d.classList.add('on')})}
 else if(terminalFamilies.has(family)){const t=$('#de-terminal');t.insertAdjacentHTML('beforeend',`<div class="bad">× ${esc(fault)} / reproduced</div><div class="gold">inspect → isolate → patch</div>`);await sleep(baseDelay()*1.4);t.insertAdjacentHTML('beforeend','<div class="ok">● verify PASS / service healthy</div>');t.scrollTop=t.scrollHeight}
 else if(dataFamilies.has(family)){entity?.classList.add('bad');await sleep(baseDelay()*1.2);entity?.classList.remove('bad');entity?.classList.add('fix')}
 else if(creativeFamilies.has(family)||mediaFamilies.has(family)||researchFamilies.has(family)||family==='inspector'){entity?.classList.add('bad');await sleep(baseDelay()*1.25);entity?.classList.remove('bad');entity?.classList.add('fix')}
 else if(sheetFamilies.has(family)){entity?.classList.remove('on');await sleep(baseDelay());entity?.classList.add('on')}
 if(/duplicate|same|二重/i.test(fault)){state.blocked++;append($('#de-log'),`${job} duplicate effect blocked`,'gold')}else{state.recovered++;append($('#de-log'),`${job} recovered / only failed region replayed`,'ok')}
 $('#de-status').className='de-status running';$('#de-status span').textContent='RUNNING / RECOVERED';sync()}
async function spawn(){if(!running||state.active>=Math.max(2,Math.min(7,speed+2)))return;const e=epoch,job=`J-${String(seq++).padStart(4,'0')}`,fault=consumeFault(),start=performance.now();state.processed++;state.active++;state.inflight.add(job);const entity=makeEntity(job);append($('#de-log'),`${job} accepted / ${demo.steps[0]}`);sync();for(let i=0;i<demo.steps.length;i++){if(e!==epoch)return;stepOn(i,true);await moveEntity(entity,i);if(fault&&i===Math.floor(demo.steps.length/2))await applyFault(entity,fault,job);if(i>0)stepOn(i-1,false)}if(e!==epoch)return;stepOn(demo.steps.length-1,false);const latency=Math.max(18,Math.round(performance.now()-start));state.latencies.push(latency);if(state.latencies.length>120)state.latencies.shift();state.chart.push(latency);state.chart.shift();state.outputs++;state.active--;state.inflight.delete(job);if(entity?.classList){entity.classList.remove('bad','fix');entity.classList.add('on')}append($('#de-output'),`${job} / output ${hash(job+latency)} / ${fault?'recovered':'clean'}`,'ok');append($('#de-log'),`${job} complete / ${latency}ms`,'ok');if(entity?.classList.contains('packet'))setTimeout(()=>entity.remove(),500);sync()}
buildPage();
})();