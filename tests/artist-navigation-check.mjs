import assert from 'node:assert/strict';
import { createHash, randomBytes } from 'node:crypto';
import { mkdir } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { chromium } from '@playwright/test';
import { PrismaClient } from '@prisma/client';
const require = createRequire(import.meta.url);
require('@next/env').loadEnvConfig(process.cwd());
const base = process.env.TEST_BASE_URL || 'http://localhost:3018';
const output = process.env.TEST_SCREENSHOT_DIR || '.impeccable/review/artist-navigation';
const db = new PrismaClient();
const suffix = Date.now().toString(36), email = `artist-${suffix}@example.invalid`, username = `artist_${suffix}`;
const token = randomBytes(32).toString('base64url'), password = randomBytes(24).toString('hex');
const artistID = '2RdwBSPQiwcmiDo9kixcl8', trackID = '60nZcImufyMA1MKQY3dcCH';
let browser, inviteID, userID;
try {
  await mkdir(output, { recursive: true });
  browser = await chromium.launch({ channel: 'chrome', headless: true });
  const context = await browser.newContext({ baseURL: base, viewport: { width: 390, height: 844 } });
  assert.equal((await context.request.get(`/api/artist?spotifyId=${artistID}`)).status(), 401);
  const page = await context.newPage(); page.setDefaultTimeout(20000);
  const errors = []; page.on('pageerror', error => errors.push(error.message));
  await page.goto(`/artist/${artistID}`); assert.equal(new URL(page.url()).pathname, '/auth/signin');
  inviteID = (await db.invite.create({ data: { email, tokenHash: createHash('sha256').update(token).digest('hex'), createdBy: '4', expiresAt: new Date(Date.now()+3600000) } })).id;
  const signup = await context.request.post('/api/auth/sign-up/email', { headers: { Origin: base, 'x-invite-token': token }, data: { email, password, username, name: 'Artist navigation check' } });
  assert.equal(signup.status(), 200, 'Temporary invited member can join');
  userID = (await db.user.findUniqueOrThrow({ where: { email } })).id;
  await context.request.post('/api/auth/sign-out', { headers: { Origin: base }, data: {} });
  const signin = await context.request.post('/api/auth/sign-in/email', { headers: { Origin: base }, data: { email, password } });
  assert.equal(signin.status(), 200, 'Email sign-in works without Spotify');
  const artistResponse = await context.request.get(`/api/artist?spotifyId=${artistID}`);
  assert.equal(artistResponse.status(), 200); assert.match(artistResponse.headers()['cache-control'], /no-store/);
  const artist = await artistResponse.json(); assert.equal(artist.artist.name, 'Pharrell Williams'); assert.ok(artist.tracks.length); assert.ok(artist.albums.length);
  const searchResponse = await context.request.post('/api/search', { data: { query: 'Pharrell', scope: 'all' } });
  assert.equal(searchResponse.status(), 200); assert.ok((await searchResponse.json()).artists.some(a=>a.id===artistID));
  await page.goto(`/ext/spotify/${trackID}`);
  await page.locator('.track-artist').getByRole('link', { name: 'Pharrell Williams', exact: true }).waitFor();
  if (process.env.TEST_EXPECT_CREDITS === '1') {
    await page.locator('.liner-credits').getByText('Producer', { exact: true }).first().waitFor();
    assert.equal(await page.getByText('We could not load credits right now. Refresh to try again.').count(), 0);
  }
  await page.screenshot({ path: `${output}/happy-390.png`, fullPage: true });
  await page.locator('.track-artist').getByRole('link', { name: 'Pharrell Williams', exact: true }).click();
  await page.waitForURL(`**/artist/${artistID}`);
  await page.getByRole('heading', { name: 'Pharrell Williams', exact: true }).waitFor();
  await page.getByRole('heading', { name: 'Songs', exact: true }).waitFor();
  for (const theme of ['dark', 'light']) {
    if (await page.evaluate(()=>document.documentElement.dataset.theme) !== theme)
      await page.getByRole('button', { name: theme==='light'?'Turn the light on':'Turn the light off' }).click();
    for (const width of [390, 320, 1440]) {
      await page.setViewportSize({ width, height: width>760?1000:844 });
      await page.evaluate(()=>document.fonts.ready);
      await page.waitForTimeout(150);
      assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth), false, `No overflow at ${width}`);
      await page.screenshot({ path: `${output}/artist-${theme}-${width}.png`, fullPage: true });
    }
  }
  const search = page.getByRole('combobox', { name: 'Search artists, people, and music' });
  await search.fill('Pharrell');
  await page.getByRole('group', { name: 'Artists', exact: true }).getByRole('option').first().waitFor();
  await search.press('ArrowDown'); await search.press('Enter');
  await page.waitForURL(`**/artist/${artistID}`); await page.getByRole('heading', { name: 'Pharrell Williams', exact: true }).waitFor();
  await page.locator(`#main-content a[href="/ext/spotify/${trackID}"]`).first().click();
  await page.getByRole('link', { name: 'Post this track', exact: true }).click();
  await page.getByLabel('Your note', { exact: false }).fill('Artist navigation release check.');
  await page.getByRole('button', { name: 'Post to my feed', exact: true }).click();
  await page.waitForURL(`**/u/${username}`);
  assert.equal(await db.post.count({ where: { authorId: userID } }), 1);
  await page.getByRole('heading', { name: 'Artist navigation check', exact: true }).waitFor();
  if (process.env.TEST_UI_FAILURES === '1') {
    let mode = 'failure';
    await page.route('**/api/artist?*', async route => {
      if (mode === 'timeout') return;
      if (mode === 'failure') return route.fulfill({status:502,json:{error:'Unavailable'}});
      if (mode === 'session') return route.fulfill({status:401,json:{error:'Sign in'}});
      if (mode === 'partial') return route.fulfill({json:{...artist,tracks:[],unavailable:['tracks']}});
      return route.fulfill({json:artist});
    });
    await page.goto(`/artist/${artistID}`);
    await page.getByRole('alert').getByText('The artist is unavailable. Try again.').waitFor();
    mode = 'partial'; await page.getByRole('button',{name:'Try again',exact:true}).click();
    await page.getByRole('button',{name:'Retry songs',exact:true}).waitFor();
    await page.getByRole('heading',{name:'Releases',exact:true}).waitFor();
    mode = 'success'; await page.getByRole('button',{name:'Retry songs',exact:true}).click();
    await page.locator(`#main-content a[href="/ext/spotify/${trackID}"]`).first().waitFor();
    mode = 'session'; await page.reload();
    await page.getByRole('link',{name:'Sign in',exact:true}).waitFor();
    assert.equal(await page.getByRole('heading',{name:'Pharrell Williams',exact:true}).count(),0);
    await page.clock.install(); mode='timeout';
    const pending=page.waitForRequest(r=>r.url().includes('/api/artist?'));
    await page.reload({waitUntil:'domcontentloaded'}); await pending;
    await page.clock.runFor(12001);
    await page.getByRole('alert').getByText('The artist took too long to load. Try again.').waitFor();
    await page.clock.resume(); await page.unroute('**/api/artist?*');
    const otherID='0KuF7reCTOZwV7YJnHQqgr'; let release;
    const old = new Promise(resolve=>release=resolve);
    await page.route('**/api/artist?*',async route=>{
      if(new URL(route.request().url()).searchParams.get('spotifyId')===artistID) { await old; return route.fulfill({json:artist}).catch(()=>{}); }
      return route.fulfill({json:{...artist,artist:{...artist.artist,id:otherID,name:'The Neptunes'},tracks:[],albums:[],next_offset:null}});
    });
    const started=page.waitForRequest(r=>r.url().includes(`/api/artist?spotifyId=${artistID}`));
    await page.reload({waitUntil:'domcontentloaded'}); await started;
    await page.evaluate(id=>window.next.router.push(`/artist/${id}`),otherID);
    await page.getByRole('heading',{name:'The Neptunes',exact:true}).waitFor(); release();
    await page.waitForTimeout(200);
    assert.equal(await page.getByRole('heading',{name:'Pharrell Williams',exact:true}).count(),0);
  }
  assert.deepEqual(errors, []);
  console.log(JSON.stringify({ passed: true, checks: ['private API/page', 'email sign-in', 'Happy artist link', 'real artist API/search', 'keyboard artist search', 'both themes 320/390/1440', 'artist song to manual post', 'profile'], credits: process.env.TEST_EXPECT_CREDITS === '1' }));
} finally {
  if (userID) await db.post.deleteMany({ where: { authorId: userID } });
  await db.user.deleteMany({ where: { email } });
  if (inviteID) await db.invite.deleteMany({ where: { id: inviteID } });
  await browser?.close(); await db.$disconnect();
}
