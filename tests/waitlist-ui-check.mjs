import assert from "node:assert/strict";
import { randomBytes, createHash } from "node:crypto";
import { PrismaClient } from "@prisma/client";
import { chromium } from "@playwright/test";

const base = process.env.TEST_BASE_URL || "http://localhost:3000";
const db = new PrismaClient();
const suffix = Date.now().toString(36);
const email = `waitlist-ui-${suffix}@example.invalid`;
const token = randomBytes(32).toString("base64url");
let browser, invite, oauthState;
try {
  browser = await chromium.launch({ channel: "chrome", headless: true });
  const context = await browser.newContext({ baseURL: base, viewport: { width: 1440, height: 1050 } });
  const page = await context.newPage();
  await page.goto("/auth/signin");
  await page.getByRole("button", { name: "Continue with Spotify" }).waitFor();
  assert.equal(await page.getByRole("button", { name: "Continue with Spotify" }).locator("svg").count(), 1);
  await page.getByText("Members sign in. New listeners join the waitlist.").waitFor();
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 1050 });
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(250);
    await page.screenshot({ path: `.impeccable/review/waitlist-entry-${width}.png`, fullPage: true });
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
  }
  const oauth = await context.request.post("/api/auth/sign-in/social", {
    headers: { Origin: base }, data: { provider: "spotify", callbackURL: "/", errorCallbackURL: "/auth/signin" },
  });
  assert.equal(oauth.status(), 200);
  const providerURL = new URL((await oauth.json()).url);
  oauthState = providerURL.searchParams.get("state");
  assert.equal(providerURL.hostname, "accounts.spotify.com");
  assert.equal(new URL(providerURL.searchParams.get("redirect_uri")).pathname, "/api/auth/callback/spotify");
  await page.goto("/auth/signin?error=WAITLIST_JOINED");
  await page.getByRole("heading", { name: "You’re on the waitlist." }).waitFor();
  await page.screenshot({ path: ".impeccable/review/waitlist-confirmation-mobile.png", fullPage: true });
  for (const path of ["/api/feed", "/api/waitlist"]) assert.equal((await context.request.get(path)).status(), 401);
  await page.getByRole("link", { name: "Back to sign in" }).click();
  await page.getByRole("button", { name: "Continue with Spotify" }).waitFor();

  invite = await db.invite.create({ data: { email, tokenHash: createHash("sha256").update(token).digest("hex"), createdBy: "4", expiresAt: new Date(Date.now() + 3600000) } });
  const signup = await context.request.post("/api/auth/sign-up/email", {
    headers: { Origin: base, "x-invite-token": token },
    data: { email, password: randomBytes(24).toString("base64url"), name: "Waitlist UI check", username: `wl_${suffix}` },
  });
  assert.equal(signup.status(), 200, await signup.text());
  assert.equal((await context.request.get("/api/waitlist")).status(), 403);

  // UI fixtures only. Actual owner authorization, SQL pagination, and writes
  // are checked independently in waitlist-owner-check.mjs.
  await page.route("**/api/user", route => route.fulfill({ json: { id: "4", name: "Owner UI fixture", username: "mager", email } }));
  let mode = "normal", invited = false;
  const recipient = "long-listener-address-for-layout@example.invalid";
  await page.route("**/api/waitlist*", route => {
    if (mode === "error") return route.fulfill({ status: 503, json: { error: "Unavailable" } });
    if (mode === "empty") return route.fulfill({ json: { entries: [], nextCursor: null } });
    const more = new URL(route.request().url()).searchParams.has("cursor");
    return route.fulfill({ json: { entries: more ? [{ id: "second", name: "Second listener", email: "second@example.invalid", invitedAt: null }] : [{ id: "first", name: "A new listener", email: recipient, invitedAt: invited ? new Date().toISOString() : null }], nextCursor: more ? null : "first" } });
  });
  await page.route("**/api/invites", route => {
    assert.equal(route.request().postDataJSON().email, recipient);
    invited = true;
    return route.fulfill({ status: 201, json: { url: `${base}/auth/signin?invite=ui-fixture` } });
  });
  await page.goto("/settings");
  await page.getByText(recipient, { exact: true }).waitFor();
  await page.getByRole("button", { name: "Load more" }).click();
  await page.getByText("second@example.invalid", { exact: true }).waitFor();
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 1050 });
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(250);
    await page.screenshot({ path: `.impeccable/review/waitlist-owner-${width}.png`, fullPage: true });
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
  }
  await page.locator(".waitlist-entries li").first().getByRole("button", { name: "Create invite" }).click();
  await page.getByText("Invite created", { exact: true }).waitFor();
  assert.equal(await page.getByLabel("Their email").inputValue(), recipient);
  assert.match(await page.getByLabel("Invite link").inputValue(), /ui-fixture/);
  mode = "error";
  await page.reload();
  await page.getByText("The waitlist could not be loaded. Try again.").waitFor();
  mode = "empty";
  await page.getByRole("button", { name: "Try again" }).click();
  await page.getByText("No one is waiting yet.").waitFor();
  console.log("Waitlist entry, OAuth start, confirmation, access, owner UI, pagination, invite controls, retry, and mobile layout passed.");
} finally {
  await db.user.deleteMany({ where: { email } });
  if (invite) await db.invite.deleteMany({ where: { id: invite.id } });
  if (oauthState) await db.verification.deleteMany({ where: { identifier: oauthState } });
  await browser?.close();
  await db.$disconnect();
  console.log("Temporary waitlist UI account and invite removed.");
}
