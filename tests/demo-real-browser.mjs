import { chromium } from 'playwright';

const base = process.env.DEMO_BASE_URL || 'http://127.0.0.1:4173';
const browser = await chromium.launch({headless:true});
const page = await browser.newPage({viewport:{width:1440,height:1100}});

async function waitHash(){
  await page.waitForFunction(() => {
    const e=document.querySelector('#ev-hash');
    return e && e.textContent && e.textContent.trim() !== '—';
  }, {timeout:15000});
}

async function run(id, verify){
  const url=`${base}/demo-view.html?id=${encodeURIComponent(id)}`;
  await page.goto(url,{waitUntil:'networkidle'});
  await page.waitForSelector('#de-start');
  const kicker=await page.locator('#de-kicker').innerText();
  if(!kicker.includes('REAL')) throw new Error(`${id}: real-process badge missing`);
  await page.click('#de-start');
  await waitHash();
  const outputs=Number(await page.locator('#m-output').innerText());
  if(outputs < 1) throw new Error(`${id}: no verified output`);
  const hash=(await page.locator('#ev-hash').innerText()).trim();
  if(!/^[0-9a-f]{16}/i.test(hash)) throw new Error(`${id}: invalid SHA evidence ${hash}`);
  await verify?.(page);
  console.log(`PASS ${id} hash=${hash}`);
}

await run('work-agentlink', async p => {
  await p.click('[data-fault="worker crash"]');
  await p.click('#de-start');
  await p.waitForFunction(()=>Number(document.querySelector('#m-recovered')?.textContent||0)>0,{timeout:15000});
  const receipt=await p.locator('#de-output').innerText();
  if(!receipt.includes('receipts')) throw new Error('agentlink: receipt ledger output missing');
});

await run('svc-entry-100', async p => {
  const txt=await p.locator('#de-output').innerText();
  if(!txt.includes('input rows: 100')) throw new Error('data: 100-row process did not run');
  if(await p.locator('#de-output a[download="clean-data.csv"]').count()!==1) throw new Error('data: real CSV download missing');
});

await run('svc-web-fix', async p => {
  await p.waitForFunction(()=>document.querySelectorAll('.real-viewport.good').length===3,{timeout:10000});
  const txt=await p.locator('#de-output').innerText();
  if(!txt.includes('scroll')) throw new Error('web: measured viewport evidence missing');
});

await run('work-proof-antiquity', async p => {
  if(await p.locator('#de-output a[download="hash-chain.json"]').count()!==1) throw new Error('chain: downloadable chain evidence missing');
  const blocks=await p.locator('.real-block.good').count();
  if(blocks < 5) throw new Error(`chain: only ${blocks} verified blocks`);
});

await browser.close();
console.log('REAL_DEMO_BROWSER_TESTS_OK');
