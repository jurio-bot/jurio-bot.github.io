(()=>{
const demos=window.PD_DEMOS||[],$=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const root=$('#dm-groups');if(!root)return;
const order=['works','書類・入力','売る・お店','写真・動画・音','片付け・PC','調べる・文章','開発・自動化'];
const labels={works:['01 / WORKS','制作物'], '書類・入力':['02 / DOCUMENT','書類・入力'], '売る・お店':['03 / COMMERCE','売る・お店'], '写真・動画・音':['04 / MEDIA','写真・動画・音'], '片付け・PC':['05 / PC','片付け・PC'], '調べる・文章':['06 / RESEARCH','調べる・文章'], '開発・自動化':['07 / TECH','開発・自動化']};
function key(d){return d.group==='works'?'works':d.cat}
function card(d,i){const proof=d.proof?'実物あり':'その場で試せる';return `<a class="dm-card" data-key="${key(d)}" href="/demo-view.html?id=${encodeURIComponent(d.id)}"><div class="dm-card-top"><small>${String(i+1).padStart(2,'0')} / ${d.cat}</small><em>${proof}</em></div><h3>${d.title}</h3><p>${d.desc}</p><div class="dm-card-flow"><span>入れる</span><i>→</i><span>動かす</span><i>→</i><span>見る</span></div><b class="dm-open">デモを見る ↗</b></a>`}
root.innerHTML=order.map((k,groupIndex)=>{const arr=demos.filter(d=>key(d)===k);if(!arr.length)return'';const l=labels[k],id=k==='works'?'works':groupIndex===1?'services':'';return `<section class="dm-group" ${id?`id="${id}"`:''} data-group="${k}"><header class="dm-group-head"><small>${l[0]} / ${arr.length}</small><h2>${l[1]}</h2></header><div class="dm-grid">${arr.map((d,i)=>card(d,i)).join('')}</div></section>`}).join('');
const buttons=$$('.dm-filter button');buttons.forEach(b=>b.addEventListener('click',()=>{buttons.forEach(x=>x.classList.toggle('active',x===b));const f=b.dataset.filter;$$('.dm-group').forEach(g=>g.classList.toggle('hidden',f!=='all'&&g.dataset.group!==f))}));
$('#dm-total').textContent=demos.length;$('#dm-works').textContent=demos.filter(d=>d.group==='works').length;$('#dm-services').textContent=demos.filter(d=>d.group==='services').length;
})();