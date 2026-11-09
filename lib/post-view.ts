import type { Prisma } from "@prisma/client";

export function postSelection(viewerID: string) {
  return {
    id: true,
    content: true,
    createdAt: true,
    author: { select: { name: true, username: true, image: true } },
    track: {
      select: { title: true, artist: true, sourceId: true, image: true },
    },
    _count: { select: { loves: true } },
    loves: { where: { userId: viewerID }, select: { userId: true }, take: 1 },
  } satisfies Prisma.PostSelect;
}

type SelectedPost = Prisma.PostGetPayload<{
  select: ReturnType<typeof postSelection>;
}>;
export function serializePost({
  loves,
  _count,
  createdAt,
  ...post
}: SelectedPost) {
  return {
    ...post,
    createdAt: createdAt.toISOString(),
    loveCount: _count.loves,
    lovedByViewer: loves.length > 0,
  };
}
