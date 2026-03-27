import type { NextApiRequest, NextApiResponse } from "next";
import { SERVER_HOST } from "@util";

export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const resp = await fetch(`${SERVER_HOST}/creator?mbid=${req.query.mbid}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    signal: AbortSignal.timeout(8000),
  });

  const respBody = await resp.json();
  res.json(respBody.creator);
}
