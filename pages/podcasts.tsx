import React, { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/router";
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
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [podcasts, setPodcasts] = useState<Podcast[]>([]);
  const [podcastsLoading, setPodcastsLoading] = useState(false);
  const chipsRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("/api/podcasts/categories");
        if (!res.ok) throw new Error("Failed to fetch categories");
        const data: Category[] = await res.json();
        setCategories(data);
        const queryCat = router.query.cat as string | undefined;
        if (queryCat && data.some((c) => c.name === queryCat)) {
          setSelectedCategory(queryCat);
        } else if (data.length > 0) {
          setSelectedCategory(data[0].name);
        }
      } catch (err) {
        console.error("Error fetching podcast categories:", err);
      } finally {
        setCategoriesLoading(false);
      }
    };
    if (router.isReady) fetchCategories();
  }, [router.isReady, router.query.cat]);

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

  // Scroll selected chip into view
  useEffect(() => {
    if (!selectedCategory || !chipsRef.current) return;
    const active = chipsRef.current.querySelector('[data-active="true"]');
    if (active) {
      active.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }, [selectedCategory]);

  return (
    <div className="min-h-screen">
      {/* ── Header ── */}
      <div className="px-4 pt-8 pb-2">
        <div className="relative inline-block">
          <h1 className="font-display text-massive text-phosphor tracking-tight font-bold">
            podcasts
          </h1>
          <div className="absolute -bottom-2 left-0 w-20 h-1 bg-accent rounded-full" />
        </div>
        <p className="font-mono text-sm text-phosphor-dim mt-5 max-w-lg">
          curated shows for music lovers
        </p>
      </div>

      {/* ── Category Chips ── */}
      <div className="pt-6 pb-4">
        {categoriesLoading ? (
          <div className="flex gap-2 overflow-x-auto px-4 scrollbar-hide md:flex-wrap">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="h-9 w-28 flex-shrink-0 rounded-full bg-gradient-to-r from-terminal-border/40 to-terminal-border/20 animate-shimmer"
                style={{
                  animationDelay: `${i * 80}ms`,
                  backgroundSize: '200% 100%',
                }}
              />
            ))}
          </div>
        ) : (
          <div
            ref={chipsRef}
            className="flex gap-2 overflow-x-auto px-4 scrollbar-hide md:flex-wrap snap-x snap-mandatory"
          >
            {categories.map((cat) => {
              const isActive = selectedCategory === cat.name;
              return (
                <button
                  key={cat.name}
                  data-active={isActive}
                  onClick={() => setSelectedCategory(cat.name)}
                  className={`
                    flex-shrink-0 snap-start inline-flex items-center gap-2 px-5 py-2.5 rounded-full
                    font-mono text-xs transition-all duration-300 ease-out
                    border focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2 focus-visible:ring-offset-terminal-bg
                    ${
                      isActive
                        ? "bg-accent text-white border-accent shadow-glow-accent scale-[1.02]"
                        : "bg-terminal-surface border-terminal-border text-phosphor-dim hover:border-phosphor-dim/40 hover:text-phosphor hover:bg-terminal-surface/80 active:scale-95"
                    }
                  `}
                >
                  <span className="font-medium">{cat.name}</span>
                  <span
                    className={`text-[10px] tabular-nums ${
                      isActive
                        ? "text-white/70"
                        : "text-phosphor-dim/40"
                    }`}
                  >
                    {cat.count}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Selected Category Label ── */}
      {selectedCategory && (
        <div className="px-4 pb-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-terminal-border to-transparent" />
          <span className="font-mono text-xs text-accent uppercase tracking-[0.2em] font-medium">
            {selectedCategory}
          </span>
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-terminal-border to-transparent" />
        </div>
      )}

      {/* ── Podcast Grid ── */}
      <div ref={gridRef} className="px-4 pb-16">
        {podcastsLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {[...Array(15)].map((_, i) => (
              <div
                key={i}
                className="flex flex-col rounded-xl border border-terminal-border/60 bg-terminal-surface overflow-hidden"
              >
                <div className="aspect-square bg-gradient-to-br from-terminal-border/30 to-terminal-border/10 animate-shimmer" style={{ backgroundSize: '200% 100%', animationDelay: `${i * 60}ms` }} />
                <div className="p-3.5 space-y-2.5">
                  <div className="h-4 bg-terminal-border/30 rounded-full w-3/4 animate-shimmer" style={{ backgroundSize: '200% 100%', animationDelay: `${i * 60 + 100}ms` }} />
                  <div className="h-3 bg-terminal-border/20 rounded-full w-1/2 animate-shimmer" style={{ backgroundSize: '200% 100%', animationDelay: `${i * 60 + 200}ms` }} />
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
          <div className="py-24 text-center">
            <div className="inline-block p-6 rounded-2xl bg-terminal-surface border border-terminal-border">
              <span className="text-4xl mb-4 block">🎧</span>
              <p className="font-mono text-phosphor-dim text-sm">
                no podcasts found in{" "}
                <span className="text-accent font-semibold">{selectedCategory}</span>
              </p>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default PodcastsPage;
