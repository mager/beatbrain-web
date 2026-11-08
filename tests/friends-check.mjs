import assert from "node:assert/strict";
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
  for (const role of ["me", "friend", "other"]) {
    const email = `friends-${role}-${suffix}@example.invalid`;
    emails.push(email);
    const username = `f_${role}_${suffix}`;
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
    const response = await context.request.post("/api/auth/sign-up/email", {
      headers: { Origin: base, "x-invite-token": token },
      data: {
        email,
        username,
        name: `Music ${role}`,
        password: randomBytes(20).toString("hex"),
      },
    });
    assert.equal(response.status(), 200, await response.text());
    const user = await db.user.findUniqueOrThrow({ where: { email } });
    members.push({ ...user, context });
  }
  const [me, friend, other] = members;
  await assert.rejects(
    db.follow.create({ data: { followerId: me.id, followingId: me.id } }),
    "database must also reject self-follow",
  );
  const path = `/api/follow/${friend.username}`;
  const guest = await browser.newContext({ baseURL: base });
  assert.equal(
    (await guest.request.post(path, { headers: { Origin: base } })).status(),
    401,
  );
  assert.equal(
    (
      await me.context.request.post(path, {
        headers: { Origin: "https://example.invalid" },
      })
    ).status(),
    403,
  );
  assert.equal((await me.context.request.get(path)).status(), 405);
  assert.equal(
    (
      await me.context.request.post(`/api/follow/${me.username}`, {
        headers: { Origin: base },
      })
    ).status(),
    400,
  );
  assert.equal(
    (
      await me.context.request.post(`/api/follow/no_such_${suffix}`, {
        headers: { Origin: base },
      })
    ).status(),
    404,
  );
  const track = await db.track.findFirstOrThrow({
    where: { source: "SPOTIFY" },
  });
  const posts = [];
  for (const member of members) {
    const response = await member.context.request.post("/api/post", {
      headers: { Origin: base },
      data: { track, content: `Friends check ${member.username}` },
    });
    assert.equal(response.status(), 201, await response.text());
    posts.push(await response.json());
  }
  const empty = await (
    await me.context.request.get("/api/feed?view=friends")
  ).json();
  assert.deepEqual(empty, []);
  page = await me.context.newPage();
  page.setDefaultTimeout(15000);
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/feed?view=friends");
  await page
    .getByRole("heading", { name: "Find your music people." })
    .waitFor();
  await page
    .getByRole("link", { name: "Explore the room", exact: true })
    .click();
  await page.waitForURL("**/feed");
  await page.goto(`/u/${friend.username}`);
  await page
    .getByRole("button", { name: `Follow @${friend.username}`, exact: true })
    .click();
  await page
    .getByRole("button", {
      name: `Following @${friend.username}. Unfollow`,
      exact: true,
    })
    .waitFor();
  await page.getByText("1 follower", { exact: true }).waitFor();
  assert.equal(
    (
      await me.context.request.post(path, {
        headers: { Origin: base },
        data: { followerId: other.id },
      })
    ).status(),
    200,
  );
  assert.equal(
    await db.follow.count({
      where: { followerId: me.id, followingId: friend.id },
    }),
    1,
  );
  assert.equal(await db.follow.count({ where: { followerId: other.id } }), 0);
  const feed = await (
    await me.context.request.get("/api/feed?view=friends")
  ).json();
  assert.deepEqual(
    feed.map((post) => post.id),
    [posts[1].id],
  );
  const otherFeed = await (
    await other.context.request.get("/api/feed?view=friends")
  ).json();
  assert.deepEqual(otherFeed, []);
  const everyone = await (await me.context.request.get("/api/feed")).json();
  assert.ok(everyone.some((post) => post.id === posts[2].id));
  await page.goto("/feed?view=friends");
  await page
    .getByText(`Friends check ${friend.username}`, { exact: true })
    .waitFor();
  assert.equal(await page.locator(".music-post").count(), 1);
  await page.screenshot({
    path: ".impeccable/review/friends-feed-desktop.png",
    fullPage: true,
  });
  assert.equal(
    (
      await friend.context.request.post(`/api/follow/${me.username}`, {
        headers: { Origin: base },
      })
    ).status(),
    200,
  );
  await page.goto(`/u/${friend.username}`);
  await page.getByText("Follows you", { exact: true }).waitFor();
  await page.screenshot({
    path: ".impeccable/review/friends-profile-desktop.png",
    fullPage: true,
  });
  for (const width of [390, 320, 768, 1920]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.waitForTimeout(200);
    assert.equal(
      await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth,
      ),
      false,
      `profile overflow at ${width}`,
    );
    if (width === 390)
      await page.screenshot({
        path: ".impeccable/review/friends-profile-mobile.png",
        fullPage: true,
      });
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.route(`**/api/follow/${friend.username}`, (route) =>
    route.fulfill({
      status: 503,
      contentType: "application/json",
      body: JSON.stringify({ error: "Please try again." }),
    }),
  );
  await page
    .getByRole("button", {
      name: `Following @${friend.username}. Unfollow`,
      exact: true,
    })
    .click();
  await page.getByRole("alert").waitFor();
  assert.equal(
    await page
      .getByRole("button", {
        name: `Following @${friend.username}. Unfollow`,
        exact: true,
      })
      .getAttribute("aria-pressed"),
    "true",
  );
  await page.unroute(`**/api/follow/${friend.username}`);
  await page.waitForFunction(
    () => !document.querySelector(".profile-social button").disabled,
  );
  await page
    .getByRole("button", {
      name: `Following @${friend.username}. Unfollow`,
      exact: true,
    })
    .focus();
  await page.keyboard.press("Enter");
  await page
    .getByRole("button", { name: `Follow @${friend.username}`, exact: true })
    .waitFor();
  await page.getByText("0 followers", { exact: true }).waitFor();
  assert.equal(
    (
      await me.context.request.delete(path, { headers: { Origin: base } })
    ).status(),
    200,
  );
  assert.equal(await db.follow.count({ where: { followerId: me.id } }), 0);
  await page.goto("/feed?view=friends");
  await page
    .getByRole("heading", { name: "Find your music people." })
    .waitFor();
  await page.screenshot({
    path: ".impeccable/review/friends-empty-mobile.png",
    fullPage: true,
  });
  await page.goto(`/u/${me.username}`);
  assert.equal(
    await page
      .getByRole("button", { name: `Follow @${me.username}`, exact: true })
      .count(),
    0,
  );
  assert.deepEqual(errors, []);
  console.log(
    "Friends passed: private access, origin, identity, self-follow, idempotence, mutual status, isolated feeds, errors, keyboard, desktop/mobile.",
  );
} catch (error) {
  if (page) {
    console.log(
      "Follow control at failure:",
      await page
        .locator(".profile-social")
        .innerText()
        .catch(() => "unavailable"),
    );
    await page.screenshot({
      path: ".impeccable/review/friends-failure.png",
      fullPage: true,
    });
  }
  throw error;
} finally {
  const users = await db.user.findMany({
    where: { email: { in: emails } },
    select: { id: true },
  });
  await db.post.deleteMany({
    where: { authorId: { in: users.map((user) => user.id) } },
  });
  await db.user.deleteMany({ where: { email: { in: emails } } });
  await db.invite.deleteMany({ where: { id: { in: inviteIDs } } });
  await browser?.close();
  await db.$disconnect();
  console.log("Temporary friends, accounts, posts, and invites removed.");
}
