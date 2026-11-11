import type { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "../../lib/auth-api";
import { PRIVATE_CACHE_CONTROL } from "../../lib/access";
import { getHumans, parseHumansQuery } from "../../lib/humans";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader("Cache-Control", PRIVATE_CACHE_CONTROL);
  if (req.method !== "GET") return res.setHeader("Allow", "GET").status(405).json({ error: "Method not allowed." });
  try {
    const session = await getSession(req);
    if (!session?.user?.id) return res.status(401).json({ error: "Sign in to explore members." });
    const query = parseHumansQuery(req.query);
    if (!query) return res.status(400).json({ error: "Check your search and filters, then try again." });
    return res.json(await getHumans(session.user.id, query));
  } catch {
    return res.status(503).json({ error: "Members could not be loaded. Please try again." });
  }
}
