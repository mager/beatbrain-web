import assert from "node:assert/strict";
import { randomBytes, createHash } from "node:crypto";
import { mkdir } from "node:fs/promises";
import { createRequire } from "node:module";
import { chromium } from "@playwright/test";
import { PrismaClient } from "@prisma/client";
const require = createRequire(import.meta.url);
require("@next/env").loadEnvConfig(process.cwd());
const base = process.env.TEST_BASE_URL || "http://localhost:3011";
const output = process.env.TEST_SCREENSHOT_DIR || ".impeccable/review";
const db = new PrismaClient();
const suffix = Date.now().toString(36), email = `design-${suffix}@example.invalid`;
const token = randomBytes(32).toString("base64url");
const password = randomBytes(24).toString("hex"), username = `design_${suffix}`;
let browser, inviteID, userID;
try {
  await mkdir(output, { recursive: true });
  browser = await chromium.launch({ channel: "chrome", headless: true });
  const context = await browser.newContext({ baseURL: base, viewport: { width: 1440, height: 1000 }, colorScheme: "light" });
  const page = await context.newPage();
  page.setDefaultTimeout(30000);
  const errors = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.goto("/auth/signin");
  await page.waitForFunction(() => document.documentElement.dataset.theme === "light");
  await page.getByRole("button", { name: "Turn the light off" }).waitFor();
  await page.emulateMedia({ colorScheme: "dark" });
  await page.getByRole("button", { name: "Turn the light on" }).waitFor();
  await page.emulateMedia({ colorScheme: "light" });
  await page.getByRole("button", { name: "Turn the light off" }).waitFor();
  await page.screenshot({ path: `${output}/signin-light.png`, fullPage: true, animations: "disabled" });
  const denied = await context.request.get("/api/feed");
  assert.equal(denied.status(), 401);
  const invite = await db.invite.create({ data: { email, tokenHash: createHash("sha256").update(token).digest("hex"), createdBy: "4", expiresAt: new Date(Date.now() + 3600000) } });
  inviteID = invite.id;
  const signup = await context.request.post("/api/auth/sign-up/email", { headers: { Origin: base, "x-invite-token": token }, data: { email, password, username, name: "Song design check" } });
  assert.equal(signup.status(), 200, "test account sign-up succeeds");
  userID = (await db.user.findUniqueOrThrow({ where: { email } })).id;
  await page.goto("/ext/spotify/36idurZmYRjJ56KQ8JD9bN");
  await page.getByRole("heading", { name: "Boston", exact: true, level: 1 }).waitFor();
  await page.getByRole("heading", { name: "Instruments & voices" }).waitFor();
  await page.locator(".track-instruments").getByText(/^pedal steel guitar$/i).waitFor();
  assert.equal(await page.locator('.credit-person h3 a[href="/creator/f1e12695-1a1a-4bed-b555-df3a4b55d336"]').count(), 1);
  await page.locator(".site-footer").getByText("with help from magerbot", { exact: false }).waitFor();
  assert.equal(await page.getByRole("link", { name: "Beatbrain on GitHub" }).locator("svg").count(), 1);
  assert.equal(await page.getByRole("link", { name: "Beatbrain on X" }).locator("svg").count(), 1);
  for (const theme of ["light", "dark"]) {
    if (theme === "dark") await page.getByRole("button", { name: "Turn the light off" }).click();
    await page.waitForFunction(value => document.documentElement.dataset.theme === value, theme);
    await page.waitForFunction(value => {
      const button = document.querySelector(".track-actions .button-secondary");
      return button && getComputedStyle(button).backgroundColor === (value === "light" ? "rgb(255, 255, 255)" : "rgb(25, 27, 31)");
    }, theme);
    for (const width of [1440, 390, 320]) {
      await page.setViewportSize({ width, height: width > 760 ? 1000 : 844 });
      await page.evaluate(async () => { await document.fonts.ready; await Promise.all(Array.from(document.images).map(i => i.decode().catch(() => {}))); });
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, `${theme} at ${width} does not overflow`);
      if (width === 390) {
        await page.screenshot({ path: `${output}/song-${theme}-${width}.png`, fullPage: true, animations: "disabled" });
        const instruments = await page.locator(".track-instruments").boundingBox();
        const hero = await page.locator(".song-hero").boundingBox();
        assert.ok(instruments.y - hero.y < 220, "instruments immediately follow the mobile song header");
      }
      await page.screenshot({ path: `${output}/song-${theme}-${width}.png`, fullPage: true, animations: "disabled" });
    }
  }
  await page.reload();
  await page.getByRole("button", { name: "Turn the light on" }).waitFor();
  await page.emulateMedia({ colorScheme: "light" });
  assert.equal(await page.evaluate(() => document.documentElement.dataset.theme), "dark", "saved choice overrides the system");
  await page.getByRole("button", { name: "Turn the light on" }).focus();
  await page.keyboard.press("Enter");
  await page.getByRole("button", { name: "Turn the light off" }).waitFor();
  await page.getByRole("link", { name: "Post this track", exact: true }).click();
  await page.waitForURL("**/create?track=*");
  await page.locator(".selected-track").waitFor();
  await page.screenshot({ path: `${output}/compose-light.png`, fullPage: true, animations: "disabled" });
  for (const path of ["/feed", `/u/${username}`, "/humans"]) {
    const response = await page.goto(path);
    assert.equal(response.status(), 200, `${path} available`);
    await page.getByRole("heading", { level: 1 }).waitFor();
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
  }
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.screenshot({ path: `${output}/humans-light.png`, fullPage: true, animations: "disabled" });
  // Separate sign-in proves the credential flow without printing credentials.
  await context.request.post("/api/auth/sign-out", { headers: { Origin: base } });
  const signin = await context.request.post("/api/auth/sign-in/email", { headers: { Origin: base }, data: { email, password } });
  assert.equal(signin.status(), 200, "email sign-in succeeds");
  assert.deepEqual(errors, [], "no browser errors");
  console.log(JSON.stringify({ passed: true, base, checks: ["member access", "sign-in", "instruments near title", "person credits", "system theme changes", "saved theme", "keyboard toggle", "footer icons and copy", "desktop/mobile", "posting form", "feed/profile/humans"] }));
} finally {
  if (userID) await db.user.deleteMany({ where: { id: userID } });
  else await db.user.deleteMany({ where: { email } });
  if (inviteID) await db.invite.deleteMany({ where: { id: inviteID } });
  await browser?.close();
  await db.$disconnect();
}
