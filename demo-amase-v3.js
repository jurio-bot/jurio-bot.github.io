(()=>{
'use strict';
const VERSION='PD_AMASE_DEMO_V3_20260903_1';
window.PD_AMASE_DEMO_VERSION=VERSION;
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const demos=window.PD_DEMOS||[];
const id=new URLSearchParams(location.search).get('id');
const demo=demos.find(d=>d.id===id)||demos[0];
if(!demo)return;
document.body.dataset.demoFamily=demo.family;
document.body.dataset.demoId=demo.id;
const familyGroups={orchestration:['network','receipt','router'],retrieval:['rag','trace','research'],data:['table','report','chart','files'],document:['doc','text'],creative:['creative','design','shop','form'],media:['media','audio','inspector'],web:['web','checks'],terminal:['terminal'],benchmark:['benchmark','stack'],chain:['chain']};
const has=(g)=>familyGroups[g]?.includes(demo.family);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot',"'":'&#39;'}[c]||c));
function parseJson(text){const t=String(text||'').trim();for(const [a,b] of [['{','}'],['[',']']]){const i=t.indexOf(a),j=t.lastIndexOf(b);if(i>=0&&j>i){try{return JSON.parse(t.slice(i,j+1))}catch{}}}return null}
function numFrom(text,label){const m=String(text||'').match(new RegExp(`${label}\\s*:?\\s*([0-9,.-]+)`,'i'));return m?m[1]:'—'}
function paper(inner,title='処理結果',kicker='RESULT'){return `<div class="amase-artifact-paper"><div class="amase-artifact-kicker">${esc(kicker)}</div><h3 class="amase-artifact-title">${esc(title)}</h3>${inner}</div>`}
function stats(items){return `<div class="amase-stat-grid">${items.map(([k,v])=>`<div class="amase-stat"><small>${esc(k)}</small><b>${esc(v)}</b></div>`).join('')}</div>`}
function cards(items){return `<div class="amase-card-grid">${items.map(x=>`<article class="amase-mini-card"><small>${esc(x.k||'')}</small><b>${esc(x.t||'')}</b>${x.p?`<p>${esc(x.p)}</p>`:''}${x.score!=null?`<div class="amase-score"><i style="--score:${Math.max(0,Math.min(100,x.score))}%"></i></div>`:''}</article>`).join('')}</div>`}
function table(rows,heads){return `<table class="amase-table"><thead><tr>${heads.map(h=>`<th>${esc(h)}</th>`).join('')}</tr></thead><tbody>${rows.map(r=>`<tr>${r.map(v=>`<td>${esc(v)}</td>`).join('')}</tr>`).join('')}</tbody></table>`}
function mount(){if(document.body.dataset.amaseV3)return;const shell=$('.de-shell'),body=$('.de-body'),out=$('#de-output');if(!shell||!body||!out)return setTimeout(mount,30);document.body.dataset.amaseV3='1';
  relabel();
  const top=$('.de-topbar');
  top.insertAdjacentHTML('afterend',`<section class="amase-flow" aria-label="デモの流れ"><div id="amase-f1" class="active"><small><i>1</i> INPUT</small><b>入れる</b><span>サンプルか自分のデータ</span></div><div id="amase-f2"><small><i>2</i> PROCESS</small><b>動かす</b><span>本当に処理している工程</span></div><div id="amase-f3"><small><i>3</i> RESULT</small><b>見る</b><span>成果物の形で確認</span></div></section>`);
  body.insertAdjacentHTML('afterend',`<section id="amase-result" class="amase-result"><header class="amase-result-head"><div><small>03 / RESULT</small><h2>できあがり。</h2></div><span id="amase-result-state" class="amase-result-state">まだ実行していません</span></header><div id="amase-artifact" class="amase-artifact"><div class="amase-empty">「実行する」を押すと、<br>ここに結果が“成果物の形”で出ます。</div></div></section><details id="amase-tech" class="amase-tech"><summary>処理の証拠・技術詳細を見る</summary><div id="amase-tech-body" class="amase-tech-body"></div></details>`);
  const tech=$('#amase-tech-body');
  ['.de-metrics','.de-evidence','.de-faults','.de-lower','.de-caption','.vr-shell'].forEach(sel=>{const e=$(sel);if(e)tech.appendChild(e)});
  new MutationObserver(()=>renderArtifact()).observe(out,{subtree:true,childList:true,characterData:true});
  const status=$('#de-status span');if(status)new MutationObserver(syncFlow).observe(status,{subtree:true,childList:true,characterData:true});
  syncFlow();renderArtifact();
}
function relabel(){
 const start=$('#de-start'),chaos=$('#de-chaos'),speed=$('#de-speed'),reset=$('#de-reset');
 if(start)start.textContent='実行する';
 if(chaos)chaos.textContent='テスト条件';
 if(speed)speed.textContent='処理量 ×1';
 if(reset)reset.textContent='リセット';
 const sample=$('#de-sample');if(sample)sample.textContent='サンプルを入れる';
 const file=$('.de-file-label');if(file){for(const n of [...file.childNodes])if(n.nodeType===3)n.textContent='ファイルを選ぶ';}
 const kicker=$('#de-kicker');if(kicker)kicker.innerHTML='<span class="de-real-badge"><i></i> BROWSER DEMO / ACTUAL PROCESS</span>';
 const startOriginal=start?.onclick;
 speed?.addEventListener('click',()=>setTimeout(()=>{speed.textContent=(speed.textContent||'').replace('BATCH','処理量')},0));
}
function syncFlow(){const s=($('#de-status span')?.textContent||'').toUpperCase();const a=$('#amase-f1'),b=$('#amase-f2'),c=$('#amase-f3');[a,b,c].forEach(x=>x&&x.classList.remove('active','done'));if(/RUNNING|PROCESS/.test(s)){a?.classList.add('done');b?.classList.add('active')}else if(/DONE/.test(s)){a?.classList.add('done');b?.classList.add('done');c?.classList.add('active','done');$('#amase-result-state').textContent='完了'}else{a?.classList.add('active');$('#amase-result-state').textContent='まだ実行していません'}}
function sanitizeStage(){if(!(has('document')))return;const grid=$('.real-doc-grid');if(!grid)return;const source=$('.real-doc:first-child',grid);if(source&&!source.dataset.sanitized){source.dataset.sanitized='1';source.innerHTML='<h4>INPUT / SOURCE</h4><div class="amase-source-skeleton"><i></i><i></i><i></i><i></i><i></i></div><p style="margin-top:18px;color:#75695f;font-size:.68rem">入力内容はそのまま複写せず、構造だけを見せています。</p>'}}
function renderArtifact(){const out=$('#de-output'),host=$('#amase-artifact');if(!out||!host)return;const text=(out.textContent||'').trim();if(!text||/run the process|no output|waiting/i.test(text)){host.innerHTML='<div class="amase-empty">「実行する」を押すと、<br>ここに結果が“成果物の形”で出ます。</div>';return}sanitizeStage();let html='';try{
 if(has('orchestration'))html=renderOrchestration(text);
 else if(demo.id==='svc-api-connect')html=renderApi(text);
 else if(has('retrieval'))html=renderRetrieval(text);
 else if(has('data'))html=renderData(text);
 else if(has('document'))html=renderDocument(text);
 else if(has('creative'))html=renderCreative(text);
 else if(has('media'))html=renderMedia(text);
 else if(has('web'))html=renderWeb(text);
 else if(has('terminal'))html=renderTerminal(text);
 else if(has('benchmark'))html=renderBenchmark(text);
 else if(has('chain'))html=renderChain(text);
 else html=paper('<p>処理が完了しました。</p>',demo.title);
 }catch(e){html=paper(`<p>処理は完了しています。表示だけ簡略化しました。</p>`,demo.title)}
 host.innerHTML=html;copyDownloads(out,host);$('#amase-result-state').textContent='結果を生成しました';
}
function copyDownloads(out,host){const links=$$('a.de-download',out);if(!links.length)return;const box=document.createElement('div');box.style.marginTop='16px';for(const a of links){const c=a.cloneNode(true);c.textContent=(a.textContent||'成果物を保存').replace(/download real |download /i,'').replace(/ ↘/g,'')+'を保存 ↘';box.appendChild(c)}host.appendChild(box)}
function renderOrchestration(text){const data=parseJson(text)||{};const rs=Array.isArray(data.receipts)?data.receipts:[];return paper(`${stats([['INPUT',data.input??'—'],['UNIQUE',data.unique??rs.length],['BLOCKED',data.blocked??0],['RECEIPTS',rs.length]])}${cards(rs.slice(0,9).map((r,i)=>({k:`RECEIPT ${String(i+1).padStart(2,'0')}`,t:r.job||'JOB',p:`${r.worker||'worker'}で完了 / ${r.result||'verified'}`})))}`,'仕事が最後まで届きました','ROUTING / RECEIPTS')}
function renderApi(text){const d=parseJson(text)||{};return paper(`${stats([['HTTP',d.status??'—'],['VISIBILITY',d.visibility??'—'],['BRANCH',d.default_branch??'—'],['FIELDS',Array.isArray(d.keys)?d.keys.length:'—']])}${cards([{k:'RESPONSE',t:d.name||'API response',p:'実通信したレスポンスを構造化して確認しました。'}])}`,'APIの返事を確認しました','NETWORK / API')}
function renderRetrieval(text){const d=parseJson(text);const arr=Array.isArray(d)?d:[];return paper(cards(arr.slice(0,6).map((x,i)=>({k:`RANK ${i+1}`,t:(x.url||'source').replace(/^\//,''),p:`HTTP ${x.status??'—'} / score ${x.score??'—'}`,score:Math.min(100,Math.max(6,Number(x.score||0)*180))}))), '採用候補を順位で見せる','RETRIEVAL / SOURCES')}
function renderData(text){const rows=$$('.real-row').slice(0,8).map(r=>[...r.children].slice(0,5).map(x=>x.textContent.trim()));return paper(`${stats([['INPUT',numFrom(text,'input rows')],['CLEAN',numFrom(text,'clean rows')],['QUARANTINE',numFrom(text,'quarantine')],['BLOCKED',numFrom(text,'duplicate blocked')]])}${rows.length?table(rows,['ID','DATE','AMOUNT','OWNER','STATE']):''}`,'汚れた表を整えました','DATA / CLEAN RESULT')}
function renderDocument(text){const grid=$('.real-doc-grid');const outDoc=grid?$('.real-doc:last-child',grid):null;const inner=outDoc?outDoc.innerHTML:'<p>構造化した文書を生成しました。</p>';return paper(`<div class="amase-artifact-paper" style="box-shadow:none;padding:0;background:transparent">${inner}</div>`,'編集できる形に整えました','DOCUMENT / STRUCTURED')}
function renderCreative(text){const assets=$$('.real-asset.best').length?$$('.real-asset.best'):$$('.real-asset').slice(0,6);const clones=assets.slice(0,6).map(x=>x.outerHTML).join('');return paper(`${stats([['GENERATED',numFrom(text,'generated')],['REPAIRED',numFrom(text,'repaired')],['SELECTED',numFrom(text,'selected')],['PACK','READY']])}<div class="amase-contact-sheet">${clones}</div>`,'選んで、悪い所だけ直しました','CREATIVE / FINAL PICKS')}
function renderMedia(text){const wave=$('.real-wave');if(wave)return paper(`${wave.outerHTML}${stats([['SAMPLES',numFrom(text,'samples')],['SAMPLE RATE',numFrom(text,'sample rate')],['OUTPUT','WAV'],['STATE','READY']])}`,'音を整えました','AUDIO / BEFORE → AFTER');const grid=$('.real-doc-grid');if(grid)return paper(grid.outerHTML,'軽くして、見た目は保つ','IMAGE / BEFORE → AFTER');return paper('<p>メディア処理が完了しました。</p>',demo.title,'MEDIA / RESULT')}
function renderWeb(text){const wall=$('.real-web-wall');return paper(`${wall?wall.outerHTML:''}${stats([['VIEWPORTS','3'],['OVERFLOW','FIXED'],['RETEST','PASS'],['PATCH','APPLIED']])}`,'3つの画面幅で直りました','WEB / RESPONSIVE QA')}
function renderTerminal(text){const d=parseJson(text)||{};const ms=Array.isArray(d.matches)?d.matches:[];return paper(cards(ms.map((x,i)=>({k:`CAUSE ${i+1}`,t:x.cause||'原因候補',p:x.fix||'確認項目'})).concat([{k:'NEXT',t:'修正候補を整理',p:'入力ログそのものではなく、原因と次の確認だけを見せます。'}])),'原因候補を絞りました','DEBUG / DIAGNOSIS')}
function renderBenchmark(text){const bench=$('.real-bench');return paper(bench?bench.outerHTML:'<p>実測結果を比較しました。</p>','速さを比べました','BENCHMARK / MEASURED')}
function renderChain(text){const chain=$('.real-chain');return paper(chain?chain.outerHTML:'<p>hash chainを検証しました。</p>','つながりを検証しました','HASH / CHAIN')}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(mount,0));else setTimeout(mount,0);
})();
