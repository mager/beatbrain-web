import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { randomBytes } from "node:crypto";
const require = createRequire(import.meta.url);
const { auth } = require("../lib/auth.ts");
const { default: db } = require("../lib/prisma.ts");
const { default: list } = require("../pages/api/waitlist.ts");
const { default: invite } = require("../pages/api/invites.ts");
const suffix = randomBytes(8).toString("hex");
const prefix = `waitlist-owner-${suffix}-`;
const memberID = `${prefix}member`;
const email = `${prefix}0@example.invalid`;
const memberEmail = `${prefix}member@example.invalid`;
const originalGetSession = auth.api.getSession;
let session = null;
auth.api.getSession = async () => session;
async function call(handler, method = "GET", body = {}, query = {}, origin = process.env.BETTER_AUTH_URL) {
  let status = 200, data;
  const res = { setHeader() {}, status(value) { status = value; return this; }, json(value) { data = value; return this; } };
  await handler({ method, body, query, headers: { origin } }, res);
  return { status, data };
}
try {
  assert.equal((await call(list)).status, 401);
  session = { user: { id: "not-the-owner", username: "mager" } };
  assert.equal((await call(list)).status, 403);
  assert.equal((await call(invite, "POST", { email })).status, 403);
  session = { user: { id: "4" } };
  assert.equal((await call(invite, "POST", { email }, {}, "https://example.invalid")).status, 403);
  await db.user.create({ data: { id: memberID, email: memberEmail, name: "Already a member" } });
  await db.waitlistEntry.createMany({ data: [
    { email: memberEmail, name: "Already a member", createdAt: new Date("2000-01-01") },
    ...Array.from({ length: 101 }, (_, i) => ({ email: `${prefix}${i}@example.invalid`, name: `Waiting ${i}`, createdAt: new Date(Date.UTC(2000, 0, 2) + i * 1000) })),
  ] });
  const found = [];
  let cursor;
  for (let page = 0; page < 10; page++) {
    const result = await call(list, "GET", {}, cursor ? { cursor } : {});
    assert.equal(result.status, 200);
    assert.ok(result.data.entries.length <= 50);
    found.push(...result.data.entries);
    cursor = result.data.nextCursor;
    if (!cursor) break;
  }
  assert.equal(found.filter(row => row.email.startsWith(prefix)).length, 101);
  assert.ok(!found.some(row => row.email === memberEmail));
  assert.equal(new Set(found.map(row => row.id)).size, found.length);
  const issued = await call(invite, "POST", { email });
  assert.equal(issued.status, 201);
  assert.equal(new URL(issued.data.url).searchParams.get("email"), email);
  assert.ok((await db.waitlistEntry.findUniqueOrThrow({ where: { email } })).invitedAt);
  assert.equal((await call(invite, "POST", { email: memberEmail })).status, 409);
  assert.equal((await db.waitlistEntry.findUniqueOrThrow({ where: { email: memberEmail } })).invitedAt, null);
  assert.equal((await call(list, "GET", {}, { cursor: "missing" })).status, 400);
  console.log(JSON.stringify({ passed: true, checks: ["owner-only access", "origin check", "pagination beyond 100", "members excluded before pagination", "invite creation updates status", "failed invite leaves status unchanged"] }, null, 2));
} finally {
  auth.api.getSession = originalGetSession;
  await db.invite.deleteMany({ where: { email: { startsWith: prefix } } });
  await db.waitlistEntry.deleteMany({ where: { email: { startsWith: prefix } } });
  await db.user.deleteMany({ where: { id: memberID } });
  await db.$disconnect();
  console.log("Temporary waitlist entries, member, and invite removed.");
}
