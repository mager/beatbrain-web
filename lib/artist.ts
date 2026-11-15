import type { SearchArtist, SearchTrack } from "./search-types";

export type ArtistPayload = {
  artist: SearchArtist & { genres: string[] };
  tracks: SearchTrack[];
  albums: { id: string; name: string; image: string | null; url: string; release_date: string; album_type: string }[];
  next_offset: number | null;
  unavailable: Array<"tracks" | "albums">;
};

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

export function parseArtistPayload(value: any, id: string, offset = 0): ArtistPayload | null {
  const artist = searchArtist(value?.artist);
  if (!artist || artist.id !== id || !Array.isArray(value.tracks) || !Array.isArray(value.albums) ||
      !Array.isArray(value.unavailable) || value.unavailable.some((item: unknown) => item !== "tracks" && item !== "albums") ||
      !(value.next_offset === null || (Number.isInteger(value.next_offset) && value.next_offset > offset && value.next_offset <= 990))) return null;
  const tracks = value.tracks.map(searchTrack).filter(Boolean).slice(0, 10) as SearchTrack[];
  const albums = value.albums.filter((album: any) => validSpotifyId(album?.id) && typeof album.name === "string")
    .slice(0, 10).map((album: any) => ({
      id: album.id, name: album.name, image: spotifyImage(album.image), url: `https://open.spotify.com/album/${album.id}`,
      release_date: typeof album.release_date === "string" ? album.release_date : "",
      album_type: typeof album.album_type === "string" ? album.album_type : "",
    }));
  return { artist: { ...artist, genres: Array.isArray(value.artist.genres) ? value.artist.genres.filter((genre: unknown) => typeof genre === "string").slice(0, 20) : [] },
    tracks, albums, next_offset: value.next_offset, unavailable: Array.from(new Set(value.unavailable)) as ArtistPayload["unavailable"] };
}
