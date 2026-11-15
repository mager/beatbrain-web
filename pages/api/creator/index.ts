import { backendFetch } from "../../../lib/backend";
import type { NextApiRequest, NextApiResponse } from "next";
import { SERVER_HOST } from "@util";
import { getSession } from "../../../lib/auth-api";
import { PRIVATE_CACHE_CONTROL } from "../../../lib/access";

const unavailable = { error: "Creator details could not be loaded. Try again." };

export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse
) {
  res.setHeader("Cache-Control", PRIVATE_CACHE_CONTROL);
  if (req.method !== "GET")
    return res.setHeader("Allow", "GET").status(405).json({ error: "Method not allowed." });

  try {
    const session = await getSession(req);
    if (!session?.user?.id)
      return res.status(401).json({ error: "Sign in to view creator details." });
  } catch {
    return res.status(503).json({ error: "Access could not be checked. Try again." });
  }

  const { mbid } = req.query;
  if (typeof mbid !== "string" || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(mbid))
    return res.status(400).json({ error: "A valid creator ID is required." });

  const signal = AbortSignal.timeout(8000);
  try {
    const resp = await backendFetch(`${SERVER_HOST}/creator?mbid=${encodeURIComponent(mbid)}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      signal,
    });
    if (resp.status === 404)
      return res.status(404).json({ error: "Creator not found." });
    if (!resp.ok) return res.status(502).json(unavailable);

    const body = await resp.json();
    if (typeof body?.creator?.id !== "string" || typeof body?.creator?.name !== "string" || !body.creator.name.trim())
      return res.status(502).json(unavailable);
    return res.json(body.creator);
  } catch {
    return res.status(signal.aborted ? 504 : 502).json(unavailable);
  }
}
