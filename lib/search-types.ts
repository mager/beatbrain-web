export type SearchRelease = {
  album?: string | null;
  album_type?: string | null;
  release_date?: string | null;
  explicit?: boolean;
};

export type SearchTrack = SearchRelease & {
  id: string;
  name: string;
  artist: string;
  thumb: string | null;
};
export type SearchPerson = { username: string; name: string; image: string | null };
export type SearchArtist = { id: string; name: string; image: string | null; url: string };
export type SearchPayload = {
  results: SearchTrack[];
  artists: SearchArtist[];
  people: SearchPerson[];
  unavailable: Array<"music" | "people">;
};
