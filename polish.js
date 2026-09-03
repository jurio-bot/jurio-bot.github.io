(()=>{
  const root=document.documentElement;
  const body=document.body;
  const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const progress=document.createElement('div');
  progress.className='site-progress'; progress.setAttribute('aria-hidden','true'); body.append(progress);
  const coord=document.createElement('div');
  coord.className='site-coordinate'; coord.setAttribute('aria-hidden','true');
  coord.textContent=`AMASE / ${location.pathname==='/'?'HOME':location.pathname.split('/').filter(Boolean).pop()?.replace('.html','').toUpperCase()||'INDEX'}`;
  body.append(coord);
  const topbar=document.querySelector('.topbar');
  const nav=topbar?.querySelector('nav');
  const samePath=[...document.querySelectorAll('.topbar a')].find(a=>{try{return new URL(a.href,location.href).pathname===location.pathname}catch{return false}});
  samePath?.setAttribute('aria-current','page');
  let lastY=scrollY, ticking=false;
  const paintScroll=()=>{
    const max=Math.max(1,document.documentElement.scrollHeight-innerHeight);
    root.style.setProperty('--scroll-progress',Math.min(1,scrollY/max));
    topbar?.classList.toggle('is-compact',scrollY>24);
    if(innerWidth<=560&&nav){
      const down=scrollY>lastY+5&&scrollY>180;
      const up=scrollY<lastY-5;
      if(down)nav.classList.add('nav-away'); else if(up||scrollY<100)nav.classList.remove('nav-away');
    }
    lastY=scrollY; ticking=false;
  };
  addEventListener('scroll',()=>{if(!ticking){requestAnimationFrame(paintScroll);ticking=true}},{passive:true}); paintScroll();
  const reveal=[...document.querySelectorAll('.home-title>* ,.desk-note,.status-strip,.fresh>*,.work-door,.made>*,.notes>*,.catalog-intro>*,.catalog-block>header,.feature-main,.feature-pair,.demo-list>a,.oss-lines>a,.work-intro>*,.launch-note,.work-index,.work-rule,.catalog-rows>a,.catalog-end,.paper>.meta,.paper>h1,.paper>.lede,.paper>.rule,.paper>h2,.paper>p,.paper>.card')];
  reveal.forEach((el,i)=>{el.dataset.reveal=i<5?'fast':''; if(i<4)el.dataset.revealDelay=String(i%4)});
  if(reduce){reveal.forEach(el=>el.classList.add('is-visible'))}
  else if('IntersectionObserver' in window){
    const io=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('is-visible');io.unobserve(e.target)}}),{rootMargin:'0px 0px -8% 0px',threshold:.06});
    reveal.forEach(el=>io.observe(el));
  }else reveal.forEach(el=>el.classList.add('is-visible'));
  const note=document.querySelector('.desk-note');
  if(note&&!reduce&&matchMedia('(pointer:fine)').matches){
    note.addEventListener('pointermove',e=>{const r=note.getBoundingClientRect(),x=(e.clientX-r.left)/r.width,y=(e.clientY-r.top)/r.height;note.style.setProperty('--note-ry',`${(x-.5)*4}deg`);note.style.setProperty('--note-rx',`${(.5-y)*4}deg`);note.style.setProperty('--note-x',`${x*100}%`);note.style.setProperty('--note-yy',`${y*100}%`)});
    note.addEventListener('pointerleave',()=>{note.style.setProperty('--note-ry','0deg');note.style.setProperty('--note-rx','0deg')});
  }
  const previewTargets=[...document.querySelectorAll('[data-preview]')];
  if(previewTargets.length&&!reduce){
    const box=document.createElement('div'); box.className='shelf-preview'; box.setAttribute('aria-hidden','true'); box.innerHTML='<small></small><strong></strong><code></code>'; body.append(box);
    const place=e=>{const w=300,h=170,pad=20;let x=e.clientX+24,y=e.clientY+20;if(x+w>innerWidth-pad)x=e.clientX-w-24;if(y+h>innerHeight-pad)y=innerHeight-h-pad;box.style.setProperty('--preview-x',`${Math.max(pad,x)}px`);box.style.setProperty('--preview-y',`${Math.max(pad,y)}px`)};
    previewTargets.forEach(el=>{el.addEventListener('pointerenter',e=>{box.querySelector('small').textContent=el.dataset.previewKind||'index';box.querySelector('strong').textContent=el.querySelector('strong,h3')?.textContent?.trim()||'project';box.querySelector('code').textContent=el.dataset.preview;place(e);box.classList.add('is-on')});el.addEventListener('pointermove',place);el.addEventListener('pointerleave',()=>box.classList.remove('is-on'))});
  }
  const sections=[...document.querySelectorAll('.work-catalog .catalog-block[id]')], indexLinks=[...document.querySelectorAll('.work-index a[href^="#"]')];
  if(sections.length&&indexLinks.length&&'IntersectionObserver' in window){
    const sio=new IntersectionObserver(entries=>{const hit=entries.filter(e=>e.isIntersecting).sort((a,b)=>b.intersectionRatio-a.intersectionRatio)[0];if(!hit)return;indexLinks.forEach(a=>a.classList.toggle('is-current',a.getAttribute('href')===`#${hit.target.id}`))},{rootMargin:'-18% 0px -62% 0px',threshold:[0,.1,.4]});
    sections.forEach(s=>sio.observe(s));
  }
})();
