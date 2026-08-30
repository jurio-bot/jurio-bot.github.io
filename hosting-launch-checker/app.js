const checks=[['HTTPS','https:// で始まっているか'],['Redirect','http→https / www有無が一貫しているか'],['robots.txt','/robots.txt が公開されているか'],['sitemap.xml','/sitemap.xml が公開されているか'],['Headers','HSTS / Content-Type / cache 方針を確認'],['404','存在しないURLで404が返るか']];

document.querySelector('#f').addEventListener('submit',e=>{
  e.preventDefault();
  const u=document.querySelector('#u').value;
  const result=document.querySelector('#r');
  result.replaceChildren();
  const heading=document.createElement('h2');
  heading.textContent=u;
  result.appendChild(heading);
  for(const [name,detail] of checks){
    const card=document.createElement('div');
    card.className='card';
    const title=document.createElement('b');
    title.textContent=name;
    const body=document.createElement('p');
    body.textContent=detail;
    card.append(title,body);
    result.appendChild(card);
  }
  renderOffers();
});

function renderOffers(){
  const o=(window.AFFILIATE_OFFERS||[]).filter(x=>x.enabled);
  const target=document.querySelector('#offers');
  target.replaceChildren();
  if(!o.length)return;
  const heading=document.createElement('h2');
  heading.textContent='関連サービス';
  target.appendChild(heading);
  for(const offer of o){
    const card=document.createElement('div');
    card.className='card';
    const link=document.createElement('a');
    link.rel='sponsored nofollow noopener';
    link.target='_blank';
    link.href=offer.url;
    link.textContent=offer.label;
    const disclosure=document.createElement('p');
    disclosure.textContent='広告リンクを含みます。';
    card.append(link,disclosure);
    target.appendChild(card);
  }
}
