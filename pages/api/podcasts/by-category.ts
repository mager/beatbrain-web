import type { NextApiRequest, NextApiResponse } from 'next';
import { getPodcastsByCategory, getCategoryCount } from '../../../lib/podcasts';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { category, limit = '50', offset = '0' } = req.query;

  if (!category || typeof category !== 'string') {
    return res.status(400).json({ error: 'Category parameter is required' });
  }

  try {
    const [podcasts, total] = await Promise.all([
      getPodcastsByCategory(
        category,
        parseInt(limit as string, 10),
        parseInt(offset as string, 10)
      ),
      getCategoryCount(category),
    ]);

    res.status(200).json({
      podcasts,
      total,
      category,
    });
  } catch (error) {
    console.error('Error fetching podcasts by category:', error);
    res.status(500).json({ error: 'Failed to fetch podcasts' });
  }
}
