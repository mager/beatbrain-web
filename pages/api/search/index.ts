import type { NextApiRequest, NextApiResponse } from "next";
import { SERVER_HOST } from "@util";

// POST /api/search
// Required fields in body: query
export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const resp = await fetch(`${SERVER_HOST}/spotify/search`, {
    method: "POST",
    body: JSON.stringify(req.body),
    headers: {
      "Content-Type": "application/json",
    },
  });

  const respBody = await resp.json();
  res.json(respBody);
}
