(()=>{
const q=s=>document.querySelector(s),qa=s=>[...document.querySelectorAll(s)];
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
const wait=ms=>new Promise(r=>setTimeout(r,reduced?Math.min(ms,70):ms));
const logTo=(id,text,cls='')=>{const el=q(id);if(!el)return;const p=document.createElement('p');p.className=cls;p.textContent=text;el.appendChild(p);el.scrollTop=el.scrollHeight};
const clearLog=id=>{const el=q(id);if(el)el.innerHTML=''};
const setState=(id,text,cls='')=>{const el=q(id);if(!el)return;el.className=`demo-state ${cls}`.trim();el.innerHTML=`<i></i><span>${text}</span>`};
const disable=(arr,on)=>arr.forEach(x=>{if(x)x.disabled=on});

/* CREATIVE FACTORY */
const crRun=q('#creative-run'),crFault=q('#creative-fault'),crReset=q('#creative-reset');
if(crRun&&crFault&&crReset){
 let running=false;
 const variants=qa('.variant'),steps=qa('.creative-step'),qaItems=qa('.qa-item');
 const scores=[94,91,89,87,85,82,79,77,74,71,69,66];
 function crResetAll(){running=false;setState('#creative-state','READY / BRIEF LOADED');steps.forEach(s=>s.className='creative-step');variants.forEach((v,i)=>{v.className='variant';v.dataset.score=`${scores[i]}`});qaItems.forEach(x=>x.className='qa-item');const pack=q('#creative-pack');if(pack)pack.classList.remove('done');const prog=q('#creative-progress');if(prog)prog.style.width='0';clearLog('#creative-log');logTo('#creative-log','waiting / 12 variants / QA rules loaded');disable([crRun,crFault,crReset],false)}
 async function crGo(faults){if(running)return;running=true;disable([crRun,crFault,crReset],true);clearLog('#creative-log');setState('#creative-state','RUNNING / GENERATING');const prog=q('#creative-progress');
  steps[0].classList.add('active');logTo('#creative-log','00 brief normalized / 5 constraints locked','on');if(prog)prog.style.width='18%';await wait(350);steps[0].className='creative-step done';steps[1].classList.add('active');
  for(let i=0;i<variants.length;i++){variants[i].classList.add('generated');logTo('#creative-log',`01 variant ${String(i+1).padStart(2,'0')} generated / score ${scores[i]}`,'on');if(prog)prog.style.width=`${20+(i+1)*3}%`;await wait(90)}
  steps[1].className='creative-step done';steps[2].classList.add('active');setState('#creative-state','RUNNING / RANKING');await wait(250);variants.forEach((v,i)=>{if(i<6)v.classList.add('chosen');else v.classList.add('rejected')});logTo('#creative-log','02 ranking complete / top 6 kept / lower 6 discarded','ok');if(prog)prog.style.width='62%';await wait(420);
  steps[2].className='creative-step done';steps[3].classList.add('active');setState('#creative-state','RUNNING / QA');
  if(faults){const bad=[1,3,5];bad.forEach((i,j)=>{variants[i].classList.remove('chosen');variants[i].classList.add('rejected');qaItems[j].classList.add('fail')});qaItems[3].classList.add('pass');logTo('#creative-log','03 QA / V02 crop drift / V04 unwanted text / V06 consistency drop','warn');if(prog)prog.style.width='73%';await wait(500);setState('#creative-state','RECOVERY / DIFFERENTIAL FIX','warn');bad.forEach((i,j)=>{variants[i].classList.remove('rejected');variants[i].classList.add('fixed','chosen');qaItems[j].className='qa-item pass'});logTo('#creative-log','04 repair pass / only failed regions regenerated','gold');if(prog)prog.style.width='88%';await wait(500)}else{qaItems.forEach(x=>x.classList.add('pass'));logTo('#creative-log','03 QA / all selected variants passed','ok');if(prog)prog.style.width='88%';await wait(450)}
  steps[3].className='creative-step done';steps[4].classList.add('active');setState('#creative-state','PACKAGING / 6 ASSETS');await wait(350);const pack=q('#creative-pack');if(pack)pack.classList.add('done');steps[4].className='creative-step done';if(prog)prog.style.width='100%';logTo('#creative-log','05 delivery pack / 6 finals + manifest + QA note','ok');setState('#creative-state','COMPLETED / 6 FINALS','done');running=false;disable([crRun,crFault,crReset],false)}
 crRun.addEventListener('click',()=>crGo(false));crFault.addEventListener('click',()=>crGo(true));crReset.addEventListener('click',crResetAll);crResetAll();
}

/* DATA RESCUE */
const dRun=q('#data-run'),dReset=q('#data-reset');
if(dRun&&dReset){
 let running=false;const rows=qa('.data-row'),flows=qa('.data-flow span');
 function dResetAll(){running=false;setState('#data-state','READY / 18 ROWS');rows.forEach(r=>{const base=r.dataset.initial||(r.dataset.issue?'':'clean');r.className=`data-row ${base}`.trim()});flows.forEach(f=>f.className='');[['#data-dup','2'],['#data-null','3'],['#data-type','4'],['#data-out','0']].forEach(([id,v])=>{const e=q(id);if(e)e.textContent=v});qa('.data-stat').forEach(x=>x.classList.remove('active','pass'));clearLog('#data-log');logTo('#data-log','waiting / schema v3 expected / reconciliation rules ready');disable([dRun,dReset],false)}
 async function dGo(){if(running)return;running=true;disable([dRun,dReset],true);clearLog('#data-log');setState('#data-state','RUNNING / PROFILE');flows[0].classList.add('active');q('#stat-profile')?.classList.add('active');logTo('#data-log','00 profile / 18 rows / 5 columns / schema drift detected','warn');await wait(430);flows[0].className='done';flows[1].classList.add('active');
  setState('#data-state','RUNNING / QUARANTINE','warn');rows.filter(r=>r.dataset.issue==='dup').forEach(r=>r.classList.add('quarantine'));q('#data-dup').textContent='0';q('#stat-dup')?.classList.add('pass');logTo('#data-log','01 duplicate keys 2 / moved to quarantine / canonical rows kept','gold');await wait(460);flows[1].className='done';flows[2].classList.add('active');
  rows.filter(r=>r.dataset.issue==='type').forEach(r=>{r.classList.remove('bad','warn');r.classList.add('clean')});q('#data-type').textContent='0';q('#stat-type')?.classList.add('pass');logTo('#data-log','02 type repair / currency string → integer / date → ISO-8601','ok');await wait(420);flows[2].className='done';flows[3].classList.add('active');
  rows.filter(r=>r.dataset.issue==='null').forEach(r=>{r.classList.remove('bad','warn');r.classList.add('clean')});q('#data-null').textContent='0';q('#stat-null')?.classList.add('pass');logTo('#data-log','03 missing values / recoverable values joined from source B / unresolved 0','ok');await wait(440);flows[3].className='done';flows[4].classList.add('active');setState('#data-state','RECONCILING / COUNTS');
  const good=rows.filter(r=>!r.classList.contains('quarantine'));good.forEach(r=>r.classList.add('clean'));q('#data-out').textContent='16';q('#stat-out')?.classList.add('pass');logTo('#data-log','04 reconcile / input 18 - duplicate 2 = output 16 / totals matched','ok');await wait(500);flows[4].className='done';flows[5].classList.add('active');await wait(300);flows[5].className='done';setState('#data-state','COMPLETED / CLEAN DATASET','done');logTo('#data-log','05 export / clean.csv + quarantine.csv + repair-report.json','ok');running=false;disable([dRun,dReset],false)}
 dRun.addEventListener('click',dGo);dReset.addEventListener('click',dResetAll);dResetAll();
}

/* RESPONSIVE REPAIR */
const wBreak=q('#web-break'),wFix=q('#web-fix'),wReset=q('#web-reset');
if(wBreak&&wFix&&wReset){
 let running=false,broken=false;const mobile=q('#device-mobile'),tests=qa('.test-card'),matrix=qa('.browser-matrix span'),patch=q('#patch-sheet');
 function wResetAll(){running=false;broken=false;mobile.classList.remove('broken','fixed');setState('#web-state','READY / 3 VIEWPORTS');tests.forEach(t=>t.className='test-card');matrix.forEach(m=>m.className='');patch.innerHTML='<span>/* no patch yet */</span>';clearLog('#web-log');logTo('#web-log','waiting / desktop 1440 / tablet 768 / mobile 390');disable([wBreak,wFix,wReset],false)}
 async function breakIt(){if(running||broken)return;running=true;disable([wBreak,wFix,wReset],true);setState('#web-state','FAULT INJECTED / MOBILE','warn');mobile.classList.add('broken');tests[0].classList.add('fail');tests[1].classList.add('fail');matrix[0].classList.add('pass');matrix[1].classList.add('pass');matrix[2].classList.add('fail');clearLog('#web-log');logTo('#web-log','00 mobile width 390 / layout width 551 / horizontal overflow +161px','warn');await wait(430);tests[2].classList.add('pass');logTo('#web-log','01 desktop/tablet remain healthy / failure isolated to mobile','ok');broken=true;running=false;disable([wBreak,wFix,wReset],false)}
 async function fixIt(){if(running||!broken)return;running=true;disable([wBreak,wFix,wReset],true);setState('#web-state','SCANNING / COMPUTED LAYOUT','warn');logTo('#web-log','02 trace overflow / .hero grid min-width + card fixed width','gold');await wait(420);patch.innerHTML='<span class="del">- grid-template-columns: 210px 130px;</span><br><span class="add">+ grid-template-columns: 1fr;</span><br><span class="del">- .card { width:110px }</span><br><span class="add">+ .card { width:auto }</span>';await wait(500);mobile.classList.remove('broken');mobile.classList.add('fixed');tests.forEach(t=>{t.classList.remove('fail');t.classList.add('pass')});matrix.forEach(m=>m.className='pass');setState('#web-state','VERIFYING / 3 VIEWPORTS');logTo('#web-log','03 patch applied / overflow 0px / cards stack on mobile','ok');await wait(430);logTo('#web-log','04 visual matrix PASS / desktop PASS / tablet PASS / mobile PASS','ok');setState('#web-state','COMPLETED / 3 × PASS','done');running=false;disable([wBreak,wFix,wReset],false)}
 wBreak.addEventListener('click',breakIt);wFix.addEventListener('click',fixIt);wReset.addEventListener('click',wResetAll);wResetAll();
}
})();