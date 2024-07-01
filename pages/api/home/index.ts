import type { NextApiRequest, NextApiResponse } from "next";
import { SERVER_HOST } from "../util";

// GET /api/get_featured_tracks
// Required fields in body: query
export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const resp = await fetch(`${SERVER_HOST}/spotify/get_featured_tracks`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  const respBody = await resp.json();
  res.json(respBody);
}
