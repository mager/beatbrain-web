import { backendFetch } from "../../../lib/backend";
import type { NextApiRequest, NextApiResponse } from "next";
import { SERVER_HOST } from "@util";
import { getSession } from "../../../lib/auth-api";
import { PRIVATE_CACHE_CONTROL } from "../../../lib/access";
import { isCreatorResponse } from "../../../lib/creator-catalog";

const validID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse
) {
  res.setHeader("Cache-Control", PRIVATE_CACHE_CONTROL);
  if (req.method !== "GET") return res.setHeader("Allow", "GET").status(405).json({ error: "Method not allowed." });
  try {
    if (!(await getSession(req))?.user?.id) return res.status(401).json({ error: "Sign in to explore credits." });
    const { mbid } = req.query;
    if (typeof mbid !== "string" || !validID.test(mbid)) return res.status(400).json({ error: "A valid creator ID is required." });
    const resp = await backendFetch(`${SERVER_HOST}/creator?mbid=${mbid.toLowerCase()}`, { signal: AbortSignal.timeout(8000) });
    if (!resp.ok) return res.status(resp.status === 404 ? 404 : 503).json({ error: resp.status === 404 ? "This creator was not found." : "Creator credits could not be loaded. Please try again." });
    const { creator } = await resp.json();
    if (!isCreatorResponse(creator)) return res.status(502).json({ error: "The music source returned incomplete creator data. Please try again." });
    return res.json(creator);
  } catch {
    return res.status(503).json({ error: "Creator credits could not be loaded. Please try again." });
  }
}
