export type SearchTrack = { id: string; name: string; artist: string; thumb: string | null };
export type SearchPerson = { username: string; name: string; image: string | null };
export type SearchPayload = {
  results: SearchTrack[];
  people: SearchPerson[];
  unavailable: Array<"music" | "people">;
};
