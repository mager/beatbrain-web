import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Layout from '@components/Layout';
import PodcastCard from '@components/PodcastCard';

interface Podcast {
  id: number;
  title: string;
  description: string | null;
  coverArtUrl: string | null;
  spotifyUri: string;
  spotifyId: string;
  category: string;
}

interface CategoryData {
  podcasts: Podcast[];
  total: number;
  category: string;
}

const CategoryPage: React.FC = () => {
  const router = useRouter();
  const { category: categoryQuery } = router.query;
  
  const [data, setData] = useState<CategoryData | null>(null);
  const [loading, setLoading] = useState(true);

  const categoryName = typeof categoryQuery === 'string' 
    ? categoryQuery 
    : '';

  useEffect(() => {
    if (!categoryName) return;

    const fetchPodcasts = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/podcasts/by-category?category=${encodeURIComponent(categoryName)}&limit=50`
        );
        if (!res.ok) throw new Error('Failed to fetch');
        const result = await res.json();
        setData(result);
      } catch (err) {
        console.error('Error fetching podcasts:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPodcasts();
  }, [categoryName]);

  return (
    <Layout>
      <Head>
        <title>{categoryName ? `${categoryName} | BeatBrain` : 'Category | BeatBrain'}</title>
        <meta name="description" content={`${categoryName} podcasts on BeatBrain`} />
      </Head>

      <div className="min-h-screen px-4 pt-24 pb-16">
        {/* Back Link */}
        <div className="max-w-6xl mx-auto mb-6">
          <Link
            href="/categories"
            className="inline-flex items-center gap-2 font-mono text-xs text-phosphor hover:text-accent transition-colors duration-300"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m12 19-7-7 7-7" />
              <path d="M19 12H5" />
            </svg>
            all categories
          </Link>
        </div>

        {/* Header */}
        <div className="max-w-6xl mx-auto mb-8">
          {loading ? (
            <>
              <div className="h-10 w-64 bg-terminal-surface animate-pulse rounded" />
              <div className="h-4 w-32 bg-terminal-surface animate-pulse rounded mt-3" />
            </>
          ) : (
            <>
              <h1 className="font-display text-3xl md:text-4xl text-white tracking-tight">
                {data?.category || categoryName}
              </h1>
              {data && (
                <p className="font-mono text-sm text-phosphor mt-3">
                  <span className="text-accent font-semibold">{data.total}</span>
                  <span className="ml-1">podcasts</span>
                </p>
              )}
            </>
          )}
        </div>

        {/* Podcasts Grid */}
        <div className="max-w-6xl mx-auto">
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {[...Array(12)].map((_, i) => (
                <div
                  key={i}
                  className="aspect-[3/4] rounded-lg bg-terminal-surface animate-pulse border border-terminal-border/50"
                  style={{ animationDelay: `${i * 50}ms` }}
                />
              ))}
            </div>
          ) : data?.podcasts && data.podcasts.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {data.podcasts.map((podcast, index) => (
                <PodcastCard
                  key={podcast.id}
                  id={podcast.id}
                  title={podcast.title}
                  description={podcast.description}
                  coverArtUrl={podcast.coverArtUrl}
                  spotifyUri={podcast.spotifyUri}
                  index={index}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <p className="font-mono text-phosphor-dim text-sm">
                No podcasts found in this category.
              </p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default CategoryPage;
