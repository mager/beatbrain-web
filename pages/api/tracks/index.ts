import type { NextApiRequest, NextApiResponse } from "next";
import { SERVER_HOST } from "@util";

// POST /api/home
// Required fields in body: genre
export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const resp = await fetch(`${SERVER_HOST}/spotify/recommended_tracks`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(req.body),
  });

  const respBody = await resp.json();
  res.json(respBody);
}
