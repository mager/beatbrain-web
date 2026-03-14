import type { NextApiRequest, NextApiResponse } from 'next';
import { getPodcastsByCategory } from '../../../lib/podcasts';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { category, limit = '50' } = req.query;

  if (!category || typeof category !== 'string') {
    return res.status(400).json({ error: 'Category parameter is required' });
  }

  try {
    const podcasts = await getPodcastsByCategory(category, parseInt(limit as string, 10));

    res.status(200).json({
      podcasts,
      total: podcasts.length,
      category,
    });
  } catch (error) {
    console.error('Error fetching podcasts by category:', error);
    res.status(500).json({ error: 'Failed to fetch podcasts' });
  }
}
