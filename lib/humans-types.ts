export type HumansFilter = "everyone" | "following" | "recent";
export type HumansSort = "newest" | "name" | "posts";
export type HumansQuery = { q: string; filter: HumansFilter; sort: HumansSort; page: number };
export type Human = {
  id: string;
  name: string;
  username: string;
  image: string | null;
  createdAt: string;
  postCount: number;
  following: boolean;
  isSelf: boolean;
  posts: { id: number; createdAt: string; track: { title: string; artist: string; image: string } }[];
};
export type HumansResult = { members: Human[]; total: number; hasMore: boolean };
