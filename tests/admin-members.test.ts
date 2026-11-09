import assert from "node:assert/strict";
import test from "node:test";
import { auth } from "../lib/auth";
import prisma from "../lib/prisma";
import handler from "../pages/api/admin/members";
const response = () =>
  ({
    code: 200,
    body: null as any,
    headers: {} as any,
    setHeader(k: string, v: unknown) {
      this.headers[k] = v;
      return this;
    },
    status(n: number) {
      this.code = n;
      return this;
    },
    json(v: unknown) {
      this.body = v;
      return this;
    },
  }) as any;
test("member directory is owner-only, private, bounded, and excludes account secrets", async (t) => {
  const session = auth.api.getSession,
    find = prisma.user.findMany;
  t.after(() => {
    auth.api.getSession = session;
    prisma.user.findMany = find;
  });
  let actor: any = null,
    calls = 0;
  auth.api.getSession = (async () => actor) as any;
  prisma.user.findMany = (async (args: any) => {
    calls++;
    assert.equal(args.take, 51);
    assert.deepEqual(Object.keys(args.select).sort(), [
      "_count",
      "createdAt",
      "email",
      "id",
      "image",
      "name",
      "username",
    ]);
    return [];
  }) as any;
  const req = { method: "GET", headers: {}, query: {} } as any;
  for (const [user, code] of [
    [null, 401],
    [{ id: "other" }, 403],
    [{ id: "other", username: "mager" }, 403],
  ] as const) {
    actor = user ? { user } : null;
    const r = response();
    await handler(req, r);
    assert.equal(r.code, code);
    assert.equal(calls, 0);
  }
  actor = { user: { id: "4" } };
  const r = response();
  await handler(req, r);
  assert.equal(r.code, 200);
  assert.deepEqual(r.body, { members: [], nextCursor: null });
  assert.match(r.headers["Cache-Control"], /no-store/);
  const bad = response();
  await handler({ ...req, method: "POST" }, bad);
  assert.equal(bad.code, 405);
});

test("member pages keep the final row for the next page and return a safe database error", async (t) => {
  const session = auth.api.getSession,
    find = prisma.user.findMany;
  t.after(() => {
    auth.api.getSession = session;
    prisma.user.findMany = find;
  });
  auth.api.getSession = (async () => ({ user: { id: "4" } })) as any;
  prisma.user.findMany = (async (args: any) => {
    assert.deepEqual(args.cursor, { id: "previous" });
    assert.equal(args.skip, 1);
    return Array.from({ length: 51 }, (_, i) => ({ id: `member-${i}` }));
  }) as any;
  const req = {
    method: "GET",
    headers: {},
    query: { cursor: "previous" },
  } as any;
  const r = response();
  await handler(req, r);
  assert.equal(r.body.members.length, 50);
  assert.equal(r.body.nextCursor, "member-49");
  const invalid = response();
  await handler({ ...req, query: { cursor: ["bad"] } }, invalid);
  assert.equal(invalid.code, 400);
  prisma.user.findMany = (async () => {
    throw Error("private database URL");
  }) as any;
  const failed = response();
  await handler(req, failed);
  assert.equal(failed.code, 503);
  assert.doesNotMatch(JSON.stringify(failed.body), /private database URL/);
});
