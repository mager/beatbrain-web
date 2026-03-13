import { prisma } from './prisma';

export interface CategoryWithCount {
  name: string;
  count: number;
  previewImage: string | null;
}

export interface Podcast {
  id: number;
  title: string;
  description: string | null;
  coverArtUrl: string | null;
  spotifyUri: string;
  spotifyId: string;
  category: string;
}

export async function getCategories(): Promise<CategoryWithCount[]> {
  const categories = await prisma.podcast.groupBy({
    by: ['category'],
    _count: {
      category: true,
    },
  });

  // Get a preview image for each category
  const categoriesWithPreview = await Promise.all(
    categories.map(async (cat) => {
      const preview = await prisma.podcast.findFirst({
        where: { category: cat.category },
        select: { coverArtUrl: true },
      });

      return {
        name: cat.category,
        count: cat._count.category,
        previewImage: preview?.coverArtUrl || null,
      };
    })
  );

  // Sort by count descending
  return categoriesWithPreview.sort((a, b) => b.count - a.count);
}

export async function getPodcastsByCategory(
  category: string,
  limit: number = 50,
  offset: number = 0
): Promise<Podcast[]> {
  return prisma.podcast.findMany({
    where: { category },
    orderBy: { createdAt: 'desc' },
    take: limit,
    skip: offset,
  });
}

export async function getCategoryCount(category: string): Promise<number> {
  return prisma.podcast.count({
    where: { category },
  });
}
