import type { Creator, CreatorCatalogEntry, CreditArtist } from "./types";

export const isMusicBrainzID = (value: unknown): value is string => typeof value === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
export function isCreatorResponse(value: any): value is Creator {
  const text = (v:unknown): v is string => typeof v === "string";
  return !!value && isMusicBrainzID(value.id) && text(value.name) && !!value.name.trim()
    && Array.isArray(value.catalog) && value.catalog.every(e=>e && isMusicBrainzID(e.id) && ["recording","release","work"].includes(e.kind) && text(e.title) && !!e.title.trim()
      && Array.isArray(e.roles) && e.roles.every(text) && Array.isArray(e.artists) && e.artists.every(a=>a && text(a.name) && (!a.id || isMusicBrainzID(a.id)))
      && (e.date === undefined || text(e.date)) && (e.disambiguation === undefined || text(e.disambiguation)))
    && Array.isArray(value.connections) && value.connections.every(c=>c && isMusicBrainzID(c.id) && text(c.name) && text(c.relation))
    && (value.genres === undefined || (Array.isArray(value.genres) && value.genres.every(text)))
    && (value.links === undefined || (Array.isArray(value.links) && value.links.every(l=>l && text(l.url) && text(l.type))));
}
export function displayCreditRole(role:string) {
  if (role === "vocal") return "vocals";
  return role.replace(/\s+instrument$/, "").replace(/(vocals.*) vocal$/, "$1");
}
export const catalogRoles = ["all", "production", "writing", "performance", "remix", "other"] as const;
export type CatalogRole = typeof catalogRoles[number];
export const roleLabels: Record<CatalogRole, string> = { all: "All roles", production: "Production", writing: "Writing", performance: "Performance", remix: "Remixes", other: "Other credits" };
export function roleCategory(role: string): CatalogRole {
  const r = role.toLowerCase();
  if (/\b(remixer|remix)\b/.test(r)) return "remix";
  if (/\b(producer|production)\b/.test(r)) return "production";
  if (/\b(writer|composer|lyricist|librettist|arranger|orchestrator)\b/.test(r)) return "writing";
  if (/\b(vocal|vocals|instrument|performer|conductor|performing)\b/.test(r)) return "performance";
  return "other";
}
export function filterCatalog(entries: CreatorCatalogEntry[], filters: {kind: string; role: string; q: string; sort: string}) {
  const q = filters.q.trim().toLocaleLowerCase();
  return entries.filter(entry => (filters.kind === "all" || entry.kind === filters.kind)
    && (filters.role === "all" || entry.roles.some(role => roleCategory(role) === filters.role))
    && (!q || [entry.title, entry.disambiguation, ...entry.artists.map(a => a.name), ...entry.roles].join(" ").toLocaleLowerCase().includes(q)))
    .sort((a,b) => {
      if (filters.sort === "newest" && (a.date || "") !== (b.date || "")) return (b.date || "").localeCompare(a.date || "");
      if (filters.sort === "artist") {const order=(a.artists[0]?.name || "\uffff").localeCompare(b.artists[0]?.name || "\uffff");if(order) return order;}
      return a.title.localeCompare(b.title) || a.kind.localeCompare(b.kind) || a.id.localeCompare(b.id);
    });
}
export function catalogHref(entry: CreatorCatalogEntry) {
  return entry.kind === "recording" ? `/song/${entry.id}` : `https://musicbrainz.org/${entry.kind}/${entry.id}`;
}
export type RelatedArtist = {id: string; name: string; recordingId: string};
export function normalizeDiscovery(raw: unknown, seed: string): RelatedArtist[] {
  if (!raw || typeof raw !== "object" || Array.isArray(raw) || "error" in raw) throw new Error("Invalid discovery response");
  const found = new Map<string,RelatedArtist>();
  for (const [id,rows] of Object.entries(raw)) {
    if (!isMusicBrainzID(id) || id.toLowerCase() === seed.toLowerCase() || !Array.isArray(rows)) continue;
    for (const row of rows) {
      if (row?.similar_artist_mbid?.toLowerCase() === id.toLowerCase() && typeof row.similar_artist_name === "string" && row.similar_artist_name.trim() && isMusicBrainzID(row.recording_mbid)) {
        found.set(id.toLowerCase(),{id:id.toLowerCase(),name:row.similar_artist_name,recordingId:row.recording_mbid.toLowerCase()});break;
      }
    }
    if (found.size === 6) break;
  }
  return Array.from(found.values());
}
export type RecordingMetadata = {image?: string; album?: string; date?: string; artists: CreditArtist[]};
export function withRecordingMetadata(entries: CreatorCatalogEntry[], metadata: Record<string,RecordingMetadata>): CreatorCatalogEntry[] {
  return entries.map(entry=>{
    const extra=entry.kind === "recording" ? metadata[entry.id] : undefined;
    return extra ? {...entry, artists:entry.artists.length ? entry.artists : extra.artists, date:entry.date || extra.date} : entry;
  });
}
export function normalizeRecordingMetadata(raw: unknown, requested: string[]): Record<string,RecordingMetadata> {
  if (!raw || typeof raw !== "object" || Array.isArray(raw) || "error" in raw) throw new Error("Invalid music metadata");
  const result: Record<string,RecordingMetadata> = {};
  for (const id of requested) {
    const item = (raw as Record<string,any>)[id];
    if (!item || typeof item !== "object" || Array.isArray(item)) continue;
    const release = item.release;
    const artists:CreditArtist[] = Array.isArray(item.artist?.artists) ? item.artist.artists.filter(a=>typeof a?.name === "string" && a.name.trim() && isMusicBrainzID(a.artist_mbid)).map(a=>({id:a.artist_mbid,name:a.name})) : [];
    result[id] = {artists};
    if (isMusicBrainzID(release?.caa_release_mbid) && Number.isSafeInteger(release?.caa_id) && release.caa_id > 0) result[id].image = `https://coverartarchive.org/release/${release.caa_release_mbid}/${release.caa_id}-250.jpg`;
    if (typeof release?.name === "string") result[id].album = release.name;
    if (typeof item.recording?.first_release_date === "string" && /^\d{4}(-\d{2}){0,2}$/.test(item.recording.first_release_date)) result[id].date = item.recording.first_release_date;
  }
  return result;
}
