import assert from "node:assert/strict";
import { randomBytes, createHash } from "node:crypto";
import { PrismaClient } from "@prisma/client";
import { chromium } from "@playwright/test";

const base = process.env.TEST_BASE_URL || "http://localhost:3000";
const db = new PrismaClient();
const suffix = Date.now().toString(36);
const email = `compose-${suffix}@example.invalid`;
const token = randomBytes(32).toString("base64url");
const trackID = "42UBPzRMh5yyz0EDPr6fr1";
let browser, invite, userID;
try {
  invite = await db.invite.create({ data: { email, tokenHash: createHash("sha256").update(token).digest("hex"), createdBy: "4", expiresAt: new Date(Date.now() + 3600000) } });
  browser = await chromium.launch({ channel: "chrome", headless: true });
  const context = await browser.newContext({ baseURL: base, viewport: { width: 1440, height: 1050 } });
  const signup = await context.request.post("/api/auth/sign-up/email", {
    headers: { Origin: base, "x-invite-token": token },
    data: { email, name: "Composer check", username: `compose_${suffix}`, password: randomBytes(24).toString("hex") },
  });
  assert.equal(signup.status(), 200, await signup.text());
  userID = (await db.user.findUniqueOrThrow({ where: { email } })).id;
  const page = await context.newPage();
  // Posting must reach the author's feed even when optional header profile
  // data fails to load. The server already knows the authenticated author.
  await page.route("**/api/user", route => route.fulfill({ status: 503, json: { error: "Profile temporarily unavailable" } }));
  page.setDefaultTimeout(20000);
  const errors = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.goto(`/create?track=${trackID}`);
  await page.getByRole("heading", { name: "Manchild", level: 2, exact: true }).waitFor();
  assert.equal(await page.locator("h1").count(), 1);
  await page.waitForFunction(() => {
    const color = document.querySelector(".app-shell").dataset.albumTheme;
    return color && color !== "#d8d5cf";
  });
  const cover = await page.locator(".selected-track .track-cover").getAttribute("src");
  await page.getByLabel("Your note", { exact: false }).fill("This one belongs in the room.");
  for (const width of [1440, 1024, 768, 390, 320]) {
    await page.setViewportSize({ width, height: 1050 });
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(250);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, `Composer overflow at ${width}`);
    if (width === 1440 || width === 390) await page.screenshot({ path: `.impeccable/review/composer-${width}.png`, fullPage: true });
  }
  await page.getByRole("button", { name: "Change track", exact: true }).focus();
  await page.keyboard.press("Enter");
  await page.waitForFunction(() => document.activeElement?.id === "track-search");
  assert.equal(await page.locator(".app-shell").getAttribute("data-album-theme"), null);
  assert.equal(await page.getByRole("button", { name: "Post to my feed", exact: true }).count(), 0);
  await page.route("**/api/search", route => route.fulfill({ json: { results: [{ id: trackID, name: "Manchild", artist: "Sabrina Carpenter", thumb: cover }] } }));
  await page.getByLabel("Find a track").fill("Manchild");
  await page.locator(".search-results button").first().click();
  assert.equal(await page.getByLabel("Your note", { exact: false }).inputValue(), "This one belongs in the room.");
  await page.route("**/api/post", route => route.fulfill({ status: 503, json: { error: "Your track could not be posted. Try again." } }));
  await page.getByRole("button", { name: "Post to my feed", exact: true }).click();
  await page.getByRole("alert").filter({ hasText: "Your track could not be posted." }).waitFor();
  assert.equal(await page.getByLabel("Your note", { exact: false }).inputValue(), "This one belongs in the room.");
  await page.unroute("**/api/post");
  await page.getByRole("button", { name: "Post to my feed", exact: true }).click();
  await page.waitForURL(`${base}/u/compose_${suffix}`);
  assert.equal(await page.locator(".app-shell").getAttribute("data-album-theme"), null);
  assert.equal(await db.post.count({ where: { authorId: userID } }), 1);
  await page.goto(`/create?track=${trackID}`);
  await page.route("https://i.scdn.co/image/**", route => route.abort());
  await page.reload();
  await page.locator(".selected-track .missing-art.track-cover").waitFor();
  assert.equal(await page.locator(".app-shell").getAttribute("data-album-theme"), "#d8d5cf");
  await page.getByRole("button", { name: "Post to my feed", exact: true }).waitFor();
  assert.deepEqual(errors, []);
  console.log("Composer: album colors, responsive layout, heading levels, keyboard change, draft retention, failed-post recovery, real posting, theme reset, and missing cover passed.");
} finally {
  if (userID) await db.post.deleteMany({ where: { authorId: userID } });
  await db.user.deleteMany({ where: { email } });
  if (invite) await db.invite.deleteMany({ where: { id: invite.id } });
  await browser?.close();
  await db.$disconnect();
  console.log("Temporary composer account, invite, and posts removed.");
}
