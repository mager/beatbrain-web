import type { GetServerSideProps } from "next";
import { backendFetch } from "../../../lib/backend";
import prisma from "../../../lib/prisma";
import { SERVER_HOST } from "@util";
import { adaptTrack } from "@adapters/track";
export { default } from "@components/TrackDetail";

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { sourceId } = context.params;
  if (!sourceId || typeof sourceId !== "string") {
    return { notFound: true };
  }

  // Try v2 first (parallel fetch + cache), fall back to v1
  let resp = await backendFetch(
    `${SERVER_HOST}/v2/track?spotifyId=${sourceId}`,
  );
  if (!resp.ok) {
    console.warn(`v2 track fetch failed (${resp.status}), falling back to v1`);
    resp = await backendFetch(`${SERVER_HOST}/track?spotifyId=${sourceId}`);
    if (!resp.ok) {
      console.error(
        `v1 track fetch also failed: ${resp.status} ${resp.statusText}`,
      );
      return { notFound: true };
    }
  }

  const respBody = await resp.json();
  if (!respBody.track) {
    return { notFound: true };
  }

  const track = adaptTrack(respBody);

  const posts = await prisma.post.findMany({
    where: { track: { sourceId } },
    take: 100,
    orderBy: { createdAt: "desc" },
    select: { author: { select: { name: true, username: true, image: true } } },
  });

  return { props: { track, posts, sourceId } };
};
