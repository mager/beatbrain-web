import assert from 'node:assert/strict';
import { randomBytes, createHash } from 'node:crypto';
import { mkdir } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { chromium } from '@playwright/test';
import { PrismaClient } from '@prisma/client';
const require=createRequire(import.meta.url);
require('@next/env').loadEnvConfig(process.cwd());
const base=process.env.TEST_BASE_URL || 'http://localhost:3011';
const output=process.env.TEST_SCREENSHOT_DIR || '.impeccable/review/connections';
const db=new PrismaClient();
const suffix=Date.now().toString(36),email=`connections-${suffix}@example.invalid`,username=`links_${suffix}`;
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
 const signup=await context.request.post('/api/auth/sign-up/email',{headers:{Origin:base,'x-invite-token':token},data:{email,password,username,name:'Song connections check'}});
 assert.equal(signup.status(),200);userID=(await db.user.findUniqueOrThrow({where:{email}})).id;
 const pages=[
  {id:'f1a6a40f-78f5-4918-968d-f64363bae94c',title:'Harder, Better, Faster, Stronger',section:'.song-connections',name:'connections'},
  {id:'db6c7347-34e9-4023-acf4-a1ce6d0f409b',title:'Band on the Run',section:'.song-studios',name:'studios'},
 ];
 for(const song of pages){
  const response=await page.goto(`/song/${song.id}`);assert.equal(response.status(),200);
  await page.locator('h1').waitFor();
  assert.match(await page.locator('h1').innerText(),song.name==='studios'?/Band [Oo]n [Tt]he Run/:/Harder.*Better.*Faster.*Stronger/);
  await page.locator(song.section).waitFor();
  if(song.name==='connections'){
   const sample=page.locator('.song-connections-list li').filter({hasText:'Cola Bottle Baby'});
   assert.match(await sample.innerText(),/^Samples/);
   assert.match(await sample.innerText(),/Edwin Birdsong/);
   assert.equal(await sample.locator('a').getAttribute('href'),'/song/40c14d4c-ed39-4c3f-8183-b93d62a7e460');
   const details=page.locator('.song-connections-more');
   await details.locator('summary').focus();await page.keyboard.press('Enter');
   assert.equal(await details.evaluate(el=>el.open),true);
   assert.ok(await details.locator('li').count()>0);
   await details.locator('summary').press('Enter');assert.equal(await details.evaluate(el=>el.open),false);
  }else{
   await page.locator('.song-studios').getByText('Air Studios',{exact:true}).waitFor();
   await page.locator('.song-studios').getByText('Additional recording at',{exact:true}).waitFor();
   assert.match(await page.locator('.song-studios').innerText(),/October 1973/);
   await page.locator('.song-studios').getByText('Kingsway Studios',{exact:true}).waitFor();
  }
  for(const theme of ['light','dark']){
   const current=await page.evaluate(()=>document.documentElement.dataset.theme);
   if(current!==theme)await page.getByRole('button',{name:theme==='light'?'Turn the light on':'Turn the light off'}).click();
   await page.waitForFunction(t=>document.documentElement.dataset.theme===t,theme);
   for(const width of [1440,390,320]){
    await page.setViewportSize({width,height:width>760?1000:844});
    await page.evaluate(()=>document.fonts.ready);
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,`${song.name} ${theme} ${width} overflow`);
    await page.locator(song.section).evaluate(el=>el.scrollIntoView({block:'center',behavior:'instant'}));
    await page.locator(song.section).screenshot({path:`${output}/${song.name}-${theme}-${width}.png`,animations:'disabled'});
    if(width===1440)await page.screenshot({path:`${output}/${song.name}-${theme}-page.png`,fullPage:true,animations:'disabled'});
   }
  }
 }
 await page.goto('/song/f1a6a40f-78f5-4918-968d-f64363bae94c');
 await page.locator('.song-connections-list a[href="/song/40c14d4c-ed39-4c3f-8183-b93d62a7e460"]').click();
 await page.waitForURL('**/song/40c14d4c-ed39-4c3f-8183-b93d62a7e460');
 await page.getByRole('heading',{name:'Cola Bottle Baby',exact:true}).waitFor();
 await page.reload();
 assert.equal(await page.evaluate(()=>document.querySelector('#__NEXT_DATA__') && JSON.parse(document.querySelector('#__NEXT_DATA__').textContent).props.pageProps.track.id),'40c14d4c-ed39-4c3f-8183-b93d62a7e460');
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
 console.log(JSON.stringify({passed:true,base,checks:['real sample source','studio places and dates','additional credit','keyboard expansion','recording navigation','empty sections','both themes at 1440/390/320','access','sign-in','manual posting','profile']}));
}finally{
 if(userID){await db.post.deleteMany({where:{authorId:userID}});await db.user.deleteMany({where:{id:userID}});}
 else await db.user.deleteMany({where:{email}});
 if(inviteID)await db.invite.deleteMany({where:{id:inviteID}});
 await browser?.close();await db.$disconnect();
}
