import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Layout from '@components/Layout';
import CategoryCard from '@components/CategoryCard';

interface Category {
  name: string;
  count: number;
  previewImage: string | null;
}

const CategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch('/api/podcasts/categories');
        if (!res.ok) throw new Error('Failed to fetch');
        const data = await res.json();
        setCategories(data);
      } catch (err) {
        console.error('Error fetching categories:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return (
    <Layout>
      <Head>
        <title>Categories | BeatBrain</title>
        <meta name="description" content="Browse podcast categories on BeatBrain" />
      </Head>

      <div className="min-h-screen px-4 pt-24 pb-16">
        {/* Header */}
        <div className="max-w-6xl mx-auto mb-8">
          <h1 className="font-display text-3xl md:text-4xl text-white tracking-tight">
            podcast categories
          </h1>
          <p className="font-mono text-sm text-phosphor mt-3 max-w-2xl">
            Explore brain-focused podcasts across cognitive science, philosophy, 
            productivity, behavioral economics, and more.
          </p>
          
          {!loading && categories.length > 0 && (
            <p className="font-mono text-xs text-phosphor-dim mt-4">
              <span className="text-accent font-semibold">{categories.length}</span>
              <span className="ml-1">categories</span>
              <span className="mx-2 text-terminal-border">|</span>
              <span className="text-accent font-semibold">
                {categories.reduce((acc, cat) => acc + cat.count, 0)}
              </span>
              <span className="ml-1">total podcasts</span>
            </p>
          )}
        </div>

        {/* Categories Grid */}
        <div className="max-w-6xl mx-auto">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {[...Array(12)].map((_, i) => (
                <div
                  key={i}
                  className="h-24 rounded-lg bg-terminal-surface animate-pulse border border-terminal-border/50"
                  style={{ animationDelay: `${i * 50}ms` }}
                />
              ))}
            </div>
          ) : categories.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {categories.map((category, index) => (
                <CategoryCard
                  key={category.name}
                  name={category.name}
                  count={category.count}
                  previewImage={category.previewImage}
                  index={index}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <p className="font-mono text-phosphor-dim text-sm">
                No categories found. Run the ingestion script to populate podcasts.
              </p>
              <code className="inline-block mt-4 px-4 py-2 bg-terminal-surface rounded font-mono text-xs text-phosphor">
                python scripts/ingest_podcasts.py
              </code>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default CategoriesPage;
