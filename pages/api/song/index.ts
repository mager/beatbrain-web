import type { NextApiRequest, NextApiResponse } from "next";
import { SERVER_HOST } from "@util";
import { adaptTrack } from "@adapters/track";

// GET /api/song
// Required fields in query: mbid
export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const resp = await fetch(`${SERVER_HOST}/track?mbid=${req.query.mbid}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  const respBody = await resp.json();
  const adapted = adaptTrack(respBody);
  res.json(adapted);
}
