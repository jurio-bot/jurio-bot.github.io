(()=>{
const root=document.documentElement,body=document.body;
const coarse=matchMedia('(pointer:coarse)').matches;
const reduced=matchMedia('(prefers-reduced-motion:reduce)').matches;
const mk=(tag,cls,html='')=>{const n=document.createElement(tag);n.className=cls;n.innerHTML=html;return n};

const grid=mk('div','field-grid'),orbit=mk('div','field-orbit');
const edgeL=mk('div','field-edge left','GENE FIELD / LOCAL SURFACE / PAPER-DAEMON');
const edgeR=mk('div','field-edge right','BOUNDARY ACTIVE / TOOLS READY / 2026');
body.append(grid,orbit,edgeL,edgeR);

const presence=mk('aside','field-presence',`<header><span>GENE FIELD</span><b>● ONLINE</b></header><p id="field-message">入口はもう開いています。ここは紹介ページではなく、作業面です。</p><small id="field-detail">LOCAL SURFACE / NO EXTERNAL SEND</small>`);
const desk=document.querySelector('.desk');
if(coarse&&desk)desk.before(presence);else body.append(presence);

const setPoint=(x,y)=>{root.style.setProperty('--field-x',`${x}px`);root.style.setProperty('--field-y',`${y}px`)};
if(!coarse) addEventListener('pointermove',e=>setPoint(e.clientX,e.clientY),{passive:true});
else addEventListener('touchstart',e=>{const t=e.touches[0];if(t)setPoint(t.clientX,t.clientY)},{passive:true});

const message=(main,detail='LOCAL SURFACE / NO EXTERNAL SEND')=>{
 const a=document.querySelector('#field-message'),b=document.querySelector('#field-detail');
 if(a)a.textContent=main;if(b)b.textContent=detail;
};
const activeLine=id=>{
 document.querySelectorAll('.live-line').forEach(x=>x.classList.remove('is-active'));
 const idx={brief:0,file:1,route:2}[id];
 const line=document.querySelectorAll('.live-line')[idx];if(line)line.classList.add('is-active');
};
const flash=()=>{const r=document.querySelector('.result-card');if(!r)return;r.classList.remove('field-result-flash');void r.offsetWidth;r.classList.add('field-result-flash')};
const working=(main,detail)=>{
 body.classList.add('field-working');message(main,detail);
 setTimeout(()=>{body.classList.remove('field-working');flash()},620);
};

body.addEventListener('click',e=>{
 const tool=e.target.closest('[data-tool]');
 if(tool){const id=tool.dataset.tool;activeLine(id);const copy={brief:['相談文の構造を拾っています。','FIELD / BRIEF SURFACE'],file:['納品前の検査面を開きました。','FIELD / DELIVERY QA'],route:['作業の進行経路を組み替えています。','FIELD / WORKFLOW ROUTING']}[id];if(copy)message(...copy);return}
 if(e.target.closest('#brief-run'))working('条件を拾って、作業の形にしています。','FIELD PROCESS / BRIEF');
 if(e.target.closest('#route-run'))working('工程、確認点、失敗しやすい場所を並べています。','FIELD PROCESS / ROUTE');
 if(e.target.closest('#dropzone'))message('ここへ置いたファイルは、この端末の中だけで見ます。','FIELD / LOCAL FILE QA');
});
body.addEventListener('change',e=>{
 if(e.target.matches('#file-input'))working('ファイルの外形を読み、納品前の確認面を作っています。','FIELD PROCESS / FILE QA');
});

const board=document.querySelector('.live-board');
if(board){const s=mk('div','field-session','<i></i><span>SESSION / LOCAL</span><span>BOUNDARY / ACTIVE</span>');board.append(s)}

if(!reduced&&!sessionStorage.getItem('gene-field-seen')){
 const init=mk('div','field-init',`<div class="field-init-inner"><div class="field-init-mark"><span>PAPER-DAEMON / FIELD</span><b>● CONNECTED</b></div><h2>領域を、開いています。</h2><p>surface / tools / local state</p><div class="field-init-line"><i></i></div><div class="field-init-seq"><span>01 SURFACE</span><span>02 TOOLS</span><span>03 READY</span></div></div>`);
 body.append(init);body.style.overflow='hidden';
 setTimeout(()=>{init.classList.add('done');body.classList.add('field-ready');body.style.overflow='';sessionStorage.setItem('gene-field-seen','1')},1250);
 setTimeout(()=>init.remove(),2200);
}else body.classList.add('field-ready');

activeLine('brief');

const observer=new MutationObserver(()=>{
 const r=document.querySelector('.result-card');
 if(r&&!r.dataset.fieldBound){r.dataset.fieldBound='1';r.addEventListener('animationend',()=>r.classList.remove('field-result-flash'))}
});
observer.observe(document.querySelector('#service-mount')||body,{childList:true,subtree:true});
})();