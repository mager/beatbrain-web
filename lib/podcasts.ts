import { SERVER_HOST } from './util';

export interface CategoryWithCount {
  name: string;
  count: number;
  previewImage: string | null;
}

export interface Podcast {
  id: string;
  name: string;
  publisher: string;
  description: string;
  categories: string[];
  imageURL: string;
  episodeCount: number;
  explicit: boolean;
  externalURL: string;
}

export async function getCategories(): Promise<CategoryWithCount[]> {
  const res = await fetch(`${SERVER_HOST}/podcasts/categories`);
  if (!res.ok) throw new Error(`Failed to fetch categories: ${res.status}`);
  const data: Array<{ name: string; count: number; previewImage?: string }> = await res.json();
  return data.map((c) => ({
    name: c.name,
    count: c.count,
    previewImage: c.previewImage ?? null,
  }));
}

export async function getPodcastsByCategory(
  category: string,
  limit: number = 50,
): Promise<Podcast[]> {
  const params = new URLSearchParams({ category, limit: String(limit) });
  const res = await fetch(`${SERVER_HOST}/podcasts?${params}`);
  if (!res.ok) throw new Error(`Failed to fetch podcasts: ${res.status}`);
  return res.json();
}
