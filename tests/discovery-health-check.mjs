import assert from 'node:assert/strict';
import { randomBytes, createHash } from 'node:crypto';
import { mkdir } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { chromium } from '@playwright/test';
import { PrismaClient } from '@prisma/client';
const require=createRequire(import.meta.url);
require('@next/env').loadEnvConfig(process.cwd());
const base=process.env.TEST_BASE_URL || 'http://localhost:3012';
const output=process.env.TEST_SCREENSHOT_DIR || '.impeccable/review/discovery-health';
const db=new PrismaClient();
const suffix=Date.now().toString(36),email=`discovery-${suffix}@example.invalid`,username=`links_${suffix}`;
const token=randomBytes(32).toString('base64url'),password=randomBytes(24).toString('hex');
let browser,inviteID,userID;
try {
 await mkdir(output,{recursive:true});
 browser=await chromium.launch({channel:'chrome',headless:true});
 const context=await browser.newContext({baseURL:base,viewport:{width:1440,height:1000},colorScheme:'light'});
 const page=await context.newPage();
 page.setDefaultTimeout(30000);
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 assert.equal((await context.request.get('/api/feed')).status(),401);
 const invite=await db.invite.create({data:{email,tokenHash:createHash('sha256').update(token).digest('hex'),createdBy:'4',expiresAt:new Date(Date.now()+3600000)}});inviteID=invite.id;
 const signup=await context.request.post('/api/auth/sign-up/email',{headers:{Origin:base,'x-invite-token':token},data:{email,password,username,name:'Discovery check'}});
 assert.equal(signup.status(),200);userID=(await db.user.findUniqueOrThrow({where:{email}})).id;
 await page.goto('/discover');
 await page.getByRole('button',{name:'Worldwide',exact:true}).click();
 await page.locator('.discovery-track').first().waitFor();
 await page.locator('.discovery-sources summary').focus();await page.keyboard.press('Enter');
 assert.equal(await page.locator('.discovery-sources').evaluate(el=>el.open),true);
 assert.equal(await page.locator('.discovery-source-status li').count(),5);
 const health=await context.request.post('/api/discover',{data:{mode:'world'}});
 assert.equal(health.status(),200);
 const payload=await health.json();
 assert.equal(payload.sources.length,5);
 if(process.env.REQUIRE_LIVE_HEALTH==='true')assert.ok(payload.sources.some(source=>source.status==='current'));
 for(const theme of ['light','dark']){
  const current=await page.evaluate(()=>document.documentElement.dataset.theme);
  if(current!==theme)await page.getByRole('button',{name:theme==='light'?'Turn the light on':'Turn the light off'}).click();
  for(const width of [1440,390,320]){
   await page.setViewportSize({width,height:width>760?1000:844});
   await page.evaluate(()=>document.fonts.ready);
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,`${theme} ${width} overflow`);
   await page.locator('.discovery-sources').screenshot({path:`${output}/sources-${theme}-${width}.png`,animations:'disabled'});
  }
 }
 // A delayed source must keep its own date, and an error must not reuse it.
 await page.route('**/api/discover',route=>route.fulfill({json:{...payload,sources:[{source:'apple_music_charts',updated:'2026-11-10',status:'delayed',matched:39,total:50},{source:'spotify_new_releases',updated:'2026-11-13',status:'current',matched:74,total:74}]}}));
 await page.reload();await page.getByRole('button',{name:'Worldwide',exact:true}).click();
 await page.getByText('1 of 5 sources checked today',{exact:true}).waitFor();
 await page.locator('.discovery-sources summary').click();
 assert.match(await page.locator('.discovery-source-status li').filter({hasText:'Apple Music'}).innerText(),/Checked Nov 10 · Update delayed/);
 await page.unroute('**/api/discover');
 await page.route('**/api/discover',route=>route.fulfill({status:502,json:{error:'unavailable'}}));
 await page.getByRole('button',{name:'The room',exact:true}).click();
 await page.getByRole('button',{name:'Worldwide',exact:true}).click();
 await page.getByText('Music source status unavailable',{exact:true}).waitFor();
 assert.equal(await page.locator('.discovery-source-status').getByText(/Checked Nov/).count(),0);
 await page.unroute('**/api/discover');
 await page.goto('/ext/spotify/36idurZmYRjJ56KQ8JD9bN');
 const data=await page.evaluate(()=>JSON.parse(document.querySelector('#__NEXT_DATA__').textContent).props.pageProps.track);
 if(!data.connections?.length)assert.equal(await page.locator('.song-connections').count(),0);
 if(!data.studios?.length)assert.equal(await page.locator('.song-studios').count(),0);
 await page.getByRole('link',{name:'Post this track',exact:true}).click();
 await page.waitForURL('**/create?track=*');
 await page.getByLabel('Your note',{exact:false}).fill('Release verification — temporary post.');
 await page.getByRole('button',{name:'Post to my feed',exact:true}).click();
 await page.waitForURL(`${base}/u/${username}`);
 assert.equal(await db.post.count({where:{authorId:userID}}),1);
 for(const path of ['/feed',`/u/${username}`])assert.equal((await page.goto(path)).status(),200);
 await context.request.post('/api/auth/sign-out',{headers:{Origin:base}});
 assert.equal((await context.request.post('/api/auth/sign-in/email',{headers:{Origin:base},data:{email,password}})).status(),200);
 assert.deepEqual(errors,[]);
 console.log(JSON.stringify({passed:true,base,checks:['five source dates','delayed and unavailable states','keyboard expansion','both themes at 1440/390/320','access','sign-in','manual posting','profile'],sources:payload.sources}));
}finally{
 if(userID){await db.post.deleteMany({where:{authorId:userID}});await db.user.deleteMany({where:{id:userID}});}
 else await db.user.deleteMany({where:{email}});
 if(inviteID)await db.invite.deleteMany({where:{id:inviteID}});
 await browser?.close();await db.$disconnect();
}
