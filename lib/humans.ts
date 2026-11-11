import type { Prisma } from "@prisma/client";
import prisma from "./prisma";
import type { HumansQuery, HumansResult } from "./humans-types";

export function parseHumansQuery(query: Record<string, unknown>): HumansQuery | null {
  const { q = "", filter = "everyone", sort = "newest", page = "0" } = query;
  if (typeof q !== "string" || q.length > 100 ||
    typeof filter !== "string" || !["everyone", "following", "recent"].includes(filter) ||
    typeof sort !== "string" || !["newest", "name", "posts"].includes(sort) ||
    typeof page !== "string" || !/^\d{1,5}$/.test(page) || Number(page) > 10000) return null;
  return { q: q.trim(), filter: filter as HumansQuery["filter"], sort: sort as HumansQuery["sort"], page: Number(page) };
}

export async function getHumans(actorId: string, query: HumansQuery): Promise<HumansResult> {
  const term = query.q.replace(/^@/, "").toLowerCase();
  const where: Prisma.UserWhereInput = {
    username: { not: null },
    ...(term ? { OR: [
      { name: { contains: term, mode: "insensitive" } },
      { username: { contains: term, mode: "insensitive" } },
      { posts: { some: { track: { artist: { contains: term, mode: "insensitive" } } } } },
    ] } : {}),
    ...(query.filter === "following" ? { followers: { some: { followerId: actorId } } } : {}),
    ...(query.filter === "recent" ? { posts: { some: { createdAt: { gte: new Date(Date.now() - 30 * 86400000) } } } } : {}),
  };
  const orderBy: Prisma.UserOrderByWithRelationInput[] = query.sort === "name"
    ? [{ name: "asc" }, { id: "asc" }]
    : query.sort === "posts" ? [{ posts: { _count: "desc" } }, { id: "asc" }]
      : [{ createdAt: "desc" }, { id: "asc" }];
  const [rows, total] = await Promise.all([
    prisma.user.findMany({
      where, orderBy, take: 24, skip: query.page * 24,
      select: {
        id: true, name: true, username: true, image: true, createdAt: true,
        _count: { select: { posts: true } },
        followers: { where: { followerId: actorId }, select: { followerId: true }, take: 1 },
        posts: { take: 3, orderBy: [{ createdAt: "desc" }, { id: "desc" }], select: {
          id: true, createdAt: true, track: { select: { title: true, artist: true, image: true } },
        } },
      },
    }),
    prisma.user.count({ where }),
  ]);
  return {
    members: rows.map(({ _count, followers, posts, createdAt, ...user }) => ({
      ...user, createdAt: createdAt.toISOString(), postCount: _count.posts,
      following: followers.length > 0, isSelf: user.id === actorId,
      posts: posts.map(post => ({ ...post, createdAt: post.createdAt.toISOString() })),
    })),
    total, hasMore: (query.page + 1) * 24 < total,
  };
}
