import assert from "node:assert/strict";
import { randomBytes, createHash } from "node:crypto";
import { PrismaClient } from "@prisma/client";
import { chromium } from "@playwright/test";
const base = process.env.TEST_BASE_URL || "http://localhost:3000";
const db = new PrismaClient();
const suffix = Date.now().toString(36);
const email = `launch-${suffix}@example.invalid`;
const username = `check_${suffix}`;
const token = randomBytes(32).toString("base64url");
const password = randomBytes(24).toString("base64url");
let browser, context, userID, inviteID;
const checks = [];
try {
  browser = await chromium.launch({ channel: "chrome", headless: true });
  context = await browser.newContext({
    baseURL: base,
    viewport: { width: 1440, height: 1050 },
  });
  for (const path of [
    "/",
    "/feed",
    "/u/mager",
    "/api/feed",
    "/api/invites",
    "/_next/data/fake/index.json",
  ]) {
    const r = await context.request.get(path, { maxRedirects: 0 });
    assert.ok([307, 401].includes(r.status()), `${path}: ${r.status()}`);
    assert.match(r.headers()["cache-control"], /no-store/);
  }
  const forged = await context.request.get("/api/feed", {
    headers: { Cookie: "better-auth.session_token=forged" },
  });
  assert.equal(forged.status(), 401);
  checks.push("guest and forged-cookie access blocked");
  const noInvite = await context.request.post("/api/auth/sign-up/email", {
    headers: { Origin: base },
    data: { email, password, name: "Launch check", username },
  });
  assert.equal(noInvite.status(), 403);
  checks.push("signup without invite blocked");
  const invite = await db.invite.create({
    data: {
      email,
      tokenHash: createHash("sha256").update(token).digest("hex"),
      createdBy: "4",
      expiresAt: new Date(Date.now() + 3600000),
    },
  });
  inviteID = invite.id;
  const page = await context.newPage();
  await page.goto("/auth/signin");
  await page.evaluate(async () => { document.querySelectorAll('img').forEach(i => i.loading = 'eager'); await Promise.all(Array.from(document.images).map(i => i.decode().catch(() => {}))); });
  await page.waitForTimeout(250);
  await page.screenshot({
    path: ".impeccable/review/entry-desktop.png",
    fullPage: true,
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.evaluate(async () => { document.querySelectorAll('img').forEach(i => i.loading = 'eager'); await Promise.all(Array.from(document.images).map(i => i.decode().catch(() => {}))); });
  await page.waitForTimeout(250);
  await page.screenshot({
    path: ".impeccable/review/entry-mobile.png",
    fullPage: true,
  });
  await page.goto(
    `/auth/signin?invite=${token}&email=${encodeURIComponent(email)}`,
  );
  await page.getByLabel("Your name", { exact: true }).fill("Launch check");
  await page.getByLabel(/^Username/).fill(username);
  await page.getByLabel(/^Password/).fill(password);
  await page
    .getByRole("button", { name: "Join the room", exact: true })
    .click();
  await page.waitForURL(base + "/", { timeout: 20000 });
  userID = (await db.user.findUniqueOrThrow({ where: { email } })).id;
  assert.ok(
    (await db.invite.findUniqueOrThrow({ where: { id: inviteID } })).usedAt,
  );
  checks.push("invited signup through browser and token claim passed");
  assert.equal((await context.request.get("/api/invites")).status(), 403);
  checks.push("member cannot create or read invites");
  const feed = await (await context.request.get("/api/feed?limit=1")).json();
  assert.ok(feed[0]?.track);
  const track = { ...feed[0].track, source: "SPOTIFY" };
  const bad = await context.request.post("/api/post", {
    headers: { Origin: base },
    data: { content: "missing track" },
  });
  assert.equal(bad.status(), 400);
  const wrongOrigin = await context.request.post("/api/post", {
    headers: { Origin: "https://example.invalid" },
    data: { track },
  });
  assert.equal(wrongOrigin.status(), 403);
  const ids = [];
  for (let i = 0; i < 2; i++) {
    const r = await context.request.post("/api/post", {
      headers: { Origin: base },
      data: { track, content: `Temporary launch check ${i}` },
    });
    assert.equal(r.status(), 201, await r.text());
    ids.push((await r.json()).id);
  }
  const html = await (await context.request.get(`/u/${username}`)).text();
  const data = JSON.parse(
    html.match(/<script id="__NEXT_DATA__"[^>]*>(.*?)<\/script>/s)[1],
  );
  assert.equal(data.props.pageProps.posts.length, 2);
  assert.ok(!("email" in data.props.pageProps.user));
  checks.push("repeat posts remain distinct; profile data excludes email");
  // A second test account owns a test post; the signed-in member must not remove it.
  const other = await db.user.create({
    data: {
      id: `other-${suffix}`,
      name: "Other test",
      email: `other-${suffix}@example.invalid`,
      username: `other_${suffix}`,
    },
  });
  const otherPost = await db.post.create({
    data: {
      authorId: other.id,
      trackId:
        feed[0].trackId ||
        (
          await db.track.findFirstOrThrow({
            where: { sourceId: track.sourceId },
          })
        ).id,
    },
  });
  try {
    assert.equal(
      (
        await context.request.delete(`/api/post/${otherPost.id}`, {
          headers: { Origin: base },
        })
      ).status(),
      404,
    );
    assert.ok(await db.post.findUnique({ where: { id: otherPost.id } }));
  } finally {
    await db.post.deleteMany({ where: { authorId: other.id } });
    await db.user.delete({ where: { id: other.id } });
  }
  for (const id of ids)
    assert.equal(
      (
        await context.request.delete(`/api/post/${id}`, {
          headers: { Origin: base },
        })
      ).status(),
      204,
    );
  checks.push("post ownership and deletion passed");
  const search = await context.request.post("/api/search", {
    data: { query: "Radiohead" },
  });
  assert.equal(search.status(), 200);
  assert.ok((await search.json()).results.length);
  checks.push("private frontend-to-Go search passed");
  await page.setViewportSize({ width: 1440, height: 1050 });
  await page.goto("/");
  await page.locator(".album-art").first().waitFor();
  await page.evaluate(() => document.fonts.ready);
  await page.evaluate(async () => { document.querySelectorAll('img').forEach(i => i.loading = 'eager'); await Promise.all(Array.from(document.images).map(i => i.decode().catch(() => {}))); });
  await page.waitForTimeout(250);
  await page.screenshot({
    path: ".impeccable/review/desktop.png",
    fullPage: false,
  });
  assert.equal(
    await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth,
    ),
    false,
  );
  const artwork = page.locator('.artwork-stage').first();
  await artwork.hover({position:{x:40,y:40}});
  assert.notEqual(await artwork.evaluate(e=>e.style.getPropertyValue('--tilt-y')), '');
  await page.waitForTimeout(500);
  await page.screenshot({path:'.impeccable/review/hover-desktop.png',fullPage:false});
  await page.emulateMedia({reducedMotion:'reduce'});
  assert.equal(await artwork.locator('.artwork-link').evaluate(e=>getComputedStyle(e).transform), 'none');
  await page.emulateMedia({reducedMotion:'no-preference'});
  await page.mouse.move(0,0);
  checks.push('cover tilt and reduced-motion fallback passed');
  await page.setViewportSize({ width: 390, height: 844 });
  await page.evaluate(async () => { document.querySelectorAll('img').forEach(i => i.loading = 'eager'); await Promise.all(Array.from(document.images).map(i => i.decode().catch(() => {}))); });
  await page.waitForTimeout(250);
  await page.screenshot({
    path: ".impeccable/review/mobile.png",
    fullPage: false,
  });
  assert.equal(
    await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth,
    ),
    false,
  );
  await page.goto("/u/mager");
  await page.evaluate(async () => { document.querySelectorAll('img').forEach(i => i.loading = 'eager'); await Promise.all(Array.from(document.images).map(i => i.decode().catch(() => {}))); });
  await page.waitForTimeout(250);
  await page.screenshot({
    path: ".impeccable/review/profile-mobile.png",
    fullPage: true,
  });
  await page.goto("/create");
  await page.getByLabel("Find a track").fill("Radiohead");
  await page
    .locator(".search-results button")
    .first()
    .waitFor({ timeout: 20000 });
  await page.locator(".search-results button").first().click();
  await page.evaluate(async () => { document.querySelectorAll('img').forEach(i => i.loading = 'eager'); await Promise.all(Array.from(document.images).map(i => i.decode().catch(() => {}))); });
  await page.waitForTimeout(250);
  await page.screenshot({
    path: ".impeccable/review/compose-mobile.png",
    fullPage: true,
  });
  checks.push(
    "desktop/mobile feed, profile, and composer rendered without horizontal overflow",
  );
  const signout = await context.request.post("/api/auth/sign-out", {
    headers: { Origin: base },
    data: {},
  });
  assert.equal(signout.status(), 200);
  assert.equal((await context.request.get("/api/feed")).status(), 401);
  checks.push("sign-out removes access");
  console.log(JSON.stringify({ passed: checks }, null, 2));
} finally {
  if (userID) {
    await db.post.deleteMany({ where: { authorId: userID } });
    await db.user.deleteMany({ where: { id: userID } });
  } else await db.user.deleteMany({ where: { email } });
  if (inviteID) await db.invite.deleteMany({ where: { id: inviteID } });
  await browser?.close();
  await db.$disconnect();
  console.log("Temporary launch account, invitation, and posts removed.");
}
