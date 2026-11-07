import assert from "node:assert/strict";
import { randomBytes, createHash } from "node:crypto";
import { PrismaClient } from "@prisma/client";
import { chromium } from "@playwright/test";

const base = process.env.TEST_BASE_URL || "http://localhost:3000";
const db = new PrismaClient();
const suffix = Date.now().toString(36);
const email = `profile-${suffix}@example.invalid`;
const username = `profile_${suffix}`;
const token = randomBytes(32).toString("base64url");
let browser, inviteID, userID;
try {
  inviteID = (await db.invite.create({ data: {
    email, tokenHash: createHash("sha256").update(token).digest("hex"),
    createdBy: "4", expiresAt: new Date(Date.now() + 3600000),
  } })).id;
  browser = await chromium.launch({ channel: "chrome", headless: true });
  const context = await browser.newContext({ baseURL: base, viewport: { width: 1440, height: 1050 } });
  const signup = await context.request.post("/api/auth/sign-up/email", {
    headers: { Origin: base, "x-invite-token": token },
    data: { email, username, name: "Profile check", password: randomBytes(24).toString("hex") },
  });
  assert.equal(signup.status(), 200, await signup.text());
  userID = (await db.user.findUniqueOrThrow({ where: { email } })).id;
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", e => errors.push(e.message));
  await page.goto(`/u/${username}`);
  await page.getByRole("heading", { name: "A room waiting for its first track." }).waitFor();
  const tracks = await db.track.findMany({ take: 9, orderBy: { id: "desc" } });
  assert.equal(tracks.length, 9);
  await db.post.createMany({ data: [...tracks, tracks[0]].map((track, i) => ({
    authorId: userID, trackId: track.id, content: `Profile layout check ${i}`,
    createdAt: new Date(Date.now() - i * 60000),
  })) });
  await page.reload();
  await page.locator(".profile-record-grid").waitFor();
  assert.equal(await page.locator(".profile-record").count(), 10);
  const gridOrder = await page.locator(".profile-record").evaluateAll(items => items.map(item => item.getAttribute("href")));
  assert.equal(gridOrder[0], gridOrder[9], "repeat listens remain separate");
  for (const [width, columns] of [[1440, 8], [1024, 6], [768, 4], [390, 3], [320, 2]]) {
    await page.setViewportSize({ width, height: 1050 });
    assert.equal(await page.locator(".profile-record-grid").evaluate(el => getComputedStyle(el).gridTemplateColumns.split(" ").length), columns);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
  }
  await page.setViewportSize({ width: 1440, height: 1050 });
  await page.getByRole("button", { name: "Feed", exact: true }).focus();
  await page.keyboard.press("Enter");
  await page.locator(".post-list").waitFor();
  assert.equal(await page.getByRole("button", { name: "Feed", exact: true }).getAttribute("aria-pressed"), "true");
  assert.equal(await page.locator(".post-list").evaluate(el => getComputedStyle(el).gridTemplateColumns.split(" ").length), 1);
  assert.equal(await page.locator(".post-list .music-post").count(), 10);
  assert.deepEqual(await page.locator(".post-list .artwork-link").evaluateAll(items => items.map(item => item.getAttribute("href"))), gridOrder);
  await page.getByText("Profile layout check 0", { exact: true }).waitFor();
  await page.reload();
  await page.locator(".post-list").waitFor();
  await page.screenshot({ path: ".impeccable/review/profile-feed-desktop.png" });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(250);
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
  await page.screenshot({ path: ".impeccable/review/profile-feed-mobile.png" });
  await page.setViewportSize({ width: 320, height: 844 });
  const firstTitle = page.locator(".post-list .post-track h2 a").first();
  const originalTitle = await firstTitle.textContent();
  await firstTitle.evaluate(el => { el.textContent = "Supercalifragilisticexpialidocious"; });
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, "long list-view title wraps");
  await firstTitle.evaluate((el, title) => { el.textContent = title; }, originalTitle);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole("button", { name: "Grid", exact: true }).click();
  await page.goto("/u/mager");
  await page.locator(".profile-record-grid").waitFor();
  await page.evaluate(async () => {
    await document.fonts.ready;
    await Promise.race([Promise.all(Array.from(document.images).map(i => i.decode().catch(() => {}))), new Promise(r => setTimeout(r, 3000))]);
  });
  await page.screenshot({ path: ".impeccable/review/profile-grid-mobile.png" });
  await page.setViewportSize({ width: 1440, height: 1050 });
  await page.waitForTimeout(250);
  await page.screenshot({ path: ".impeccable/review/profile-grid-desktop.png" });
  const destination = await page.locator(".profile-record").first().getAttribute("href");
  await page.locator(".profile-record").first().click();
  await page.waitForURL(`**${destination}`);
  await page.locator(".track-hero h1").waitFor();
  assert.deepEqual(errors, []);
  console.log(JSON.stringify({ passed: true, checks: ["empty profile", "responsive 8/6/4/3/2 columns", "repeat listens and order", "keyboard view switch", "one-column feed and notes", "saved view", "profile navigation", "cover opens track", "no overflow or browser errors"] }, null, 2));
} finally {
  if (userID) {
    await db.post.deleteMany({ where: { authorId: userID } });
    await db.user.deleteMany({ where: { id: userID } });
  } else await db.user.deleteMany({ where: { email } });
  if (inviteID) await db.invite.deleteMany({ where: { id: inviteID } });
  await browser?.close();
  await db.$disconnect();
  console.log("Temporary profile account, posts, and invite removed.");
}
