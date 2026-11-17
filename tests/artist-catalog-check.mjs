import assert from 'node:assert/strict';
import { createHash, randomBytes } from 'node:crypto';
import { createRequire } from 'node:module';
import { chromium } from '@playwright/test';
import { PrismaClient } from '@prisma/client';
const require=createRequire(import.meta.url); require('@next/env').loadEnvConfig(process.cwd());
const base=process.env.TEST_BASE_URL||'http://localhost:3018',db=new PrismaClient(),suffix=Date.now().toString(36);
const email=`catalog-${suffix}@example.invalid`,token=randomBytes(32).toString('base64url'),id='2RdwBSPQiwcmiDo9kixcl8';
const sid=n=>String(n).padStart(22,'0');
const track=n=>({id:sid(n),name:`Catalog song ${n}`,artist:'Pharrell Williams',thumb:null,album_id:sid(999),album_name:'Catalog album',release_date:'2014-03-03'});
const album=n=>({id:sid(n+1000),name:`Catalog release ${n}`,image:null,url:`https://open.spotify.com/album/${sid(n+1000)}`,release_date:'2014-03-03',album_type:'album',album_group:'appears_on'});
const payload=(overrides={})=>({artist:{id,name:'Pharrell Williams',image:null,url:`https://open.spotify.com/artist/${id}`,genres:[]},tracks:Array.from({length:24},(_,i)=>track(i)),albums:Array.from({length:24},(_,i)=>album(i)),next_cursor:'3.0',next_release_offset:24,release_total:770,scanned_releases:3,unavailable:[],next_offset:null,...overrides});
let browser,inviteID,userID;
try{
 inviteID=(await db.invite.create({data:{email,tokenHash:createHash('sha256').update(token).digest('hex'),createdBy:'4',expiresAt:new Date(Date.now()+3600000)}})).id;
 browser=await chromium.launch({channel:'chrome',headless:true}); const context=await browser.newContext({baseURL:base,viewport:{width:390,height:844}});
 const signup=await context.request.post('/api/auth/sign-up/email',{headers:{Origin:base,'x-invite-token':token},data:{email,password:randomBytes(24).toString('hex'),username:`catalog_${suffix}`,name:'Catalog check'}});assert.equal(signup.status(),200);userID=(await db.user.findUniqueOrThrow({where:{email}})).id;
 const page=await context.newPage();page.setDefaultTimeout(12000);const errors=[];page.on('pageerror',e=>errors.push(e.message));
 let mode='partial',calls=[],releasePending;
 await page.route('**/api/artist?*',async route=>{
  const p=new URL(route.request().url()).searchParams,section=p.get('section')||'all';calls.push({section,cursor:p.get('cursor'),offset:p.get('offset')});
  if(section==='all')return route.fulfill({json:payload()});
  if(section==='releases')return route.fulfill({json:payload({tracks:[],albums:Array.from({length:24},(_,i)=>album(i+24)),next_cursor:null,next_release_offset:null,release_total:48})});
  if(mode==='partial')return route.fulfill({json:payload({tracks:[track(23),track(24)],albums:[],next_cursor:'4.0',next_release_offset:null,scanned_releases:4,unavailable:['tracks']})});
  if(mode==='hold'){await new Promise(resolve=>releasePending=resolve);return route.fulfill({json:payload({tracks:[track(99)],albums:[],next_cursor:null,next_release_offset:null,scanned_releases:770})}).catch(()=>{});}
  if(mode==='finish')return route.fulfill({json:payload({tracks:[track(25),track(26)],albums:[],next_cursor:null,next_release_offset:null,scanned_releases:770})});
  return route.fulfill({json:payload({tracks:Array.from({length:24},(_,i)=>track(i+25)),albums:[],next_cursor:'7.0',next_release_offset:null,scanned_releases:7})});
 });
 await page.goto(`/artist/${id}`);await page.getByRole('heading',{name:'Pharrell Williams',exact:true}).waitFor();
 const songs=page.locator('section[aria-labelledby="artist-songs"]'),releases=page.locator('section[aria-labelledby="artist-releases"]');
 await songs.locator('article').nth(23).waitFor();assert.equal(await songs.locator('article').count(),24);
 await songs.getByRole('button',{name:'Load more songs',exact:true}).click();await songs.getByRole('button',{name:'Retry songs',exact:true}).waitFor();
 assert.equal(await songs.locator('article').count(),25,'partial results are kept and duplicate IDs are removed');
 mode='success';await songs.getByRole('button',{name:'Retry songs',exact:true}).click();await songs.locator('article').nth(48).waitFor();
 assert.equal(calls.filter(c=>c.section==='songs').at(-1).cursor,'4.0','retry starts at failed release');
 await releases.getByRole('button',{name:'Load more releases',exact:true}).click();await releases.locator('article').nth(47).waitFor();assert.equal(await songs.locator('article').count(),49);
 await page.getByLabel('Filter loaded songs',{exact:true}).fill('Catalog song 48');assert.equal(await songs.locator('article').count(),1);
 await page.getByLabel('Filter loaded songs',{exact:true}).fill('');assert.equal(await songs.locator('article').count(),49);
 mode='hold';await songs.getByRole('button',{name:'Load full catalog',exact:true}).click();await songs.getByRole('button',{name:/Stop/}).waitFor();
 await songs.getByRole('button',{name:/Stop/}).click();releasePending?.();await page.waitForTimeout(200);assert.equal(await songs.locator('article').count(),49,'Stop prevents late results');
 mode='finish';await songs.getByRole('button',{name:'Load full catalog',exact:true}).click();await songs.getByText(/All available releases checked/).waitFor();
 assert.equal(await songs.getByRole('button',{name:'Load more songs',exact:true}).getAttribute('aria-disabled'),'true');
 await page.unroute('**/api/artist?*');let releaseOld;const old=new Promise(resolve=>releaseOld=resolve);const other='0KuF7reCTOZwV7YJnHQqgr';
 await page.route('**/api/artist?*',async route=>{if(new URL(route.request().url()).searchParams.get('spotifyId')===id){await old;return route.fulfill({json:payload()}).catch(()=>{});}return route.fulfill({json:payload({artist:{...payload().artist,id:other,name:'The Neptunes'},tracks:[],albums:[],next_cursor:null,next_release_offset:null,release_total:0,scanned_releases:0})});});
 const pending=page.waitForRequest(r=>r.url().includes('/api/artist?'));await page.reload({waitUntil:'domcontentloaded'});await pending;
 await page.evaluate(id=>window.next.router.push(`/artist/${id}`),other);await page.getByRole('heading',{name:'The Neptunes',exact:true}).waitFor();releaseOld();await page.waitForTimeout(100);assert.equal(await page.getByRole('heading',{name:'Pharrell Williams',exact:true}).count(),0);
 assert.deepEqual(errors,[]);console.log(JSON.stringify({passed:true,checks:['24-item batches','mid-catalog retry','exact-ID dedupe','independent release paging','loaded filter','stop ignores late response','full catalog completion','route change cancellation']}));
}catch(error){console.error(JSON.stringify({testFailure:error.message}));throw error;}finally{if(userID)await db.post.deleteMany({where:{authorId:userID}});await db.user.deleteMany({where:{email}});if(inviteID)await db.invite.deleteMany({where:{id:inviteID}});await browser?.close();await db.$disconnect();}
