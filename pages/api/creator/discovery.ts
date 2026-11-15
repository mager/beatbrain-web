import type { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "../../../lib/auth-api";
import { PRIVATE_CACHE_CONTROL } from "../../../lib/access";
import { backendFetch } from "../../../lib/backend";
import { SERVER_HOST } from "../../../lib/util";
import { isMusicBrainzID, normalizeDiscovery, normalizeRecordingMetadata } from "../../../lib/creator-catalog";

export default async function handler(req: NextApiRequest,res: NextApiResponse) {
  res.setHeader("Cache-Control",PRIVATE_CACHE_CONTROL);
  if (req.method !== "GET") return res.setHeader("Allow","GET").status(405).json({error:"Method not allowed."});
  try {
    if (!(await getSession(req))?.user?.id) return res.status(401).json({error:"Sign in to explore music."});
    const { mbid, recordings } = req.query;
    let params: URLSearchParams, ids: string[] = [];
    if (isMusicBrainzID(mbid) && recordings === undefined) params = new URLSearchParams({mbid:mbid.toLowerCase()});
    else if (mbid === undefined && typeof recordings === "string" && (ids=recordings.split(",")).length <= 24 && ids.every(isMusicBrainzID)) {
      ids = Array.from(new Set(ids.map(id=>id.toLowerCase()))).sort();
      params = new URLSearchParams({recordings:ids.join(",")});
    } else return res.status(400).json({error:"Check the creator or recording IDs."});
    const response = await backendFetch(`${SERVER_HOST}/creator/discovery?${params}`,{signal:AbortSignal.timeout(6500)});
    if (!response.ok) throw new Error("Discovery unavailable");
    const raw = await response.json();
    return res.json(isMusicBrainzID(mbid) ? {artists:normalizeDiscovery(raw,mbid)} : {metadata:normalizeRecordingMetadata(raw,ids)});
  } catch {
    return res.status(503).json({error:"Extra music details could not be loaded. Please try again."});
  }
}
