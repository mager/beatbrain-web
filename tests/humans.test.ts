import assert from "node:assert/strict";
import test from "node:test";
import { auth } from "../lib/auth";
import prisma from "../lib/prisma";
import handler from "../pages/api/humans";

const response = () => ({
  code: 200, body: null as any, headers: {} as any,
  setHeader(k: string, v: unknown) { this.headers[k] = v; return this; },
  status(n: number) { this.code = n; return this; },
  json(v: unknown) { this.body = v; return this; },
}) as any;

test("Humans requires a session and validates bounded directory requests", async (t) => {
  const session = auth.api.getSession, find = prisma.user.findMany;
  t.after(() => { auth.api.getSession = session; prisma.user.findMany = find; });
  let actor: any = null;
  auth.api.getSession = (async () => actor) as any;
  prisma.user.findMany = (async () => { throw Error("must not query"); }) as any;
  const req = { method: "GET", headers: {}, query: {} } as any;
  const guest = response(); await handler(req, guest);
  assert.equal(guest.code, 401);
  assert.match(guest.headers["Cache-Control"], /no-store/);
  actor = { user: { id: "member" } };
  for (const query of [{ q: ["a"] }, { q: "a".repeat(101) }, { filter: "admin" }, { sort: "email" }, { page: "-1" }, { page: "1.5" }, { page: "10001" }]) {
    const r = response(); await handler({ ...req, query }, r); assert.equal(r.code, 400);
  }
  const wrongMethod = response(); await handler({ ...req, method: "POST" }, wrongMethod);
  assert.equal(wrongMethod.code, 405);
});

test("Humans uses the session for following and returns only safe profile/music fields", async (t) => {
  const session = auth.api.getSession, find = prisma.user.findMany, count = prisma.user.count;
  t.after(() => { auth.api.getSession = session; prisma.user.findMany = find; prisma.user.count = count; });
  auth.api.getSession = (async () => ({ user: { id: "viewer" } })) as any;
  prisma.user.findMany = (async (args: any) => {
    assert.equal(args.take, 24); assert.equal(args.skip, 24);
    assert.equal(args.where.followers.some.followerId, "viewer");
    assert.equal(args.where.OR[0].name.contains, "radiohead");
    assert.equal(args.select.email, undefined); assert.equal(args.select.accounts, undefined);
    assert.equal(args.select.posts.take, 3);
    return [{ id: "friend", name: "Friend", username: "friend", image: null,
      createdAt: new Date("2026-01-01"), _count: { posts: 4 }, followers: [{ followerId: "viewer" }],
      posts: [{ id: 1, createdAt: new Date("2026-11-01"), track: { title: "Let Down", artist: "Radiohead", image: "cover.jpg" } }] }];
  }) as any;
  prisma.user.count = (async () => 25) as any;
  const r = response();
  await handler({ method: "GET", headers: {}, query: { q: " Radiohead ", filter: "following", page: "1", actor: "someone-else" } } as any, r);
  assert.equal(r.code, 200); assert.equal(r.body.total, 25); assert.equal(r.body.hasMore, false);
  assert.equal(r.body.members[0].following, true);
  assert.equal(r.body.members[0].postCount, 4);
  assert.deepEqual(Object.keys(r.body.members[0]).sort(), ["createdAt", "following", "id", "image", "isSelf", "name", "postCount", "posts", "username"]);
  assert.equal(r.body.members[0].createdAt, "2026-01-01T00:00:00.000Z");
});

test("Humans applies recent-post and sort filters and contains database failures", async (t) => {
  const session = auth.api.getSession, find = prisma.user.findMany, count = prisma.user.count;
  t.after(() => { auth.api.getSession = session; prisma.user.findMany = find; prisma.user.count = count; });
  auth.api.getSession = (async () => ({ user: { id: "viewer" } })) as any;
  prisma.user.count = (async () => 0) as any;
  prisma.user.findMany = (async (args: any) => {
    const age = Date.now() - args.where.posts.some.createdAt.gte.getTime();
    assert.ok(Math.abs(age - 30 * 86400000) < 2000);
    assert.deepEqual(args.orderBy, [{ posts: { _count: "desc" } }, { id: "asc" }]);
    return [];
  }) as any;
  const req = { method: "GET", headers: {}, query: { filter: "recent", sort: "posts" } } as any;
  const r = response(); await handler(req, r);
  assert.equal(r.code, 200); assert.deepEqual(r.body.members, []);
  prisma.user.findMany = (async () => { throw Error("private database URL"); }) as any;
  const failed = response(); await handler(req, failed);
  assert.equal(failed.code, 503); assert.doesNotMatch(JSON.stringify(failed.body), /private database/);
});
