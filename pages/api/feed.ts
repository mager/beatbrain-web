import type { NextApiRequest, NextApiResponse } from "next";
import { getFeed } from "../../lib/feed";
import { getSession } from "../../lib/auth-api";
import { PRIVATE_CACHE_CONTROL } from "../../lib/access";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  res.setHeader("Cache-Control", PRIVATE_CACHE_CONTROL);
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const limit = Math.max(
    1,
    Math.min(Math.floor(Number(req.query.limit)) || 24, 50),
  );
  if (
    req.query.view !== undefined &&
    req.query.view !== "all" &&
    req.query.view !== "friends"
  )
    return res.status(400).json({ error: "Choose a feed view." });

  try {
    const session = await getSession(req);
    if (!session)
      return res.status(401).json({ error: "Sign in to see the feed." });
    res.json(
      await getFeed(session.user.id, req.query.view === "friends", limit),
    );
  } catch (error) {
    console.error("Feed API error:", error);
    res.status(500).json({ error: "Failed to fetch feed" });
  }
}
