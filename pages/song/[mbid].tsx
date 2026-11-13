import type { GetServerSideProps } from "next";
import { backendFetch } from "../../lib/backend";
import prisma from "../../lib/prisma";
import { SERVER_HOST } from "@util";
import { adaptTrack } from "@adapters/track";
export { default } from "@components/TrackDetail";

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { mbid } = context.params;
  if (!mbid || typeof mbid !== "string") {
    return { notFound: true };
  }

  // Check if mbid is actually a Spotify ID (passed directly from feed/discover)
  const isSpotifyId = mbid.length === 22 && !mbid.includes("-");

  let track;
  let sourceId: string | null = null;

  if (isSpotifyId) {
    // Try v2 first, fall back to v1
    let resp = await backendFetch(`${SERVER_HOST}/v2/track?spotifyId=${mbid}`);
    if (!resp.ok) {
      console.warn(
        `v2 track fetch failed (${resp.status}), falling back to v1`,
      );
      resp = await backendFetch(`${SERVER_HOST}/track?spotifyId=${mbid}`);
    }
    if (!resp.ok) {
      console.error(`track fetch failed: ${resp.status}`);
      return { notFound: true };
    }
    const body = await resp.json();
    if (!body.track) return { notFound: true };
    track = adaptTrack(body);
    sourceId = mbid;
  } else {
    // MBID path: resolve source_id first, then hit v2
    const mbResp = await backendFetch(`${SERVER_HOST}/track?mbid=${mbid}`);
    if (!mbResp.ok) {
      console.error(`MB track fetch failed: ${mbResp.status}`);
      return { notFound: true };
    }
    const mbBody = await mbResp.json();
    if (!mbBody.track) return { notFound: true };

    sourceId = mbBody.track.source_id || null;

    if (sourceId) {
      // Upgrade to v2 for full features + cache
      try {
        const v2Resp = await backendFetch(
          `${SERVER_HOST}/v2/track?spotifyId=${sourceId}`,
        );
        if (v2Resp.ok) {
          const v2Body = await v2Resp.json();
          if (v2Body.track?.id && v2Body.track.id.toLowerCase() === mbBody.track.id?.toLowerCase()) {
            track = adaptTrack(v2Body);
          }
        }
      } catch (err) {
        console.warn("v2 upgrade failed, falling back to mbid data", err);
      }
    }

    // Final fallback: use the MB response as-is
    if (!track) {
      track = adaptTrack(mbBody);
    }
  }

  let posts: { author: { name: string; image: string } }[] = [];
  if (sourceId) {
    posts = await prisma.post.findMany({
      where: { track: { sourceId } },
      take: 100,
      orderBy: { createdAt: "desc" },
      select: {
        author: { select: { name: true, username: true, image: true } },
      },
    });
  }

  return { props: { track, posts, sourceId } };
};
