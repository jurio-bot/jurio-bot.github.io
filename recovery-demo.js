(()=>{
const btn=document.querySelector('#break-route');if(!btn)return;
const primary=document.querySelector('#node-primary');
const fallback=document.querySelector('#node-fallback');
const delivery=document.querySelector('#node-delivery');
const status=document.querySelector('#recovery-status');
const log=document.querySelector('#recovery-log');
const lines=[...log.querySelectorAll('p')];
let running=false,done=false;
const wait=ms=>new Promise(r=>setTimeout(r,ms));
function reset(){done=false;primary.classList.remove('failed');fallback.classList.remove('active');delivery.classList.remove('done');status.classList.remove('recovered');status.innerHTML='<i></i><span>NORMAL ROUTE</span>';lines.forEach((l,i)=>l.classList.toggle('on',i===0));btn.textContent='わざと止める';}
async function run(){if(running)return;if(done){reset();return}running=true;btn.disabled=true;lines.forEach(l=>l.classList.remove('on'));lines[0].classList.add('on');await wait(450);primary.classList.add('failed');lines[1].classList.add('on');await wait(650);fallback.classList.add('active');lines[2].classList.add('on');await wait(700);delivery.classList.add('done');lines[3].classList.add('on');status.classList.add('recovered');status.innerHTML='<i></i><span>RECOVERED / COMPLETED</span>';await wait(300);btn.disabled=false;btn.textContent='もう一度';running=false;done=true;}
btn.addEventListener('click',run);reset();
})();