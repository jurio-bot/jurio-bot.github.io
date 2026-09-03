import { chromium } from 'playwright';

const base = process.env.DEMO_BASE_URL || 'http://127.0.0.1:4173';
const browser = await chromium.launch({headless:true});
const page = await browser.newPage({viewport:{width:1440,height:1100}});

await page.goto(`${base}/demo.html`,{waitUntil:'networkidle'});
await page.waitForSelector('.dm-card');
const cards=await page.locator('.dm-card').count();
if(cards!==46) throw new Error(`demo menu expected 46 cards, got ${cards}`);

async function waitHash(){
  await page.waitForFunction(() => {
    const e=document.querySelector('#ev-hash');
    return e && e.textContent && e.textContent.trim() !== '—';
  }, null, {timeout:15000});
}

async function waitArtifact(p=page){
  await p.waitForFunction(() => {
    const e=document.querySelector('#amase-artifact');
    return e && !e.querySelector('.amase-empty') && (e.textContent||'').trim().length>0;
  }, null, {timeout:10000});
}

async function hiddenText(selector){
  return (await page.locator(selector).evaluate(e=>e.textContent||'')).trim();
}

async function run(id, verify){
  const url=`${base}/demo-view.html?id=${encodeURIComponent(id)}`;
  await page.goto(url,{waitUntil:'networkidle'});
  await page.waitForSelector('#de-start');
  await page.waitForSelector('#amase-result');
  const kicker=await page.locator('#de-kicker').innerText();
  if(!kicker.includes('BROWSER DEMO')) throw new Error(`${id}: Amase process badge missing`);
  await page.click('#de-start');
  await waitHash();
  await waitArtifact();
  const outputs=Number(await hiddenText('#m-output'));
  if(outputs < 1) throw new Error(`${id}: no verified output`);
  const hash=await hiddenText('#ev-hash');
  if(!/^[0-9a-f]{16}/i.test(hash)) throw new Error(`${id}: invalid SHA evidence ${hash}`);
  if(await page.locator('#amase-artifact .real-output-preview').count()) throw new Error(`${id}: raw output leaked into primary result`);
  const artifact=(await page.locator('#amase-artifact').innerText()).trim();
  if(!artifact) throw new Error(`${id}: artifact presentation empty`);
  await verify?.(page);
  console.log(`PASS ${id} hash=${hash}`);
}

await run('work-agentlink', async p => {
  await p.locator('#amase-tech > summary').click();
  await p.click('[data-fault="worker crash"]');
  await p.click('#de-start');
  await p.waitForFunction(()=>Number(document.querySelector('#m-recovered')?.textContent||0)>0,null,{timeout:15000});
  await waitArtifact(p);
  const receipt=await p.locator('#amase-artifact').innerText();
  if(!receipt.includes('RECEIPT')) throw new Error('agentlink: receipt cards missing');
});

await run('svc-entry-100', async p => {
  const txt=await p.locator('#amase-artifact').innerText();
  if(!txt.includes('100')) throw new Error('data: 100-row result not presented');
  if(await p.locator('#amase-artifact a[download="clean-data.csv"]').count()!==1) throw new Error('data: CSV download missing from artifact');
});

await run('svc-web-fix', async p => {
  await p.waitForFunction(()=>document.querySelectorAll('.real-viewport.good').length>=3,null,{timeout:10000});
  const txt=await p.locator('#amase-artifact').innerText();
  if(!txt.includes('PASS')) throw new Error('web: viewport pass result missing');
});

await run('work-proof-antiquity', async p => {
  if(await p.locator('#amase-artifact a[download="hash-chain.json"]').count()!==1) throw new Error('chain: downloadable chain evidence missing');
  const blocks=await p.locator('#amase-artifact .real-block.good').count();
  if(blocks < 5) throw new Error(`chain: only ${blocks} presented blocks`);
});

const mobile=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
await mobile.goto(`${base}/demo-view.html?id=svc-entry-100`,{waitUntil:'networkidle'});
await mobile.waitForSelector('.amase-flow');
let overflow=await mobile.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);
if(overflow>1) throw new Error(`mobile overflow before run: ${overflow}px`);
await mobile.click('#de-start');
await waitArtifact(mobile);
overflow=await mobile.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);
if(overflow>1) throw new Error(`mobile overflow after run: ${overflow}px`);
await mobile.close();

await browser.close();
console.log('AMASE_REAL_DEMO_BROWSER_TESTS_OK');
