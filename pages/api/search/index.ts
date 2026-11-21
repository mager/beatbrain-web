import type { NextApiRequest, NextApiResponse } from "next";
import { SERVER_HOST } from "@util";
import { backendFetch } from "../../../lib/backend";
import { getSession } from "../../../lib/auth-api";
import { PRIVATE_CACHE_CONTROL } from "../../../lib/access";
import prisma from "../../../lib/prisma";
import type { SearchArtist, SearchPerson, SearchTrack } from "../../../lib/search-types";
import { searchArtist, searchTrack } from "../../../lib/artist";

export const config = { api: { bodyParser: { sizeLimit: "4kb" } } };

async function music(query: string, limit: number, all = false): Promise<{ results: SearchTrack[]; artists: SearchArtist[] }> {
  const response = await backendFetch(`${SERVER_HOST}/spotify/search`, {
    method: "POST",
    body: JSON.stringify({ query, limit, ...(all ? { type: "all" } : {}) }),
    headers: { "Content-Type": "application/json" },
  });
  if (!response.ok) throw new Error("Music search unavailable");
  const data = await response.json();
  if (!Array.isArray(data?.results) || (all && !Array.isArray(data?.artists))) throw new Error("Invalid search response");
  return {
    results: data.results.flatMap((item: any) => {
      const track = searchTrack(item);
      if (!track) return [];
      return [{
        ...track,
        album: typeof item.album === "string" ? item.album : undefined,
        album_type: typeof item.album_type === "string" ? item.album_type : undefined,
        release_date: typeof item.release_date === "string" ? item.release_date : undefined,
        explicit: typeof item.explicit === "boolean" ? item.explicit : undefined,
      }];
    }).slice(0, limit),
    artists: all ? data.artists.map(searchArtist).filter(Boolean).slice(0, limit) : [],
  };
}

async function people(query: string): Promise<SearchPerson[]> {
  const term = query.replace(/^@/, "").toLowerCase();
  if (!term) return [];
  const matches = await prisma.user.findMany({
    where: { username: { not: null }, OR: [
      { username: { contains: term, mode: "insensitive" } },
      { name: { contains: term, mode: "insensitive" } },
    ] },
    select: { username: true, name: true, image: true },
    orderBy: { username: "asc" },
    take: 30,
  });
  const rank = (person: typeof matches[number]) => {
    const handle = person.username.toLowerCase(), name = person.name.toLowerCase();
    return handle === term ? 0 : name === term ? 1 : handle.startsWith(term) ? 2 : name.startsWith(term) ? 3 : 4;
  };
  return matches.sort((a, b) => rank(a) - rank(b) || a.username.localeCompare(b.username)).slice(0, 5);
}

export default async function handle(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader("Cache-Control", PRIVATE_CACHE_CONTROL);
  if (req.method !== "POST") return res.setHeader("Allow", "POST").status(405).json({ error: "Method not allowed." });
  try {
    const session = await getSession(req);
    if (!session?.user?.id) return res.status(401).json({ error: "Sign in to search." });
    const query = typeof req.body?.query === "string" ? req.body.query.trim() : "";
    const scope = req.body?.scope ?? "music";
    if (!["music", "all"].includes(scope) || query.length < (scope === "all" ? 2 : 1) || query.length > 200)
      return res.status(400).json({ error: "Enter a valid search query (up to 200 characters)." });
    // Keep the existing track-only contract for the post composer.
    if (scope === "music") {
      try { return res.json({ results: (await music(query, 10)).results }); }
      catch { return res.status(502).json({ error: "Track search is unavailable. Please try again." }); }
    }
    const [tracks, members] = await Promise.allSettled([music(query, 6, true), people(query)]);
    if (tracks.status === "rejected" && members.status === "rejected")
      return res.status(503).json({ error: "Search is unavailable. Please try again." });
    return res.json({
      results: tracks.status === "fulfilled" ? tracks.value.results : [],
      artists: tracks.status === "fulfilled" ? tracks.value.artists : [],
      people: members.status === "fulfilled" ? members.value : [],
      unavailable: [tracks.status === "rejected" ? "music" : null, members.status === "rejected" ? "people" : null].filter(Boolean),
    });
  } catch {
    return res.status(503).json({ error: "Search is unavailable. Please try again." });
  }
}
