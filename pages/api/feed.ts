import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const limit = Math.min(Number(req.query.limit) || 8, 20);

  try {
    const feed = await prisma.post.findMany({
      include: {
        author: { select: { name: true, image: true, username: true } },
        track: { select: { artist: true, title: true, sourceId: true, image: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    res.json(
      feed.map((post) => ({
        ...post,
        createdAt: post.createdAt.toISOString(),
      }))
    );
  } catch (error) {
    console.error('Feed API error:', error);
    res.status(500).json({ error: 'Failed to fetch feed' });
  }
}
