import type { NextApiRequest, NextApiResponse } from "next";
import { SERVER_HOST } from "@util";
import { adaptTrack } from "@adapters/track";

// GET /api/track
// Required fields in query: isrc
export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const resp = await fetch(`${SERVER_HOST}/track?isrc=${req.query.isrc}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  const respBody = await resp.json();
  const adapted = adaptTrack(respBody);
  console.log({ adapted });
  res.json(adapted);
}
