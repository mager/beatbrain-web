import type { NextApiRequest, NextApiResponse } from "next";
import { SERVER_HOST } from "@util";
import { backendFetch } from "../../../lib/backend";
import { getSession } from "../../../lib/auth-api";
import { PRIVATE_CACHE_CONTROL } from "../../../lib/access";
import { parseArtistPayload, validSpotifyId } from "../../../lib/artist";

const unavailable = { error: "Artist details could not be loaded. Try again." };

export default async function handle(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader("Cache-Control", PRIVATE_CACHE_CONTROL);
  if (req.method !== "GET") return res.setHeader("Allow", "GET").status(405).json({ error: "Method not allowed." });
  try {
    const session = await getSession(req);
    if (!session?.user?.id) return res.status(401).json({ error: "Sign in to view artists." });
  } catch { return res.status(503).json({ error: "Access could not be checked. Try again." }); }
  const { spotifyId, offset: rawOffset = "0" } = req.query;
  if (!validSpotifyId(spotifyId) || typeof rawOffset !== "string" || !/^\d{1,3}$/.test(rawOffset) || Number(rawOffset) > 990)
    return res.status(400).json({ error: "A valid artist ID and page are required." });
  const offset = Number(rawOffset);
  const deadline = AbortSignal.timeout(8000);
  const disconnected = new AbortController();
  const disconnect = () => { if (!res.writableEnded) disconnected.abort(); };
  req.once("aborted", disconnect);
  res.once("close", disconnect);
  if (req.aborted || res.destroyed) disconnect();
  const signal = AbortSignal.any([deadline, disconnected.signal]);
  try {
    if (disconnected.signal.aborted) return;
    const response = await backendFetch(`${SERVER_HOST}/artist?spotifyId=${spotifyId}&offset=${offset}`, { signal });
    if (response.status === 404) return res.status(404).json({ error: "Artist not found." });
    if (!response.ok) return res.status(502).json(unavailable);
    const body = parseArtistPayload(await response.json(), spotifyId, offset);
    if (!body) return res.status(502).json(unavailable);
    return res.json(body);
  } catch {
    if (disconnected.signal.aborted) return;
    return res.status(deadline.aborted ? 504 : 502).json(unavailable);
  } finally {
    req.off("aborted", disconnect);
    res.off("close", disconnect);
  }
}
