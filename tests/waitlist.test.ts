import assert from "node:assert/strict";
import test from "node:test";
import { routeNewSpotifyUser } from "../lib/waitlist";

const spotify = { action: "create-user", method: "oauth", oauth: { providerId: "spotify" } };

test("new Spotify listeners enter the waitlist instead of receiving membership", async () => {
  const rows = new Map<string, { name: string }>();
  const store = { upsert: async (args: any) => {
    rows.set(args.where.email, rows.has(args.where.email) ? args.update : args.create);
  } };
  const result = await routeNewSpotifyUser({ user: { email: " Friend@Example.com ", name: "Friend" }, source: spotify }, store);
  assert.equal(result?.error, "WAITLIST_JOINED");
  assert.equal(rows.get("friend@example.com")?.name, "Friend");
  await routeNewSpotifyUser({ user: { email: "friend@example.com", name: "Updated" }, source: spotify }, store);
  assert.equal(rows.size, 1);
  assert.deepEqual(rows.get("friend@example.com"), { name: "Updated" }, "repeat joins only update the name, not invitation state");
});

test("existing member sign-in and non-Spotify creation do not enter the waitlist", async () => {
  const store = { upsert: async () => { throw new Error("Must not store this request"); } };
  for (const source of [
    { ...spotify, action: "sign-in" },
    { ...spotify, method: "email-password" },
    { ...spotify, oauth: { providerId: "other" } },
  ]) assert.equal(await routeNewSpotifyUser({ user: { email: "member@example.com" }, source }, store), undefined);
});

test("missing Spotify email cannot report a saved place", async () => {
  const store = { upsert: async () => { throw new Error("Must not store invalid email"); } };
  for (const email of [undefined, "", "missing@domain", "a b@example.com"])
    assert.equal((await routeNewSpotifyUser({ user: { email }, source: spotify }, store))?.error, "WAITLIST_EMAIL_REQUIRED");
});

test("a database failure cannot return waitlist success", async () => {
  await assert.rejects(() => routeNewSpotifyUser({ user: { email: "friend@example.com" }, source: spotify }, {
    upsert: async () => { throw new Error("database unavailable"); },
  }), /database unavailable/);
});
