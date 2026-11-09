import prisma from "./prisma";
import { postSelection, serializePost } from "./post-view";

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
    select: postSelection(viewerID),
  });
  return posts.map(serializePost);
}
