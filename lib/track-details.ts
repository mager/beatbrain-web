import type { TrackMeta } from "./types";
export function trackFacts(
  meta?: TrackMeta | null,
): { label: string; value: string }[] {
  if (!meta) return [];
  const facts: { label: string; value: string }[] = [];
  if (Number.isFinite(meta.duration_ms) && meta.duration_ms > 0) {
    const seconds = Math.floor(meta.duration_ms / 1000);
    facts.push({
      label: "Length",
      value: `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`,
    });
  }
  const keys = [
    "C",
    "C♯",
    "D",
    "D♯",
    "E",
    "F",
    "F♯",
    "G",
    "G♯",
    "A",
    "A♯",
    "B",
  ];
  if (
    Number.isInteger(meta.key) &&
    meta.key >= 0 &&
    meta.key < 12 &&
    (meta.mode === 0 || meta.mode === 1)
  )
    facts.push({
      label: "Key",
      value: `${keys[meta.key]} ${meta.mode === 1 ? "major" : "minor"}`,
    });
  if (Number.isFinite(meta.tempo) && meta.tempo > 0)
    facts.push({ label: "Tempo", value: `${Math.round(meta.tempo)} BPM` });
  if (Number.isInteger(meta.time_signature) && meta.time_signature > 0)
    facts.push({ label: "Time", value: `${meta.time_signature}/4` });
  return facts;
}
export function formatReleaseDate(value?: string): string {
  if (!value || !/^\d{4}(-\d{2})?(-\d{2})?$/.test(value)) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  if (value.length === 4) return value;
  return date.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
    ...(value.length === 10 ? { day: "numeric" as const } : {}),
    timeZone: "UTC",
  });
}
export function trackSourceLinks(track: {
  id?: string;
  links?: { type: string; url: string }[] | null;
}) {
  const result: { label: string; url: string }[] = [];
  if (track.id && /^[a-f0-9]{8}(-[a-f0-9]{4}){3}-[a-f0-9]{12}$/i.test(track.id))
    result.push({
      label: "MusicBrainz",
      url: `https://musicbrainz.org/recording/${track.id}`,
    });
  const names: Record<string, string> = {
    genius: "Genius",
    lastfm: "Last.fm",
    wikipedia: "Wikipedia",
    youtube: "YouTube",
    wikidata: "Wikidata",
  };
  for (const link of track.links || []) {
    try {
      const url = new URL(link.url);
      if (
        url.protocol !== "https:" ||
        url.username ||
        url.password ||
        link.type.toLowerCase() === "spotify" ||
        result.some((item) => item.url === url.href)
      )
        continue;
      result.push({
        label:
          names[link.type.toLowerCase()] || url.hostname.replace(/^www\./, ""),
        url: url.href,
      });
    } catch {
      /* Invalid source URLs are not links. */
    }
  }
  return result.slice(0, 8);
}
