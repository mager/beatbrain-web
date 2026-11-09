import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
const releaseVersion = JSON.parse(readFileSync(new URL("../package.json", import.meta.url))).version;
import { randomBytes, createHash } from "node:crypto";
import { PrismaClient } from "@prisma/client";
import { chromium } from "@playwright/test";

const base = process.env.TEST_BASE_URL || "http://localhost:3000";
const db = new PrismaClient();
const suffix = Date.now().toString(36);
const members = [],
  inviteIDs = [],
  emails = [];
let browser, page;
try {
  browser = await chromium.launch({ channel: "chrome", headless: true });
  for (const role of ["me", "friend"]) {
    const email = `love-${role}-${suffix}@example.invalid`;
    emails.push(email);
    const username = `l_${role}_${suffix}`;
    const token = randomBytes(32).toString("base64url");
    const invite = await db.invite.create({
      data: {
        email,
        tokenHash: createHash("sha256").update(token).digest("hex"),
        createdBy: "4",
        expiresAt: new Date(Date.now() + 3600000),
      },
    });
    inviteIDs.push(invite.id);
    const context = await browser.newContext({
      baseURL: base,
      viewport: { width: 1440, height: 1000 },
    });
    const password = randomBytes(20).toString("hex");
    const response = await context.request.post("/api/auth/sign-up/email", {
      headers: { Origin: base, "x-invite-token": token },
      data: {
        email,
        username,
        name: `Music ${role}`,
        password,
      },
    });
    assert.equal(response.status(), 200, await response.text());
    const signedOut = await context.request.post("/api/auth/sign-out", {
      headers: { Origin: base },
      data: {},
    });
    assert.equal(signedOut.status(), 200);
    const signedIn = await context.request.post("/api/auth/sign-in/email", {
      headers: { Origin: base },
      data: { email, password },
    });
    assert.equal(signedIn.status(), 200, "email/password sign-in works");
    const user = await db.user.findUniqueOrThrow({ where: { email } });
    members.push({ ...user, context });
  }
  const [me, friend] = members;
  const track = await db.track.findFirstOrThrow({
    where: { source: "SPOTIFY" },
  });
  const posted = await friend.context.request.post("/api/post", {
    headers: { Origin: base },
    data: { track, content: "A track worth sharing." },
  });
  assert.equal(posted.status(), 201);
  const post = await posted.json();
  const path = `/api/reactions/${post.id}`;
  const write = (context, method = "post", origin = base, data = {}) =>
    context.request[method](path, { headers: { Origin: origin }, data });
  const first = await write(me.context);
  assert.equal(
    first.status(),
    200,
    "love endpoint must accept an authenticated reaction",
  );
  assert.deepEqual(await first.json(), { loved: true, loveCount: 1 });
  assert.deepEqual(
    await (await write(me.context, "post", base, { userId: friend.id })).json(),
    { loved: true, loveCount: 1 },
  );
  assert.equal(
    await db.postLove.count({ where: { postId: post.id, userId: friend.id } }),
    0,
  );
  assert.equal(
    (await write(me.context, "post", "https://example.invalid")).status(),
    403,
  );
  const guest = await browser.newContext({ baseURL: base });
  assert.equal((await write(guest)).status(), 401);
  assert.equal((await me.context.request.get(path)).status(), 405);
  for (const invalid of ["0", "-1", "1.5", "2147483648", "abc"]) {
    assert.equal(
      (
        await me.context.request.post(`/api/reactions/${invalid}`, {
          headers: { Origin: base },
        })
      ).status(),
      400,
    );
  }
  assert.equal(
    (
      await me.context.request.post("/api/reactions/2147483647", {
        headers: { Origin: base },
      })
    ).status(),
    404,
  );
  assert.deepEqual(await (await write(friend.context)).json(), {
    loved: true,
    loveCount: 2,
  });
  const read = async (context) =>
    (await (await context.request.get("/api/feed")).json()).find(
      (p) => p.id === post.id,
    );
  assert.equal((await read(me.context)).lovedByViewer, true);
  assert.equal((await read(me.context)).loveCount, 2);
  assert.equal("loves" in (await read(me.context)), false);
  await write(friend.context, "delete");
  assert.equal((await read(friend.context)).lovedByViewer, false);
  page = await me.context.newPage();
  page.setDefaultTimeout(15000);
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto(`/u/${friend.username}`);
  await page
    .getByText(
      `Member since ${new Date(friend.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric", timeZone: "UTC" })}`,
      { exact: true },
    )
    .waitFor();
  const love = () => page.locator(`[data-post-love="${post.id}"] button`);
  assert.equal(await love().getAttribute("aria-pressed"), "true");
  await love().click();
  await page.waitForFunction(
    (id) =>
      document
        .querySelector(`[data-post-love="${id}"] button`)
        ?.getAttribute("aria-pressed") === "false",
    post.id,
  );
  await page.getByRole("button", { name: "Feed", exact: true }).click();
  assert.equal(
    await love().getAttribute("aria-pressed"),
    "false",
    "view switch must retain confirmed state",
  );
  await love().focus();
  await page.keyboard.press("Enter");
  await page.waitForFunction(
    (id) =>
      document
        .querySelector(`[data-post-love="${id}"] button`)
        ?.getAttribute("aria-pressed") === "true",
    post.id,
  );
  await page.getByRole("button", { name: "Grid", exact: true }).click();
  assert.equal(await love().getAttribute("aria-pressed"), "true");
  await page.route(`**${path}`, (route) =>
    route.fulfill({
      status: 503,
      contentType: "application/json",
      body: JSON.stringify({ error: "Please try again." }),
    }),
  );
  await love().click();
  await page.getByRole("alert").waitFor();
  assert.equal(await love().getAttribute("aria-pressed"), "true");
  await page.unroute(`**${path}`);
  await page.reload();
  assert.equal(await love().getAttribute("aria-pressed"), "true");
  for (const width of [1440, 390, 320]) {
    await page.setViewportSize({ width, height: 844 });
    await page.waitForTimeout(250);
    assert.equal(
      await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth,
      ),
      false,
    );
    const footer = page.locator(".site-footer");
    const box = await footer.boundingBox();
    assert.ok(
      Math.abs(box.y + box.height - 844) < 2,
      "footer stays at viewport bottom",
    );
    await page.evaluate(() => scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(100);
    const control = await love().boundingBox();
    const bottom = await footer.boundingBox();
    assert.ok(
      control.y + control.height <= bottom.y,
      "footer must not cover last reaction",
    );
    assert.ok(control.height >= 44);
    await page.screenshot({
      path: `.impeccable/review/love-profile-${width}.png`,
      fullPage: true,
    });
  }
  await page.getByRole("button", { name: "Feed", exact: true }).click();
  for (const width of [320, 390]) {
    await page.setViewportSize({ width, height: 844 });
    await page.waitForTimeout(250);
    const note = await page.locator(".post-note").boundingBox();
    const heart = await love().boundingBox();
    assert.ok(
      heart.y >= note.y + note.height,
      "mobile feed heart must sit below the note",
    );
    await page.screenshot({
      path: `.impeccable/review/love-list-${width}.png`,
      fullPage: true,
    });
  }
  assert.equal(
    await page
      .getByRole("link", { name: "About Beatbrain", exact: true })
      .getAttribute("href"),
    "/about",
  );
  assert.match(
    await page.getByRole("link", { name: `v${releaseVersion}` }).getAttribute("href"),
    /github.com\/mager\/beatbrain-web\/blob\/.+\/CHANGELOG.md/,
  );
  await page
    .getByRole("link", { name: "About Beatbrain", exact: true })
    .click();
  await page.getByRole("heading", { name: /music charms the soul/i }).waitFor();
  await page.goto("/feed");
  assert.equal(await love().getAttribute("aria-pressed"), "true");
  await write(me.context, "delete");
  await write(me.context, "delete");
  assert.equal(await db.postLove.count({ where: { postId: post.id } }), 0);
  await write(me.context);
  await db.post.delete({ where: { id: post.id } });
  assert.equal(
    await db.postLove.count({ where: { postId: post.id } }),
    0,
    "post deletion cascades reactions",
  );
  assert.deepEqual(errors, []);
  console.log(
    "Love passed: auth, origin, identity, idempotence, counts, cascade, profile views, date, footer, keyboard, mobile, and error recovery.",
  );
} finally {
  const users = await db.user.findMany({
    where: { email: { in: emails } },
    select: { id: true },
  });
  await db.post.deleteMany({
    where: { authorId: { in: users.map((u) => u.id) } },
  });
  await db.user.deleteMany({ where: { email: { in: emails } } });
  await db.invite.deleteMany({ where: { id: { in: inviteIDs } } });
  await browser?.close();
  await db.$disconnect();
  console.log("Temporary love test data removed.");
}
