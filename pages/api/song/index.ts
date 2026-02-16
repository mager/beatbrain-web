import type { NextApiRequest, NextApiResponse } from "next";
import { SERVER_HOST } from "@util";
import { adaptTrack } from "@adapters/track";

// GET /api/song
// Query params: mbid OR spotifyId
export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { mbid, spotifyId } = req.query;

  let url: string;
  if (spotifyId && typeof spotifyId === "string") {
    url = `${SERVER_HOST}/track?spotifyId=${spotifyId}`;
  } else if (mbid && typeof mbid === "string") {
    url = `${SERVER_HOST}/track?mbid=${mbid}`;
  } else {
    return res.status(400).json({ error: "mbid or spotifyId is required" });
  }

  const resp = await fetch(url, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  if (!resp.ok) {
    return res.status(resp.status).json({ error: "Failed to fetch track" });
  }

  const respBody = await resp.json();
  if (!respBody.track) {
    return res.status(404).json({ error: "Track not found" });
  }

  const adapted = adaptTrack(respBody);
  res.json(adapted);
}
