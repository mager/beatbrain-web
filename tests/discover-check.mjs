import assert from "node:assert/strict";
import { randomBytes, createHash } from "node:crypto";
import { PrismaClient } from "@prisma/client";
import { chromium } from "@playwright/test";
const base = process.env.TEST_BASE_URL || "http://localhost:3000";
const db = new PrismaClient();
const suffix = Date.now().toString(36),
  email = `discover-${suffix}@example.invalid`,
  token = randomBytes(32).toString("base64url");
let browser, inviteID, userID;
try {
  const invite = await db.invite.create({
    data: {
      email,
      tokenHash: createHash("sha256").update(token).digest("hex"),
      createdBy: "4",
      expiresAt: new Date(Date.now() + 3600000),
    },
  });
  inviteID = invite.id;
  browser = await chromium.launch({ channel: "chrome", headless: true });
  const context = await browser.newContext({
    baseURL: base,
    viewport: { width: 1440, height: 1000 },
  });
  const signup = await context.request.post("/api/auth/sign-up/email", {
    headers: { Origin: base, "x-invite-token": token },
    data: {
      email,
      password: randomBytes(20).toString("hex"),
      username: `discover_${suffix}`,
      name: "Discovery check",
    },
  });
  assert.equal(signup.status(), 200, await signup.text());
  userID = (await db.user.findUniqueOrThrow({ where: { email } })).id;
  const page = await context.newPage();
  page.setDefaultTimeout(10000);
  await page.goto("/");
  await page
    .getByRole("navigation", { name: "Main navigation" })
    .getByRole("link", { name: "Discover", exact: true })
    .click();
  await page.locator(".discover-grid .album-art").first().waitFor();
  const count = await page.locator(".discover-grid article").count();
  assert.ok(count > 0);
  assert.equal(
    await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth,
    ),
    false,
  );
  await page.evaluate(async () => {
    await document.fonts.ready;
    await Promise.all(
      Array.from(document.querySelectorAll(".discover-grid .album-art"))
        .filter((i) => i.getBoundingClientRect().top < innerHeight)
        .map((i) => {
          i.loading = "eager";
          return Promise.race([
            i.decode().catch(() => {}),
            new Promise((r) => setTimeout(r, 6000)),
          ]);
        }),
    );
  });
  await page.screenshot({ path: ".impeccable/review/discover-desktop.png" });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(250);
  assert.equal(
    await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth,
    ),
    false,
  );
  await page.screenshot({ path: ".impeccable/review/discover-mobile.png" });
  console.log("Discovery grid renders on desktop and mobile.");
  await page.goto("/about");
  await page.getByRole("heading", { name: "Music charms the soul." }).waitFor();
  await page.screenshot({
    path: ".impeccable/review/about-mobile.png",
    fullPage: true,
  });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.waitForTimeout(250);
  await page.screenshot({ path: ".impeccable/review/about-desktop.png" });
  await page.goto("/");
  await page.locator(".discover-grid .album-art").first().waitFor();
  const firstTitle = await page
    .locator(".discovery-track h2")
    .first()
    .innerText();
  console.log("Checking track detail and posting.");
  await page.locator(".discover-grid .artwork-link").first().click();
  await page.waitForURL("**/ext/spotify/**");
  await page
    .getByRole("heading", { name: firstTitle, exact: true, level: 1 })
    .waitFor();
  await page.evaluate(async () => {
    await document.fonts.ready;
    await Promise.all(
      Array.from(document.images).map((i) => {
        i.loading = "eager";
        return Promise.race([
          i.decode().catch(() => {}),
          new Promise((r) => setTimeout(r, 6000)),
        ]);
      }),
    );
  });
  await page.screenshot({ path: ".impeccable/review/track-desktop.png" });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(250);
  assert.equal(
    await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth,
    ),
    false,
  );
  await page.screenshot({
    path: ".impeccable/review/track-mobile.png",
    fullPage: true,
  });
  assert.equal(await page.locator(".site-header").count(), 1);
  await page
    .locator(".track-hero h1")
    .evaluate((e) => (e.textContent = "Supercalifragilisticexpialidocious"));
  assert.equal(
    await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth,
    ),
    false,
    "long track names must wrap",
  );
  await page
    .locator(".track-hero h1")
    .evaluate((e, title) => (e.textContent = title), firstTitle);
  await page
    .getByRole("link", { name: "Post this track", exact: true })
    .click();
  await page.waitForURL("**/create?track=*");
  await page.getByRole("heading", { name: firstTitle, exact: true }).waitFor();
  await page
    .getByLabel("Your note", { exact: false })
    .fill("A discovery worth sharing.");
  await page
    .getByRole("button", { name: "Post to my feed", exact: true })
    .click();
  await page.waitForURL("**/u/**");
  await page.locator(".profile-record").first().waitFor();
  await page.getByRole("button", { name: "Feed", exact: true }).click();
  await page.getByText("A discovery worth sharing.", { exact: true }).waitFor();
  await page.goto("/");
  let requests = 0;
  await page.route("**/api/discover", (route) => {
    requests++;
    return route.fulfill({
      status: 502,
      contentType: "application/json",
      body: JSON.stringify({
        error: "Discovery is unavailable. Please try again.",
      }),
    });
  });
  await page.reload();
  await page.locator(".empty-state[role=alert]").waitFor();
  assert.equal(requests, 1, "failure must not cause a request loop");
  await page.unroute("**/api/discover");
  await page.getByRole("button", { name: "Try again", exact: true }).click();
  await page.locator(".discover-grid .album-art").first().waitFor();
  await page.route("**/api/discover", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ tracks: [], updated: "" }),
    }),
  );
  await page.reload();
  await page.getByRole("heading", { name: "No discoveries yet." }).waitFor();
  await page.goto("/auth/signin");
  assert.equal(
    await page.getByText("Even the browsing.", { exact: false }).count(),
    0,
  );
  console.log(
    JSON.stringify(
      {
        passed: true,
        tracks: count,
        checks: [
          "navigation",
          "live data",
          "desktop/mobile",
          "error without request loop",
          "retry",
          "empty state",
          "entry copy",
          "About",
          "track details",
          "Discover to profile posting",
        ],
      },
      null,
      2,
    ),
  );
} finally {
  if (userID) {
    await db.post.deleteMany({ where: { authorId: userID } });
    await db.user.deleteMany({ where: { id: userID } });
  } else await db.user.deleteMany({ where: { email } });
  if (inviteID) await db.invite.deleteMany({ where: { id: inviteID } });
  await browser?.close();
  await db.$disconnect();
  console.log("Temporary discovery test account and invite removed.");
}
