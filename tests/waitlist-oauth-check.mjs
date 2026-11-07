// Run with: node --env-file=.env.local --import tsx tests/waitlist-oauth-check.mjs
// Only Spotify responses are mocked. OAuth state, hooks, and database writes are real.
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { randomBytes } from "node:crypto";
const require = createRequire(import.meta.url);
const { auth } = require("../lib/auth.ts");
const { default: db } = require("../lib/prisma.ts");
const base = process.env.BETTER_AUTH_URL;
assert.ok(base, "BETTER_AUTH_URL is required");
const suffix = randomBytes(8).toString("hex");
const email = `waitlist-${suffix}@example.invalid`;
const memberEmail = `spotify-member-${suffix}@example.invalid`;
const memberID = `spotify-member-${suffix}`;
const spotifyID = `waitlist-${suffix}`;
const states = [];
let profile = { id: spotifyID, email, display_name: "Waitlist check", images: [], type: "user", uri: `spotify:user:${spotifyID}`, external_urls: {}, followers: { total: 0 } };
const originalFetch = globalThis.fetch;
globalThis.fetch = async (input, init) => {
  const url = String(input instanceof Request ? input.url : input);
  if (url === "https://accounts.spotify.com/api/token")
    return Response.json({ access_token: "fixture-access", token_type: "Bearer", expires_in: 3600, refresh_token: "fixture-refresh", scope: "user-read-email user-read-private" });
  if (url === "https://api.spotify.com/v1/me") return Response.json(profile);
  throw new Error(`Unexpected fetch during isolated OAuth test: ${new URL(url).origin}`);
};

async function callback({ badState = false, denied = false } = {}) {
  const start = await auth.handler(new Request(`${base}/api/auth/sign-in/social`, {
    method: "POST", headers: { "Content-Type": "application/json", Origin: base },
    body: JSON.stringify({ provider: "spotify", callbackURL: "/", errorCallbackURL: "/auth/signin", disableRedirect: true }),
  }));
  assert.equal(start.status, 200, await start.clone().text());
  const state = new URL((await start.json()).url).searchParams.get("state");
  states.push(state);
  const cookies = start.headers.getSetCookie().map(cookie => cookie.split(";")[0]).join("; ");
  const params = new URLSearchParams({ state: badState ? "invalid-state" : state, ...(denied ? { error: "access_denied" } : { code: "fixture-code" }) });
  return auth.handler(new Request(`${base}/api/auth/callback/spotify?${params}`, { headers: { Cookie: cookies } }));
}

try {
  const bad = await callback({ badState: true });
  assert.notEqual(new URL(bad.headers.get("location"), base).searchParams.get("error"), "WAITLIST_JOINED");
  assert.equal(await db.waitlistEntry.count({ where: { email } }), 0);
  const denied = await callback({ denied: true });
  assert.equal(new URL(denied.headers.get("location"), base).searchParams.get("error"), "access_denied");
  assert.equal(await db.waitlistEntry.count({ where: { email } }), 0);

  const joined = await callback();
  assert.equal(joined.status, 302);
  assert.equal(new URL(joined.headers.get("location"), base).searchParams.get("error"), "WAITLIST_JOINED");
  assert.ok(!joined.headers.getSetCookie().some(cookie => /session_token=/.test(cookie)));
  assert.equal(await db.user.count({ where: { email } }), 0);
  assert.equal(await db.account.count({ where: { providerId: "spotify", accountId: spotifyID } }), 0);
  const entry = await db.waitlistEntry.findUniqueOrThrow({ where: { email } });
  assert.equal(entry.name, "Waitlist check");
  const invitedAt = new Date("2026-11-07T00:00:00Z");
  await db.waitlistEntry.update({ where: { email }, data: { invitedAt } });
  await callback();
  assert.equal(await db.waitlistEntry.count({ where: { email } }), 1);
  assert.equal((await db.waitlistEntry.findUniqueOrThrow({ where: { email } })).invitedAt.toISOString(), invitedAt.toISOString());

  await db.user.create({ data: { id: memberID, email: memberEmail, username: `sp_${suffix}`, name: "Existing member", accounts: { create: { id: `account-${suffix}`, providerId: "spotify", accountId: `member-${spotifyID}` } } } });
  profile = { ...profile, id: `member-${spotifyID}`, email: memberEmail };
  const member = await callback();
  assert.equal(member.status, 302);
  assert.equal(new URL(member.headers.get("location"), base).pathname, "/");
  assert.ok(member.headers.getSetCookie().some(cookie => /session_token=/.test(cookie)));
  assert.equal(await db.session.count({ where: { userId: memberID } }), 1);
  assert.equal(await db.waitlistEntry.count({ where: { email: memberEmail } }), 0);
  console.log(JSON.stringify({ passed: true, checks: ["real OAuth state validation", "denied consent creates nothing", "Spotify waitlist callback", "no new member/account/session", "duplicate signup preserves invite state", "existing linked Spotify member signs in"] }, null, 2));
} finally {
  globalThis.fetch = originalFetch;
  await db.user.deleteMany({ where: { id: memberID } });
  await db.waitlistEntry.deleteMany({ where: { email: { in: [email, memberEmail] } } });
  await db.verification.deleteMany({ where: { identifier: { in: states.filter(Boolean) } } });
  await db.$disconnect();
  console.log("Temporary OAuth member, waitlist rows, and state records removed.");
}
