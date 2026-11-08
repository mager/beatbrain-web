import assert from "node:assert/strict";
import { randomBytes, createHash } from "node:crypto";
import { PrismaClient } from "@prisma/client";
import { chromium } from "@playwright/test";
const base = process.env.TEST_BASE_URL || "http://localhost:3000";
const db = new PrismaClient();
const suffix = Date.now().toString(36),
  email = `song-${suffix}@example.invalid`,
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
    viewport: { width: 1440, height: 1050 },
  });
  const signup = await context.request.post("/api/auth/sign-up/email", {
    headers: { Origin: base, "x-invite-token": token },
    data: {
      email,
      password: randomBytes(20).toString("hex"),
      username: `song_${suffix}`,
      name: "Song detail check",
    },
  });
  assert.equal(signup.status(), 200, await signup.text());
  userID = (await db.user.findUniqueOrThrow({ where: { email } })).id;
  const page = await context.newPage();
  page.setDefaultTimeout(20000);
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  // Spotify's guest suffix differs from the MusicBrainz recording title.
  await page.goto("/ext/spotify/2OzhQlSqBEmt7hmkYxfT6m");
  await page.getByRole("heading", {
    name: "Fortnight (feat. Post Malone)", exact: true, level: 1,
  }).waitFor();
  assert.ok((await page.locator(".credit-row").count()) >= 8,
    "Fortnight guest-title mismatch must not hide credits");
  const fortnightCredits = await page.locator(".credit-row").allTextContents();
  for (const name of ["Jack Antonoff", "Taylor Swift", "Post Malone", "Serban Ghenea", "Bryce Bordone", "Jack Manning"]) {
    assert.ok(fortnightCredits.some((text) => text.includes(name)), `${name} credit visible`);
  }
  assert.equal(await page.getByText("Credits aren’t available for this recording yet.").count(), 0);
  assert.equal(await page.locator('a[href="https://musicbrainz.org/recording/a06d6b37-9cae-40a5-806d-1a3c4f8098c0"]').count(), 1);
  assert.ok((await page.locator(".release-list li").count()) > 0);
  await page.waitForFunction(() => document.querySelector(".app-shell").dataset.albumTheme);
  await page.evaluate(async () => { await document.fonts.ready; await document.querySelector(".track-cover").decode().catch(() => {}); });
  await page.screenshot({ path: ".impeccable/review/fortnight-desktop.png", fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(250);
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
  await page.screenshot({ path: ".impeccable/review/fortnight-mobile.png", fullPage: true });
  await page.setViewportSize({ width: 1440, height: 1050 });
  await page.goto("/ext/spotify/42UBPzRMh5yyz0EDPr6fr1");
  await page
    .getByRole("heading", { name: "Manchild", exact: true, level: 1 })
    .waitFor();
  await page.getByRole("heading", { name: "Credits", exact: true }).waitFor();
  assert.equal(await page.title(), "Manchild — Sabrina Carpenter — Beatbrain");
  assert.ok(
    (await page.locator(".credit-row").count()) >= 8,
    "real credits visible",
  );
  await page.waitForFunction(() => {
    const value = document.querySelector(".app-shell").dataset.albumTheme;
    return value && value !== "#d8d5cf";
  });
  const firstAccent = await page
    .locator(".app-shell")
    .getAttribute("data-album-theme");
  assert.notEqual(firstAccent, "#e4b6ff");
  await page.reload();
  await page.waitForFunction(
    (accent) =>
      document.querySelector(".app-shell").dataset.albumTheme === accent,
    firstAccent,
  );
  assert.equal(
    await page
      .locator(".track-sources")
      .getByRole("link", { name: "MusicBrainz", exact: false })
      .count(),
    1,
  );
  await page.evaluate(async () => {
    await document.fonts.ready;
    await document
      .querySelector(".track-cover")
      .decode()
      .catch(() => {});
  });
  assert.equal(
    await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth,
    ),
    false,
  );
  await page.screenshot({
    path: ".impeccable/review/song-details-desktop.png",
    fullPage: true,
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(250);
  assert.equal(
    await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth,
    ),
    false,
  );
  await page.screenshot({
    path: ".impeccable/review/song-details-mobile.png",
    fullPage: true,
  });
  assert.ok(
    (await page.locator(".release-list li").count()) > 0,
    "real releases visible",
  );
  await page
    .locator(".track-facts")
    .getByText("3:33", { exact: true })
    .waitFor();
  assert.equal(
    await page
      .locator(".track-facts")
      .getByText("Key", { exact: true })
      .count(),
    0,
    "unknown musical key omitted",
  );
  assert.ok(await page.locator(".track-album").innerText());
  await page.getByRole("button", { name: /Show all .* releases/ }).click();
  assert.ok((await page.locator(".release-list li").count()) > 4);
  await page.getByRole("link", { name: "Feed", exact: true }).click();
  await page.waitForURL("**/feed");
  await page.getByRole("heading", { name: "Feed", exact: true, level: 1 }).waitFor();
  await page.waitForFunction(
    () => !document.querySelector(".app-shell").hasAttribute("data-album-theme"),
  );
  assert.equal(
    await page.locator(".app-shell").getAttribute("data-album-theme"),
    null,
  );
  assert.equal(
    await page
      .locator(".app-shell")
      .evaluate((e) =>
        getComputedStyle(e).getPropertyValue("--room-accent").trim(),
      ),
    "#e4b6ff",
  );
  await page.goto("/ext/spotify/0VjIjW4GlUZAMYd2vXMi3b");
  await page
    .getByRole("heading", { name: "Blinding Lights", exact: true, level: 1 })
    .waitFor();
  await page.waitForFunction((old) => {
    const v = document.querySelector(".app-shell").dataset.albumTheme;
    return v && v !== old && v !== "#d8d5cf";
  }, firstAccent);
  const secondAccent = await page
    .locator(".app-shell")
    .getAttribute("data-album-theme");
  assert.notEqual(firstAccent, secondAccent);
  await page.setViewportSize({ width: 1440, height: 1050 });
  await page.waitForTimeout(250);
  await page.screenshot({
    path: ".impeccable/review/song-red-desktop.png",
    fullPage: true,
  });
  await page.route("https://i.scdn.co/image/**", (route) => route.abort());
  await page.reload();
  await page.locator(".missing-art.track-cover").waitFor();
  assert.equal(
    await page.locator(".app-shell").getAttribute("data-album-theme"),
    "#d8d5cf",
    "unavailable artwork keeps a readable neutral theme",
  );
  await page.getByRole("link", { name: "Post this track", exact: true }).waitFor();
  assert.deepEqual(errors, []);
  console.log(
    JSON.stringify(
      {
        passed: true,
        firstAccent,
        secondAccent,
        checks: [
          "real credits",
          "featured-artist title match and credits",
          "duration without audio features",
          "album",
          "releases",
          "source links",
          "cover-based accents",
          "theme resets on exit",
          "unavailable artwork fallback",
          "desktop/mobile",
          "no browser errors",
        ],
      },
      null,
      2,
    ),
  );
} finally {
  if (userID) await db.user.deleteMany({ where: { id: userID } });
  else await db.user.deleteMany({ where: { email } });
  if (inviteID) await db.invite.deleteMany({ where: { id: inviteID } });
  await browser?.close();
  await db.$disconnect();
  console.log("Temporary song-check account and invite removed.");
}
