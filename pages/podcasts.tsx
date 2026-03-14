import React, { useState, useEffect, useCallback } from "react";
import PodcastCard from "@components/PodcastCard";

interface Category {
  name: string;
  count: number;
  previewImage: string | null;
}

interface Podcast {
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

const PodcastsPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [podcasts, setPodcasts] = useState<Podcast[]>([]);
  const [podcastsLoading, setPodcastsLoading] = useState(false);

  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("/api/podcasts/categories");
        if (!res.ok) throw new Error("Failed to fetch categories");
        const data: Category[] = await res.json();
        setCategories(data);
        // Auto-select first category
        if (data.length > 0) {
          setSelectedCategory(data[0].name);
        }
      } catch (err) {
        console.error("Error fetching podcast categories:", err);
      } finally {
        setCategoriesLoading(false);
      }
    };
    fetchCategories();
  }, []);

  // Fetch podcasts when category changes
  const fetchPodcasts = useCallback(async (category: string) => {
    setPodcastsLoading(true);
    setPodcasts([]);
    try {
      const res = await fetch(
        `/api/podcasts/by-category?category=${encodeURIComponent(category)}&limit=50`
      );
      if (!res.ok) throw new Error("Failed to fetch podcasts");
      const data = await res.json();
      setPodcasts(data.podcasts || []);
    } catch (err) {
      console.error("Error fetching podcasts:", err);
    } finally {
      setPodcastsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (selectedCategory) {
      fetchPodcasts(selectedCategory);
    }
  }, [selectedCategory, fetchPodcasts]);

  return (
    <div className="min-h-screen">
      {/* ── Header ── */}
      <div className="px-4 pt-8 pb-2">
        <div className="relative inline-block">
          <h1 className="font-display text-massive text-white tracking-tight">
            podcasts
          </h1>
          <div className="absolute -bottom-1 left-0 w-full h-[3px] bg-gradient-to-r from-accent via-warm to-transparent rounded-full" />
        </div>
        <p className="font-mono text-sm text-phosphor-dim mt-4 max-w-lg">
          curated shows for music lovers
        </p>
      </div>

      {/* ── Category Chips ── */}
      <div className="px-4 pt-6 pb-4">
        {categoriesLoading ? (
          <div className="flex flex-wrap gap-2">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="h-8 w-24 rounded-full bg-terminal-surface animate-pulse"
                style={{ animationDelay: `${i * 50}ms` }}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat.name}
                onClick={() => setSelectedCategory(cat.name)}
                className={`
                  inline-flex items-center gap-2 px-4 py-2 rounded-full
                  font-mono text-xs transition-all duration-300
                  border focus:outline-none focus:ring-1 focus:ring-accent/50
                  ${
                    selectedCategory === cat.name
                      ? "bg-accent/15 border-accent text-accent shadow-glow-accent"
                      : "bg-terminal-surface border-terminal-border text-phosphor-dim hover:border-accent/50 hover:text-phosphor"
                  }
                `}
              >
                <span>{cat.name}</span>
                <span
                  className={`text-[10px] tabular-nums ${
                    selectedCategory === cat.name
                      ? "text-accent/70"
                      : "text-phosphor-dim/50"
                  }`}
                >
                  {cat.count}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── Selected Category Label ── */}
      {selectedCategory && (
        <div className="px-4 pb-4 flex items-center gap-3">
          <div className="h-px flex-1 bg-terminal-border" />
          <span className="font-mono text-xs text-accent uppercase tracking-widest">
            {selectedCategory}
          </span>
          <div className="h-px flex-1 bg-terminal-border" />
        </div>
      )}

      {/* ── Podcast Grid ── */}
      <div className="px-4 pb-16">
        {podcastsLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {[...Array(15)].map((_, i) => (
              <div
                key={i}
                className="flex flex-col rounded-lg border border-terminal-border bg-terminal-surface overflow-hidden animate-pulse"
                style={{ animationDelay: `${i * 40}ms` }}
              >
                <div className="aspect-square bg-terminal-bg" />
                <div className="p-3 space-y-2">
                  <div className="h-4 bg-terminal-bg rounded w-3/4" />
                  <div className="h-3 bg-terminal-bg rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : podcasts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {podcasts.map((podcast, index) => (
              <PodcastCard
                key={podcast.id}
                id={podcast.id}
                name={podcast.name}
                description={podcast.description}
                imageURL={podcast.imageURL}
                externalURL={podcast.externalURL}
                index={index}
              />
            ))}
          </div>
        ) : selectedCategory ? (
          <div className="py-20 text-center">
            <p className="font-mono text-phosphor-dim text-sm">
              no podcasts found in{" "}
              <span className="text-accent">{selectedCategory}</span>
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default PodcastsPage;
