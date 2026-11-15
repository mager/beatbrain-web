import assert from 'node:assert/strict';
import { createHmac,randomBytes } from 'node:crypto';
import { mkdir,writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { chromium } from '@playwright/test';
import { PrismaClient } from '@prisma/client';
const require=createRequire(import.meta.url);require('@next/env').loadEnvConfig(process.cwd());
const base=process.env.TEST_BASE_URL || 'http://localhost:3015';
const output=process.env.TEST_SCREENSHOT_DIR || '.impeccable/review/creator';
const pharrell='149f91ef-1287-46da-9a8e-87fee02f1471',neptunes='253bfe58-d68a-4f96-9b7a-70d977cbf66d',alright='b5e1e12f-8832-4ba4-b772-de15e2db2009';
const db=new PrismaClient();let user,browser;
try{
 await mkdir(output,{recursive:true});
 user=await db.user.create({data:{id:randomBytes(16).toString('hex'),name:'Creator catalog check',email:`creator-${Date.now()}@example.invalid`,username:`creator_${Date.now()}`}});
 const token=randomBytes(32).toString('hex');
 await db.session.create({data:{id:randomBytes(16).toString('hex'),userId:user.id,token,expiresAt:new Date(Date.now()+3600000),createdAt:new Date(),updatedAt:new Date()}});
 browser=await chromium.launch({channel:'chrome',headless:true});
 const context=await browser.newContext({baseURL:base,viewport:{width:1440,height:1000},colorScheme:'dark'});
 const guest=await context.request.get(`/api/creator?mbid=${pharrell}`);assert.equal(guest.status(),401);
 const value=encodeURIComponent(token+'.'+createHmac('sha256',process.env.BETTER_AUTH_SECRET).update(token).digest('base64'));
 await context.addCookies([{name:base.startsWith('https:')?'__Secure-better-auth.session_token':'better-auth.session_token',value,domain:new URL(base).hostname,path:'/'}]);
 const page=await context.newPage();page.setDefaultTimeout(30000);
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(`/creator/${pharrell}?role=production`);
 await page.getByRole('heading',{name:'Pharrell Williams',exact:true}).waitFor();
 assert.equal(await page.getByRole('button',{name:'Production',exact:true}).getAttribute('aria-pressed'),'true');
 assert.equal(await page.getByRole('list',{name:'Creator credits'}).locator(':scope > li').count(),24);
 await page.getByRole('button',{name:'Show more credits'}).click();
 assert.equal(await page.getByRole('list',{name:'Creator credits'}).locator(':scope > li').count(),48);
 await page.getByLabel('Search this catalog').fill('Alright');
 const list=page.getByRole('list',{name:'Creator credits'});assert.ok(await list.locator(':scope > li').count()>=1);
 assert.match(await list.innerText(),/Kendrick Lamar/);
 await page.getByLabel('Search this catalog').fill('Get Lucky');
 await page.getByRole('heading',{name:'No matching credits.'}).waitFor();
 await page.getByRole('button',{name:'Performance',exact:true}).click();
 await page.getByRole('link',{name:'Get Lucky',exact:true}).first().waitFor();
 await page.getByRole('button',{name:'Compositions',exact:true}).click();
 await page.getByRole('button',{name:'Writing',exact:true}).click();
 await page.getByLabel('Search this catalog').fill('Happy');
 assert.ok(await list.locator('a[href^="https://musicbrainz.org/work/"]').count()>0);
 await page.getByRole('button',{name:'Songs',exact:true}).click();
 await page.getByRole('button',{name:'Production',exact:true}).click();
 await page.getByLabel('Search this catalog').fill('Alright');
 await page.waitForFunction(()=>Array.from(document.querySelectorAll('ul[aria-label="Creator credits"] img')).some(img=>img.complete&&img.naturalWidth>0),undefined,{timeout:25000}).catch(()=>{});
 for(const theme of ['dark','light']){
  await page.evaluate(theme=>{document.documentElement.dataset.theme=theme;localStorage.setItem('beatbrain-theme',theme)},theme);
  for(const width of [1440,390,320]){
   await page.setViewportSize({width,height:width>760?1000:844});await page.evaluate(async()=>{await document.fonts.ready;scrollTo(0,0);await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));});
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,`${theme} ${width} overflow`);
   await page.screenshot({path:`${output}/${theme}-${width}.png`,fullPage:false,animations:'disabled'});
  }
 }
 await page.setViewportSize({width:390,height:844});const groups=page.locator('header details summary');await groups.focus();await page.keyboard.press('Enter');assert.equal(await page.locator('header details').evaluate(el=>el.open),true);await page.locator('header details a').filter({hasText:'The Neptunes'}).waitFor();await page.screenshot({path:`${output}/mobile-groups.png`,fullPage:false,animations:'disabled'});await groups.press('Enter');
 const search=page.getByLabel('Search this catalog');await search.focus();assert.equal(await search.evaluate(el=>el===document.activeElement),true);
 // Capture a real multi-song catalog after the focused credit checks.
 await page.setViewportSize({width:1440,height:1000});await page.evaluate(()=>document.documentElement.dataset.theme='dark');
 await search.fill('');
 await page.screenshot({path:`${output}/desktop.png`,fullPage:true,animations:'disabled'});
 const group=page.locator(`aside a[href="/creator/${neptunes}"]`);assert.equal(await group.count(),1);
 await group.click();await page.getByRole('heading',{name:'The Neptunes',exact:true}).waitFor();
 await page.getByLabel('Search this catalog').fill('Milkshake');assert.match(await list.innerText(),/Kelis/);
 const snapshot=await context.request.get(`/api/creator?mbid=${pharrell}`);assert.equal(snapshot.status(),200);const creator=await snapshot.json();
 await writeFile(`${output}/creator-response.json`,JSON.stringify(creator,null,2));
 // Error/retry and empty data are explicit fixtures; the catalog checks above are live.
 let fail=true;
 await page.route(`**/api/creator?mbid=${pharrell}`,route=>route.fulfill({status:fail?503:200,contentType:'application/json',body:JSON.stringify(fail?{error:'Creator credits could not be loaded. Please try again.'}:{...creator,catalog:[]})}));
 await page.goto(`/creator/${pharrell}`);await page.getByRole('heading',{name:'Credits are unavailable.'}).waitFor();
 fail=false;await page.getByRole('button',{name:'Try again',exact:true}).click();await page.getByRole('heading',{name:'No credits in this source yet.'}).waitFor();
 await page.unroute(`**/api/creator?mbid=${pharrell}`);
 await page.goto(`/creator/${pharrell}?role=production`);await page.getByLabel('Search this catalog').fill('Alright');
 await page.locator(`a[href="/song/${alright}"]`).first().click();
 await page.getByRole('heading',{name:'Alright',exact:true}).waitFor();
 const producer=page.locator(`a[href="/creator/${pharrell}?role=production"]`);assert.ok(await producer.count()>0);
 const post=page.getByRole('link',{name:'Post this track',exact:true});await post.click();await page.waitForURL('**/create?track=*');
 await page.getByLabel('Your note',{exact:false}).fill('Temporary creator catalog check.');
 await page.getByRole('button',{name:'Post to my feed',exact:true}).click();await page.waitForURL(`**/u/${user.username}`);
 assert.equal(await db.post.count({where:{authorId:user.id}}),1);
 assert.deepEqual(errors,[]);
 console.log(JSON.stringify({passed:true,checks:['live Pharrell catalog','production versus vocals','compositions','pagination and search reset','Neptunes group credits','both themes desktop and mobile','keyboard search','error retry','empty data','song navigation','producer role link','manual posting','profile','private access']}));
}finally{
 if(user){await db.post.deleteMany({where:{authorId:user.id}});await db.user.delete({where:{id:user.id}});}
 await browser?.close();await db.$disconnect();
}
