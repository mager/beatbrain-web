import type { SearchArtist, SearchTrack } from "./search-types";

export type ArtistSection = "all" | "songs" | "releases";
export type ArtistTrack = SearchTrack & { album_id: string; album_name: string; release_date: string };
export type ArtistAlbum = { id: string; name: string; image: string | null; url: string; release_date: string; album_type: string; album_group: string };
export type ArtistPayload = {
  artist: SearchArtist & { genres: string[] };
  tracks: ArtistTrack[];
  albums: ArtistAlbum[];
  next_cursor: string | null;
  next_release_offset: number | null;
  release_total: number;
  scanned_releases: number;
  next_offset: null;
  unavailable: Array<"tracks" | "albums">;
};

const catalogLimit = 1_000_000;
export function validCatalogCursor(value: unknown): value is string {
  return typeof value === "string" && /^(0|[1-9]\d{0,6})\.(0|[1-9]\d{0,6})$/.test(value) &&
    value.split(".").every(part => Number(part) <= catalogLimit);
}
function compareCursor(a: string, b: string): number {
  const left = a.split(".").map(Number), right = b.split(".").map(Number);
  return left[0] - right[0] || left[1] - right[1];
}
const catalogNumber = (value: unknown): value is number => Number.isInteger(value) && Number(value) >= 0 && Number(value) <= catalogLimit;

export function validSpotifyId(value: unknown): value is string {
  return typeof value === "string" && /^[A-Za-z0-9]{22}$/.test(value);
}
export function spotifyImage(value: unknown): string | null {
  return typeof value === "string" && /^https:\/\/i\.scdn\.co\/image\/[A-Za-z0-9]+$/.test(value) ? value : null;
}
export function searchArtist(value: any): SearchArtist | null {
  if (!validSpotifyId(value?.id) || typeof value.name !== "string" || !value.name.trim()) return null;
  return { id: value.id, name: value.name, image: spotifyImage(value.image), url: `https://open.spotify.com/artist/${value.id}` };
}
export function searchTrack(value: any): SearchTrack | null {
  if (!validSpotifyId(value?.id) || typeof value.name !== "string" || typeof value.artist !== "string") return null;
  return { id: value.id, name: value.name, artist: value.artist, thumb: spotifyImage(value.thumb) };
}

export function parseArtistPayload(value: any, id: string, context: { section?: ArtistSection; cursor?: string; offset?: number } = {}): ArtistPayload | null {
  const artist = searchArtist(value?.artist);
  const cursor = context.cursor || "0.0", offset = context.offset || 0;
  if (!artist || artist.id !== id || !Array.isArray(value.tracks) || value.tracks.length > 24 ||
      !Array.isArray(value.albums) || value.albums.length > 24 || !Array.isArray(value.unavailable) ||
      value.unavailable.some((item: unknown) => item !== "tracks" && item !== "albums") ||
      !catalogNumber(value.release_total) || !catalogNumber(value.scanned_releases) || value.scanned_releases > value.release_total) return null;
  if (value.next_cursor !== null && (!validCatalogCursor(value.next_cursor) ||
      compareCursor(value.next_cursor, cursor) < 0 ||
      (compareCursor(value.next_cursor, cursor) === 0 && !value.unavailable.includes("tracks")))) return null;
  if (value.next_release_offset !== null && (!catalogNumber(value.next_release_offset) ||
      value.next_release_offset < offset || (value.next_release_offset > value.release_total && !value.unavailable.includes("albums")) ||
      (value.next_release_offset === offset && !value.unavailable.includes("albums")))) return null;
  const tracks = value.tracks.flatMap((track: any) => {
    const parsed = searchTrack(track);
    return parsed && validSpotifyId(track.album_id) && typeof track.album_name === "string"
      ? [{ ...parsed, album_id: track.album_id, album_name: track.album_name,
          release_date: typeof track.release_date === "string" ? track.release_date : "" }] : [];
  });
  const albums = value.albums.filter((album: any) => validSpotifyId(album?.id) && typeof album.name === "string")
    .map((album: any) => ({
      id: album.id, name: album.name, image: spotifyImage(album.image), url: `https://open.spotify.com/album/${album.id}`,
      release_date: typeof album.release_date === "string" ? album.release_date : "",
      album_type: typeof album.album_type === "string" ? album.album_type : "",
      album_group: typeof album.album_group === "string" ? album.album_group : "",
    }));
  return { artist: { ...artist, genres: Array.isArray(value.artist.genres) ? value.artist.genres.filter((genre: unknown) => typeof genre === "string").slice(0, 20) : [] },
    tracks, albums, next_cursor: value.next_cursor, next_release_offset: value.next_release_offset,
    release_total: value.release_total, scanned_releases: value.scanned_releases, next_offset: null,
    unavailable: Array.from(new Set(value.unavailable)) as ArtistPayload["unavailable"] };
}
