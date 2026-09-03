(()=>{
'use strict';
const VERSION='PD_DEMO_UI_V2_20260903_2';
window.PD_DEMO_UI_VERSION=VERSION;
const $=(s,r=document)=>r.querySelector(s);
function labelButtons(){
 const start=$('#de-start'),chaos=$('#de-chaos'),speed=$('#de-speed'),reset=$('#de-reset');
 if(start)start.textContent='実行する';
 if(chaos)chaos.textContent='テスト条件を追加';
 if(speed) speed.textContent=speed.textContent.replace('BATCH','処理量');
 if(reset)reset.textContent='リセット';
 const sample=$('#de-sample');if(sample)sample.textContent='サンプルを入れる';
 const file=$('.de-file-label');if(file){const input=$('input',file);file.childNodes[0].textContent='ファイルを選ぶ';if(input)file.appendChild(input)}
}
function humanStatus(raw){
 const s=String(raw||'').toUpperCase();
 if(s.includes('ERROR'))return['エラー','is-error'];
 if(s.includes('DONE')||s.includes('VERIFIED'))return['完了','is-done'];
 if(s.includes('RUNNING')||s.includes('PROCESS'))return['処理中','is-live'];
 return['準備OK',''];
}
function mount(){
 if(document.body.dataset.duiReady)return;
 const shell=$('.de-shell'),top=$('.de-topbar'),body=$('.de-body'),out=$('#de-output');
 if(!shell||!top||!body||!out)return setTimeout(mount,40);
 document.body.dataset.duiReady='1';
 labelButtons();
 top.insertAdjacentHTML('afterend',`<section class="dui-overview" aria-label="デモの流れ"><div id="dui-flow-input"><small><i>1</i> INPUT</small><b>入力する</b><span>文章やファイルを入れる</span></div><div id="dui-flow-process"><small><i>2</i> PROCESS</small><b>実際に処理する</b><span>処理の進行をそのまま表示</span></div><div id="dui-flow-result"><small><i>3</i> RESULT</small><b>完成を見る</b><span>処理後の成果物を確認</span></div></section>`);
 const actions=$('.de-actions');
 if(actions){const b=document.createElement('button');b.className='dui-details-toggle';b.type='button';b.textContent='技術詳細を見る';b.addEventListener('click',()=>{const on=document.body.classList.toggle('dui-advanced');b.textContent=on?'詳細を閉じる':'技術詳細を見る'});actions.appendChild(b)}
 body.insertAdjacentHTML('afterend',`<section class="dui-result"><div class="dui-result-head"><div><small>3 / RESULT</small><h2>処理結果</h2></div><div id="dui-result-state" class="dui-result-state">まだ実行していません</div></div><div id="dui-result-body" class="dui-result-body"><p>「実行する」を押すと、ここに完成結果が出ます。</p></div></section>`);
 const target=$('#dui-result-body'),state=$('#dui-result-state');
 const mirror=()=>{target.innerHTML=out.innerHTML;const txt=(out.textContent||'').trim();if(!txt||/run the process|no output yet/i.test(txt))state.textContent='まだ実行していません';else state.textContent='結果を生成しました'};
 new MutationObserver(mirror).observe(out,{subtree:true,childList:true,characterData:true});mirror();
 const status=$('#de-status span');
 const sync=()=>{const [,cls]=humanStatus(status?.textContent);const p=$('#dui-flow-process'),r=$('#dui-flow-result');p.classList.remove('is-live','is-done');r.classList.remove('is-live','is-done');if(cls==='is-live')p.classList.add('is-live');if(cls==='is-done'){p.classList.add('is-done');r.classList.add('is-done')}if(state&&cls==='is-live')state.textContent='処理中…';if(state&&cls==='is-done')state.textContent='完了';};
 if(status)new MutationObserver(sync).observe(status,{subtree:true,childList:true,characterData:true});sync();
 const textarea=$('#de-user-input');if(textarea&&!textarea.placeholder)textarea.placeholder='ここに入力してください';
 const inputWrap=$('.de-inputbar');if(inputWrap)inputWrap.addEventListener('focusin',()=>$('#dui-flow-input')?.classList.add('is-live'));
 const start=$('#de-start');if(start)start.addEventListener('click',()=>{window.requestAnimationFrame(()=>$('#dui-flow-process')?.scrollIntoView({behavior:'smooth',block:'nearest'}))});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(mount,0));else setTimeout(mount,0);
})();
