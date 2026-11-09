import assert from "node:assert/strict";
import { randomBytes, createHash } from "node:crypto";
import { PrismaClient } from "@prisma/client";
import { chromium } from "@playwright/test";
const base = process.env.TEST_BASE_URL || "http://localhost:3000";
const db = new PrismaClient();
const suffix = Date.now().toString(36),
  email = `credits-${suffix}@example.invalid`,
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
      username: `credits_${suffix}`,
      name: "Song detail check",
    },
  });
  assert.equal(signup.status(), 200, await signup.text());
  userID = (await db.user.findUniqueOrThrow({ where: { email } })).id;
  const page = await context.newPage();
  page.setDefaultTimeout(20000);
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/ext/spotify/7oL7jAZkNyolF1H15Fhlm1");
  await page
    .getByRole("heading", { name: "Not a Pretty Girl", exact: true, level: 1 })
    .waitFor();
  assert.ok(
    (await page.locator(".credit-row").count()) >= 6,
    "reviewed credits must be shown for Not a Pretty Girl",
  );
  const credits = await page.locator(".credit-row").allTextContents();
  for (const name of [
    "Belize Kazi",
    "Clairo",
    "leodaleo",
    "Julio Gómez",
    "Joe LaPorta",
  ])
    assert.ok(
      credits.some((text) => text.includes(name)),
      `${name} must be credited`,
    );
  assert.equal(
    await page
      .locator(
        '.track-sources a[href="https://www.youtube.com/watch?v=xQ6qgGwrFHg"]',
      )
      .count(),
    1,
  );
  assert.equal(
    await page.locator('.credits-list a[href="/creator/"]').count(),
    0,
  );
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.locator(".liner-credits").scrollIntoViewIfNeeded();
    await page.waitForTimeout(250);
    assert.equal(
      await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth,
      ),
      false,
    );
    await page.screenshot({
      path: `.impeccable/review/reviewed-credits-${width}.png`,
    });
  }
  await page.reload();
  assert.ok(
    (await page.locator(".credit-row").count()) >= 6,
    "cached requests retain reviewed credits",
  );
  assert.deepEqual(errors, []);
  console.log(
    "Reviewed credits passed: exact song, all verified people, source link, no invented creator links, cached reload, desktop and mobile.",
  );
} finally {
  if (userID) {
    await db.post.deleteMany({ where: { authorId: userID } });
    await db.user.deleteMany({ where: { id: userID } });
  } else await db.user.deleteMany({ where: { email } });
  if (inviteID) await db.invite.deleteMany({ where: { id: inviteID } });
  await browser?.close();
  await db.$disconnect();
  console.log("Temporary credits test account and invite removed.");
}
