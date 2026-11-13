import { parseSourceHealth } from "../../../lib/discovery-health";
import { backendFetch } from "../../../lib/backend";
import type { NextApiRequest, NextApiResponse } from "next";
import { SERVER_HOST } from "@util";
import prisma from "../../../lib/prisma";
import { getSession } from "../../../lib/auth-api";
import { PRIVATE_CACHE_CONTROL } from "../../../lib/access";
import {
  rankRoom,
  rankForYou,
  type DiscoveryTrack,
} from "../../../lib/discovery";

async function worldwide() {
  const response = await backendFetch(`${SERVER_HOST}/discover/v2`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: "{}",
    signal: AbortSignal.timeout(8000),
  });
  if (!response.ok) throw new Error("Worldwide discovery unavailable");
  const data = await response.json();
  if (!Array.isArray(data.tracks))
    throw new Error("Invalid discovery response");
  const seen = new Set<string>();
  const tracks: DiscoveryTrack[] = [];
  for (const track of data.tracks) {
    if (
      !track ||
      typeof track.source_id !== "string" ||
      !/^[a-zA-Z0-9]{22}$/.test(track.source_id) ||
      typeof track.name !== "string" ||
      !track.name.trim() ||
      typeof track.artist !== "string" ||
      !track.artist.trim() ||
      seen.has(track.source_id)
    )
      continue;
    seen.add(track.source_id);
    tracks.push({
      source_id: track.source_id,
      name: track.name,
      artist: track.artist,
      image: typeof track.image === "string" ? track.image : "",
    });
  }
  return {
    tracks: tracks.slice(0, 60),
    sources: parseSourceHealth(data.sources),
    updated: typeof data.updated === "string" ? data.updated : "",
  };
}

const postSelect = {
  authorId: true,
  createdAt: true,
  track: {
    select: {
      source: true,
      sourceId: true,
      title: true,
      artist: true,
      image: true,
    },
  },
} as const;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  res.setHeader("Cache-Control", PRIVATE_CACHE_CONTROL);
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }
  const mode = req.body?.mode ?? "room";
  if (!["room", "you", "world"].includes(mode))
    return res.status(400).json({ error: "Choose a discovery view." });
  try {
    const session = await getSession(req);
    if (!session)
      return res.status(401).json({ error: "Sign in to discover music." });
    if (mode === "world")
      return res.status(200).json({ ...(await worldwide()), mode });
    const postsRequest = prisma.post.findMany({
      where: { authorId: { not: null }, track: { source: "SPOTIFY" } },
      select: postSelect,
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      take: 1000,
    });
    const now = Date.now();
    if (mode === "room") {
      const posts = await postsRequest;
      return res
        .status(200)
        .json({
          mode,
          tracks: rankRoom(posts, now),
          updated: posts[0]?.createdAt.toISOString() ?? "",
        });
    }
    const [posts, own, world] = await Promise.all([
      postsRequest,
      prisma.post.findMany({
        where: { authorId: session.user.id, track: { source: "SPOTIFY" } },
        select: postSelect,
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
        take: 100,
      }),
      worldwide().catch(() => null),
    ]);
    const personal = rankForYou(posts, own, world?.tracks ?? [], now);
    if (!world && personal.tracks.length === 0)
      return res
        .status(502)
        .json({ error: "Discovery is unavailable. Please try again." });
    return res
      .status(200)
      .json({
        mode,
        ...personal,
        updated: "",
        worldwideAvailable: world !== null,
      });
  } catch (error) {
    const timeout =
      error instanceof Error &&
      (error.name === "TimeoutError" || error.name === "AbortError");
    res
      .status(timeout ? 504 : 502)
      .json({ error: "Discovery is unavailable. Please try again." });
  }
}

export const config = { api: { bodyParser: { sizeLimit: "1kb" } } };
