(()=>{
const demos=window.PD_DEMOS||[],$=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const root=$('#dm-groups'); if(!root)return;
const order=['works','書類・入力','売る・お店','写真・動画・音','片付け・PC','調べる・文章','開発・自動化'];
const labels={works:['01 / WORKS','制作物'], '書類・入力':['02 / DOCUMENT','書類・入力'], '売る・お店':['03 / COMMERCE','売る・お店'], '写真・動画・音':['04 / MEDIA','写真・動画・音'], '片付け・PC':['05 / PC','片付け・PC'], '調べる・文章':['06 / RESEARCH','調べる・文章'], '開発・自動化':['07 / TECH','開発・自動化']};
function key(d){return d.group==='works'?'works':d.cat}
function mode(d){if(d.id==='svc-api-connect')return'REAL NETWORK';if(['terminal','benchmark'].includes(d.family))return'REAL ANALYSIS';return'REAL CORE'}
function card(d,i){return `<a class="dm-card" data-key="${key(d)}" href="/demo-view.html?id=${encodeURIComponent(d.id)}"><small>${String(i+1).padStart(2,'0')} / ${d.cat} / ${d.family.toUpperCase()}</small><h3>${d.title}</h3><p>${d.desc}</p><b style="display:inline-block;margin-top:10px;font:800 8px/1 ui-monospace,SFMono-Regular,Menlo,monospace;letter-spacing:.08em;color:#2f7449">● ${mode(d)}</b><span class="dm-steps">${d.steps.map(()=>'<i></i>').join('')}</span></a>`}
root.innerHTML=order.map(k=>{const arr=demos.filter(d=>key(d)===k);if(!arr.length)return'';const l=labels[k];return `<section class="dm-group" data-group="${k}"><header class="dm-group-head"><small>${l[0]} / ${arr.length}</small><h2>${l[1]}</h2></header><div class="dm-grid">${arr.map((d,i)=>card(d,i)).join('')}</div></section>`}).join('');
const buttons=$$('.dm-filter button');buttons.forEach(b=>b.addEventListener('click',()=>{buttons.forEach(x=>x.classList.toggle('active',x===b));const f=b.dataset.filter;$$('.dm-group').forEach(g=>g.classList.toggle('hidden',f!=='all'&&g.dataset.group!==f))}));
$('#dm-total').textContent=demos.length;$('#dm-works').textContent=demos.filter(d=>d.group==='works').length;$('#dm-services').textContent=demos.filter(d=>d.group==='services').length;
})();