import assert from "node:assert/strict";
import { createHash, randomBytes } from "node:crypto";
import { mkdir } from "node:fs/promises";
import { createRequire } from "node:module";
import { chromium } from "@playwright/test";
import { PrismaClient } from "@prisma/client";

const require = createRequire(import.meta.url);
require("@next/env").loadEnvConfig(process.cwd());
const base = process.env.TEST_BASE_URL || "http://localhost:3017";
const output = process.env.TEST_SCREENSHOT_DIR || ".impeccable/review/creator-error";
const db = new PrismaClient();
const suffix = Date.now().toString(36);
const email = `creator-error-${suffix}@example.invalid`;
const token = randomBytes(32).toString("base64url");
const mbid = "149f91ef-1287-46da-9a8e-87fee02f1471";
const otherID = "11111111-2222-3333-4444-555555555555";
const creator = { id: mbid, name: "Creator check", type: "Person", genres: [], links: [], credits: [], highlights: [] };
let browser, inviteID, userID;

try {
  await mkdir(output, { recursive: true });
  browser = await chromium.launch({ channel: "chrome", headless: true });
  const context = await browser.newContext({ baseURL: base, viewport: { width: 1440, height: 1000 } });
  assert.equal((await context.request.get(`/api/creator?mbid=${mbid}`)).status(), 401);
  const guestPage = await context.newPage();
  await guestPage.goto(`/creator/${mbid}`);
  assert.equal(new URL(guestPage.url()).pathname, "/auth/signin");
  await guestPage.close();

  const invite = await db.invite.create({ data: { email, tokenHash: createHash("sha256").update(token).digest("hex"), createdBy: "4", expiresAt: new Date(Date.now() + 3600000) } });
  inviteID = invite.id;
  const signup = await context.request.post("/api/auth/sign-up/email", {
    headers: { Origin: base, "x-invite-token": token },
    data: { email, password: randomBytes(24).toString("hex"), username: `creator_${suffix}`, name: "Creator error check" },
  });
  assert.equal(signup.status(), 200);
  userID = (await db.user.findUniqueOrThrow({ where: { email } })).id;

  const page = await context.newPage();
  const main = page.locator("#main-content");
  page.setDefaultTimeout(8000);
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  let mode = "failure", requests = 0;
  await page.route("**/api/creator?*", async (route) => {
    requests++;
    if (mode === "network") return route.abort("failed");
    if (mode === "timeout") return; // Remain pending until the page aborts its fetch.
    if (mode === "malformed") return route.fulfill({ status: 200, body: "not JSON", contentType: "application/json" });
    if (mode === "empty") return route.fulfill({ status: 200, json: {} });
    if (mode === "success") return route.fulfill({ json: creator });
    if (mode === "missing") return route.fulfill({ status: 404, json: { error: "Creator not found." } });
    if (mode === "session") return route.fulfill({ status: 401, json: { error: "Sign in." } });
    return route.fulfill({ status: 502, json: { error: "Creator unavailable." } });
  });

  await page.goto(`/creator/${mbid}`);
  await page.getByRole("heading", { name: "Creator details are unavailable." }).waitFor();
  assert.equal(requests, 1, "failed requests do not trigger a retry loop");
  assert.equal(await main.getByRole("status").count(), 0);
  for (const theme of ["light", "dark"]) {
    if ((await page.evaluate(() => document.documentElement.dataset.theme)) !== theme)
      await page.getByRole("button", { name: theme === "light" ? "Turn the light on" : "Turn the light off" }).click();
    for (const width of [1440, 390, 320]) {
      await page.setViewportSize({ width, height: width > 760 ? 1000 : 844 });
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
      await page.screenshot({ path: `${output}/error-${theme}-${width}.png` });
    }
  }
  mode = "success";
  await page.getByRole("button", { name: "Try again", exact: true }).focus();
  await page.keyboard.press("Enter");
  await page.getByRole("heading", { name: creator.name, exact: true }).waitFor();
  assert.equal(requests, 2);
  assert.equal(await main.getByRole("alert").count(), 0);

  for (const failure of ["malformed", "empty", "network"]) {
    mode = failure;
    await page.reload();
    await page.getByRole("heading", { name: "Creator details are unavailable." }).waitFor();
    assert.equal(await main.getByRole("status").count(), 0);
  }
  mode = "missing";
  await page.reload();
  await page.getByRole("heading", { name: "Creator not found." }).waitFor();
  assert.equal(await page.getByRole("button", { name: "Try again" }).count(), 0);
  mode = "session";
  await page.reload();
  await page.getByRole("heading", { name: "Sign in to view creator details." }).waitFor();
  assert.equal(await page.getByRole("link", { name: "Sign in", exact: true }).getAttribute("href"), `/auth/signin?callbackUrl=%2Fcreator%2F${mbid}`);

  // The page has its own deadline if the API never returns a response.
  await page.clock.install();
  mode = "timeout";
  const started = page.waitForRequest((request) => request.url().includes("/api/creator?"));
  await page.reload({ waitUntil: "domcontentloaded" });
  await started;
  await main.getByRole("status").waitFor();
  await page.clock.runFor(12001);
  await page.getByRole("heading", { name: "Creator details are unavailable." }).waitFor();
  await page.clock.resume();

  // A late response from the previous creator cannot replace the current page.
  await page.unroute("**/api/creator?*");
  let releaseOld;
  const oldReady = new Promise((resolve) => { releaseOld = resolve; });
  await page.route("**/api/creator?*", async (route) => {
    if (new URL(route.request().url()).searchParams.get("mbid") === mbid) {
      await oldReady;
      return route.fulfill({ json: { ...creator, name: "Old creator" } }).catch(() => {});
    }
    return route.fulfill({ json: { ...creator, id: otherID, name: "Current creator" } });
  });
  const oldStarted = page.waitForRequest((request) => request.url().includes(`/api/creator?mbid=${mbid}`));
  await page.reload({ waitUntil: "domcontentloaded" });
  await oldStarted;
  await page.evaluate((id) => window.next.router.push(`/creator/${id}`), otherID);
  await page.getByRole("heading", { name: "Current creator", exact: true }).waitFor();
  releaseOld();
  await page.waitForTimeout(200);
  assert.equal(await page.getByRole("heading", { name: "Old creator", exact: true }).count(), 0);
  assert.deepEqual(errors, []);
  console.log(JSON.stringify({ passed: true, checks: ["private page/API", "service error", "keyboard retry", "desktop/mobile", "malformed JSON", "empty data", "network failure", "not found", "expired session", "client deadline", "stale response"] }));
} finally {
  if (userID) {
    await db.post.deleteMany({ where: { authorId: userID } });
    await db.user.deleteMany({ where: { id: userID } });
  } else await db.user.deleteMany({ where: { email } });
  if (inviteID) await db.invite.deleteMany({ where: { id: inviteID } });
  await browser?.close();
  await db.$disconnect();
}
