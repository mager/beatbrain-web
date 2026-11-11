import assert from "node:assert/strict";
import { randomBytes, createHash } from "node:crypto";
import { PrismaClient } from "@prisma/client";
import { chromium } from "@playwright/test";

const base = process.env.TEST_BASE_URL || "http://localhost:3000";
const db = new PrismaClient();
const suffix = randomBytes(6).toString("hex");
const email = `humans-${suffix}@example.invalid`;
let browser, memberId, inviteId;
try {
  const token = randomBytes(32).toString("base64url");
  const invite = await db.invite.create({ data: { email, tokenHash: createHash("sha256").update(token).digest("hex"), createdBy: "4", expiresAt: new Date(Date.now() + 3600000) } });
  inviteId = invite.id;
  browser = await chromium.launch({ channel: "chrome", headless: true });
  const context = await browser.newContext({ baseURL: base, viewport: { width: 1440, height: 1000 } });
  const guest = await browser.newContext({ baseURL: base });
  assert.equal((await guest.request.get("/api/humans")).status(), 401);
  const guestPage = await guest.newPage();
  await guestPage.goto("/humans");
  assert.match(guestPage.url(), /auth\/signin/);
  await guest.close();
  const signup = await context.request.post("/api/auth/sign-up/email", { headers: { Origin: base, "x-invite-token": token }, data: { email, name: "Humans browser check", username: `humans_${suffix}`, password: randomBytes(24).toString("hex") } });
  assert.equal(signup.status(), 200, "Temporary test account must sign in");
  memberId = (await db.user.findUniqueOrThrow({ where: { email } })).id;
  // Hide this temporary test account from the real directory during capture.
  await db.user.update({ where: { id: memberId }, data: { username: null } });
  const api = await context.request.get("/api/humans");
  assert.equal(api.status(), 200);
  assert.match(api.headers()["cache-control"], /no-store/);
  const directory = await api.json();
  assert.ok(directory.members.length >= 3);
  assert.ok(directory.members.some(member => member.username === "mager"));
  assert.doesNotMatch(JSON.stringify(directory), /@example|token|email|spotifyId/);
  const page = await context.newPage();
  page.setDefaultTimeout(15000);
  const errors = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.goto("/humans");
  await page.getByRole("heading", { name: "Humans." }).waitFor();
  await page.evaluate(() => document.fonts.ready);
  await page.waitForFunction(() => Array.from(document.images).every(image => image.complete));
  const capture = async (width, label) => {
    await page.setViewportSize({ width, height: width < 600 ? 844 : 1000 });
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
    await page.waitForTimeout(350);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, `No overflow at ${width}`);
    if (label === "mobile" || label === "narrow") {
      const visibleArt = await page.evaluate(() => {
        const art = document.querySelector('[class*="sleeves"]')?.getBoundingClientRect();
        const footer = document.querySelector(".site-footer")?.getBoundingClientRect();
        return Math.min(art.bottom, footer.top) - art.top;
      });
      assert.ok(visibleArt >= 120, `At least 120px of music must appear above the footer at ${width}px; got ${visibleArt}`);
    }
    await page.screenshot({ path: `.impeccable/review/humans-${label}.png`, fullPage: true });
  };
  await capture(1440, "desktop");
  await capture(390, "mobile");
  await capture(320, "narrow");
  for (const width of [768, 1024, 1280, 1920]) { await page.setViewportSize({ width, height: 1000 }); assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, `No overflow at ${width}`); }
  await page.setViewportSize({ width: 1440, height: 1000 });
  const search = page.getByRole("searchbox", { name: "Search members by name, handle, or artist" });
  await search.fill("@MAGER");
  await page.getByRole("status").filter({ hasText: "1 human matching" }).waitFor();
  assert.equal(await page.getByRole("list", { name: "Members", exact: true }).locator("li").count(), 1);
  await page.getByRole("button", { name: "Clear member search" }).click();
  await page.getByRole("status").filter({ hasText: "humans in the room" }).waitFor();
  await page.getByRole("button", { name: "Following", exact: true }).click();
  await page.getByRole("heading", { name: "Your people are out there." }).waitFor();
  await page.screenshot({ path: ".impeccable/review/humans-empty.png", fullPage: true });
  await db.follow.create({ data: { followerId: memberId, followingId: directory.members.find(member => member.username === "mager").id } });
  await page.reload();
  await page.getByRole("button", { name: "Following", exact: true }).click();
  await page.getByRole("status").filter({ hasText: "1 human in the room" }).waitFor();
  await page.getByRole("button", { name: "Posted in 30 days" }).click();
  await page.getByRole("status").filter({ hasText: /\d+ human/ }).waitFor();
  await page.getByRole("button", { name: "Everyone", exact: true }).click();
  await page.getByRole("combobox", { name: "Sort by" }).selectOption("name");
  await page.getByRole("status").filter({ hasText: "humans in the room" }).waitFor();
  const names = await page.getByRole("list", { name: "Members", exact: true }).locator("h2").allTextContents();
  assert.equal(names[0], "Ashish Kumar");
  await search.fill("nobody_has_this_name");
  await page.getByRole("heading", { name: "No humans found." }).waitFor();
  await page.getByRole("button", { name: "Clear search and filters" }).click();
  await page.getByRole("status").filter({ hasText: "humans in the room" }).waitFor();
  await page.route("**/api/humans?**", route => route.fulfill({ status: 503, json: { error: "Unavailable" } }));
  await search.fill("mager");
  await page.getByRole("alert").filter({ hasText: "Members could not be loaded" }).waitFor();
  await page.screenshot({ path: ".impeccable/review/humans-error.png", fullPage: true });
  await page.unroute("**/api/humans?**");
  await page.getByRole("button", { name: "Try again" }).click();
  await page.getByRole("status").filter({ hasText: "1 human matching" }).waitFor();
  const postedArtist = directory.members.find(member => member.posts.length).posts[0].track.artist;
  await search.fill(postedArtist);
  await page.getByRole("status").filter({ hasText: `1 human matching “${postedArtist}”` }).waitFor();
  await page.getByRole("button", { name: "Clear member search" }).focus();
  await page.keyboard.press("Enter");
  await page.getByRole("status").filter({ hasText: "humans in the room" }).waitFor();
  assert.equal(await search.evaluate(input => document.activeElement === input), true);
  // A slow response must not replace a newer search.
  let releaseSlow;
  const slowGate = new Promise(resolve => { releaseSlow = resolve; });
  await page.route("**/api/humans?**", async route => {
    const term = new URL(route.request().url()).searchParams.get("q");
    if (term === "slow") await slowGate;
    await route.fulfill({ json: { members: [{ ...directory.members[0], name: term === "slow" ? "Slow result" : "Fast result" }], total: 1, hasMore: false } }).catch(() => {});
  });
  const slowStarted = page.waitForRequest(request => request.url().includes("q=slow"));
  await search.fill("slow");
  await slowStarted;
  await search.fill("fast");
  await page.getByRole("heading", { name: "Fast result" }).waitFor();
  releaseSlow();
  await page.waitForTimeout(300);
  assert.equal(await page.getByRole("heading", { name: "Slow result" }).count(), 0);
  await page.unroute("**/api/humans?**");
  await page.getByRole("button", { name: "Clear member search" }).click();
  await page.getByRole("status").filter({ hasText: "humans in the room" }).waitFor();
  // Exercise bounded page merging with synthetic API data, without database writes.
  let calls = [], pageFailed = false;
  await page.route("**/api/humans?**", route => {
    const params = new URL(route.request().url()).searchParams;
    calls.push(params.get("page"));
    if (params.get("page") === "1" && !pageFailed) { pageFailed = true; return route.fulfill({ status: 503, json: { error: "Unavailable" } }); }
    route.fulfill({ json: params.get("page") === "0" ? { ...directory, total: 4, hasMore: true } : { members: [{ ...directory.members[0], id: "synthetic", name: "Synthetic long member name for a narrow screen check", username: "synthetic_member", image: "/missing-image.png", posts: [{ id: -1, createdAt: "2026-11-10T00:00:00Z", track: { title: "A long track title for the image fallback", artist: "Synthetic artist", image: "/missing-cover.png" } }] }], total: 4, hasMore: false } });
  });
  await page.getByRole("combobox", { name: "Sort by" }).selectOption("posts");
  await page.getByRole("button", { name: "Meet more humans" }).click();
  await page.getByRole("alert").filter({ hasText: "Members could not be loaded" }).waitFor();
  assert.equal(await page.getByRole("list", { name: "Members", exact: true }).locator("li").count(), directory.members.length);
  await page.getByRole("button", { name: "Try again" }).click();
  await page.getByRole("heading", { name: "Synthetic long member name for a narrow screen check" }).waitFor();
  assert.deepEqual(calls, ["0", "1", "1"]);
  await capture(390, "edge-cases");
  assert.equal(await page.getByRole("list", { name: "Members", exact: true }).locator("li").count(), directory.members.length + 1);
  assert.deepEqual(errors, []);
  console.log("Humans passed: private page/API, real members, name/handle/artist search, following, recent filter, sort, empty/error/retry, keyboard, stale responses, pagination retry, missing images, and 320–1920px layouts.");
} finally {
  if (!memberId) memberId = (await db.user.findUnique({ where: { email }, select: { id: true } }))?.id;
  if (memberId) await db.user.delete({ where: { id: memberId } });
  if (inviteId) await db.invite.delete({ where: { id: inviteId } });
  await browser?.close();
  await db.$disconnect();
  console.log("Temporary test account, follows, session, and invite removed.");
}
