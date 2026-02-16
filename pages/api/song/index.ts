import type { NextApiRequest, NextApiResponse } from "next";
import { SERVER_HOST } from "@util";
import { adaptTrack } from "@adapters/track";

// GET /api/song
// Required fields in query: mbid
export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { mbid } = req.query;
  if (!mbid || typeof mbid !== "string") {
    return res.status(400).json({ error: "mbid is required" });
  }

  const resp = await fetch(`${SERVER_HOST}/track?mbid=${mbid}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
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
