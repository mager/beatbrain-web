import type { NextApiRequest, NextApiResponse } from "next";
import { SERVER_HOST } from "@util";
import { backendFetch } from "../../../lib/backend";
export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST")
    return res
      .setHeader("Allow", "POST")
      .status(405)
      .json({ error: "Method not allowed" });
  const query =
    typeof req.body?.query === "string" ? req.body.query.trim() : "";
  if (!query || query.length > 200)
    return res
      .status(400)
      .json({ error: "Enter a track or artist, up to 200 characters." });
  try {
    const response = await backendFetch(`${SERVER_HOST}/spotify/search`, {
      method: "POST",
      body: JSON.stringify({ query, limit: 10 }),
      headers: { "Content-Type": "application/json" },
    });
    if (!response.ok)
      return res
        .status(502)
        .json({ error: "Track search is unavailable. Please try again." });
    return res.json(await response.json());
  } catch {
    return res
      .status(504)
      .json({ error: "Track search took too long. Please try again." });
  }
}
