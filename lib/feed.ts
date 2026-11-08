import prisma from "./prisma";

export async function getFeed(
  viewerID: string,
  friends: boolean,
  limit: number,
) {
  const posts = await prisma.post.findMany({
    where: friends
      ? { author: { followers: { some: { followerId: viewerID } } } }
      : {},
    take: Math.max(1, Math.min(limit, 50)),
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    select: {
      id: true,
      content: true,
      createdAt: true,
      author: { select: { name: true, username: true, image: true } },
      track: {
        select: { title: true, artist: true, sourceId: true, image: true },
      },
    },
  });
  return posts.map((post) => ({
    ...post,
    createdAt: post.createdAt.toISOString(),
  }));
}
