import React, { useState, useEffect, useMemo } from "react";
import type { PostProps } from "@types";
import Link from "next/link";
import Image from "next/image";
import { useAppContext } from "../context/AppContext";

interface PodcastCategory {
  name: string;
  count: number;
  previewImage: string | null;
}

const Home: React.FC = () => {
  const { state } = useAppContext();
  const { tracks, tracksLoading } = state;

  const [feed, setFeed] = useState<PostProps[]>([]);
  const [feedLoading, setFeedLoading] = useState(true);
  const [podcastCategories, setPodcastCategories] = useState<PodcastCategory[]>([]);
  const [podcastsLoading, setPodcastsLoading] = useState(true);

  // Discover tracks — deduped
  const visibleTracks = useMemo(() => {
    const seen = new Set<string>();
    return tracks.filter((t) => {
      if (!t.image || !t.source_id) return false;
      if (seen.has(t.image)) return false;
      seen.add(t.image);
      return true;
    });
  }, [tracks]);

  // Feed tracks — deduped
  const feedTracks = useMemo(() => {
    const seen = new Set<string>();
    return feed.filter((p) => {
      const img = p.track?.image;
      const sid = p.track?.sourceId;
      if (!img || !sid) return false;
      if (seen.has(img)) return false;
      seen.add(img);
      return true;
    });
  }, [feed]);

  useEffect(() => {
    const fetchFeed = async () => {
      try {
        const res = await fetch(`/api/feed?limit=50`);
        if (!res.ok) return;
        setFeed(await res.json());
      } catch (err) {
        console.error("Error fetching feed:", err);
      } finally {
        setFeedLoading(false);
      }
    };
    fetchFeed();
  }, []);

  useEffect(() => {
    const fetchPodcasts = async () => {
      try {
        const res = await fetch("/api/podcasts/categories");
        if (!res.ok) return;
        const data: PodcastCategory[] = await res.json();
        setPodcastCategories(data.slice(0, 12)); // Top 12 for preview
      } catch (err) {
        console.error("Error fetching podcast categories:", err);
      } finally {
        setPodcastsLoading(false);
      }
    };
    fetchPodcasts();
  }, []);

  const totalPodcasts = podcastCategories.reduce((sum, c) => sum + c.count, 0);

  return (
    <div className="min-h-screen">

      {/* ═══════════════════════════════════════════
          DISCOVER SECTION
          ═══════════════════════════════════════════ */}
      <div className="px-4 pt-8 pb-5 flex items-end justify-between">
        <div>
          <div className="relative inline-block">
            <h2 className="font-display text-massive text-white tracking-tight">
              discover
            </h2>
            <div className="absolute -inset-8 -z-10 bg-accent/[0.04] blur-3xl rounded-full" />
            <div className="absolute -bottom-1 left-0 w-full h-[3px] bg-gradient-to-r from-accent via-warm to-transparent rounded-full" />
          </div>
          <p className="font-mono text-sm text-phosphor-dim mt-4">
            {visibleTracks.length > 0 && (
              <>
                <span className="text-accent font-semibold text-base tabular-nums">{visibleTracks.length}</span>
                <span className="mx-2">hot tracks</span>
              </>
            )}
          </p>
        </div>
        <Link
          href="/discover"
          className="font-mono text-sm text-phosphor-dim hover:text-accent transition-colors duration-300 mb-2 shrink-0"
        >
          view all →
        </Link>
      </div>

      {/* Discover Preview Grid — 2 rows max */}
      {tracksLoading ? (
        <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-[2px]">
          {[...Array(20)].map((_, i) => (
            <div key={i} className="aspect-square bg-terminal-surface animate-pulse" style={{ animationDelay: `${i * 15}ms` }} />
          ))}
        </div>
      ) : visibleTracks.length > 0 ? (
        <div className="relative">
          <div className="absolute inset-0 pointer-events-none z-20 crt-scanlines" />
          <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-[2px]">
            {visibleTracks.slice(0, 20).map((track, index) => (
              <Link
                key={track.source_id}
                href={`/ext/spotify/${track.source_id}`}
                className="group relative aspect-square overflow-hidden bg-terminal-surface opacity-0 animate-fadeUp"
                style={{ animationDelay: `${index * 25}ms`, animationFillMode: "forwards" }}
              >
                <Image
                  src={track.image}
                  alt={`${track.artist} - ${track.name}`}
                  fill
                  sizes="(max-width: 640px) 25vw, (max-width: 768px) 20vw, (max-width: 1024px) 16.7vw, 12.5vw"
                  className="object-cover transition-all duration-500 ease-out group-hover:scale-[1.12] group-hover:brightness-[0.25]"
                  unoptimized
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ring-1 ring-inset ring-accent/30" />
                <div className="absolute inset-0 flex flex-col justify-end p-2.5 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0 z-10">
                  <p className="font-mono text-xs text-white leading-snug line-clamp-2 drop-shadow-lg font-medium">{track.name}</p>
                  <p className="font-mono text-[11px] text-white/60 leading-snug line-clamp-1 mt-0.5 drop-shadow-lg">{track.artist}</p>
                </div>
              </Link>
            ))}
          </div>
          {/* Fade-out bottom edge */}
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-terminal-bg to-transparent z-30 pointer-events-none" />
        </div>
      ) : null}

      {/* ═══════════════════════════════════════════
          SECTION DIVIDER
          ═══════════════════════════════════════════ */}
      <div className="relative py-12">
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-px bg-gradient-to-r from-transparent via-terminal-border-bright to-transparent" />
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-px bg-gradient-to-r from-transparent via-accent/15 to-transparent blur-sm" />
      </div>

      {/* ═══════════════════════════════════════════
          FEED SECTION
          ═══════════════════════════════════════════ */}
      <div className="px-4 pb-5 flex items-end justify-between">
        <div>
          <div className="relative inline-block">
            <h2 className="font-display text-massive text-white tracking-tight">
              feed
            </h2>
            <div className="absolute -inset-8 -z-10 bg-cool/[0.03] blur-3xl rounded-full" />
            <div className="absolute -bottom-1 left-0 w-full h-[3px] bg-gradient-to-r from-cool via-violet to-transparent rounded-full" />
          </div>
          <p className="font-mono text-sm text-phosphor-dim mt-4">
            latest saves from the community
          </p>
        </div>
        <Link
          href="/feed"
          className="font-mono text-sm text-phosphor-dim hover:text-accent transition-colors duration-300 mb-2 shrink-0"
        >
          view all →
        </Link>
      </div>

      {/* Feed Preview Grid — 2 rows max */}
      {feedLoading ? (
        <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-[2px]">
          {[...Array(20)].map((_, i) => (
            <div key={i} className="aspect-square bg-terminal-surface animate-pulse" style={{ animationDelay: `${i * 20}ms` }} />
          ))}
        </div>
      ) : feedTracks.length > 0 ? (
        <div className="relative">
          <div className="absolute inset-0 pointer-events-none z-20 crt-scanlines" />
          <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-[2px]">
            {feedTracks.slice(0, 20).map((post, index) => (
              <Link
                key={post.id}
                href={`/ext/spotify/${post.track?.sourceId}`}
                className="group relative aspect-square overflow-hidden bg-terminal-surface opacity-0 animate-fadeUp"
                style={{ animationDelay: `${index * 25}ms`, animationFillMode: "forwards" }}
              >
                <Image
                  src={post.track!.image}
                  alt={`${post.track?.artist} - ${post.track?.title}`}
                  fill
                  sizes="(max-width: 640px) 25vw, (max-width: 768px) 20vw, (max-width: 1024px) 16.7vw, 12.5vw"
                  className="object-cover transition-all duration-500 ease-out group-hover:scale-[1.12] group-hover:brightness-[0.25]"
                  unoptimized
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ring-1 ring-inset ring-accent/30" />
                <div className="absolute inset-0 flex flex-col justify-end p-2.5 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0 z-10">
                  <p className="font-mono text-xs text-white leading-snug line-clamp-2 drop-shadow-lg font-medium">{post.track?.title}</p>
                  <p className="font-mono text-[11px] text-white/60 leading-snug line-clamp-1 mt-0.5 drop-shadow-lg">{post.track?.artist}</p>
                  <p className="font-mono text-[10px] text-accent/60 line-clamp-1 mt-0.5">
                    {post.author?.username ? `@${post.author.username}` : post.author?.name || ""}
                  </p>
                </div>
              </Link>
            ))}
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-terminal-bg to-transparent z-30 pointer-events-none" />
        </div>
      ) : (
        <div className="py-12 text-center font-mono">
          <p className="text-phosphor-dim text-sm">no activity yet</p>
        </div>
      )}

      {/* ═══════════════════════════════════════════
          SECTION DIVIDER
          ═══════════════════════════════════════════ */}
      <div className="relative py-12">
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-px bg-gradient-to-r from-transparent via-terminal-border-bright to-transparent" />
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-px bg-gradient-to-r from-transparent via-mint/15 to-transparent blur-sm" />
      </div>

      {/* ═══════════════════════════════════════════
          PODCASTS SECTION
          ═══════════════════════════════════════════ */}
      <div className="px-4 pb-5 flex items-end justify-between">
        <div>
          <div className="relative inline-block">
            <h2 className="font-display text-massive text-white tracking-tight">
              podcasts
            </h2>
            <div className="absolute -inset-8 -z-10 bg-mint/[0.03] blur-3xl rounded-full" />
            <div className="absolute -bottom-1 left-0 w-full h-[3px] bg-gradient-to-r from-mint via-cool to-transparent rounded-full" />
          </div>
          <p className="font-mono text-sm text-phosphor-dim mt-4">
            {podcastCategories.length > 0 && (
              <>
                <span className="text-mint font-semibold text-base tabular-nums">{totalPodcasts}+</span>
                <span className="mx-2">shows across {podcastCategories.length} categories</span>
              </>
            )}
            {podcastCategories.length === 0 && !podcastsLoading && "curated shows for music lovers"}
          </p>
        </div>
        <Link
          href="/podcasts"
          className="font-mono text-sm text-phosphor-dim hover:text-accent transition-colors duration-300 mb-2 shrink-0"
        >
          browse all →
        </Link>
      </div>

      {/* Podcast Category Cards */}
      <div className="px-4 pb-20">
        {podcastsLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {[...Array(12)].map((_, i) => (
              <div
                key={i}
                className="aspect-[4/3] rounded-lg bg-terminal-surface animate-pulse"
                style={{ animationDelay: `${i * 40}ms` }}
              />
            ))}
          </div>
        ) : podcastCategories.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {podcastCategories.map((cat, index) => (
              <Link
                key={cat.name}
                href={`/podcasts?cat=${encodeURIComponent(cat.name)}`}
                className="group relative aspect-[4/3] rounded-lg overflow-hidden bg-terminal-surface border border-terminal-border hover:border-mint/40 transition-all duration-300 opacity-0 animate-fadeUp"
                style={{ animationDelay: `${index * 40}ms`, animationFillMode: "forwards" }}
              >
                {/* Background image */}
                {cat.previewImage && (
                  <Image
                    src={cat.previewImage}
                    alt={cat.name}
                    fill
                    className="object-cover brightness-[0.3] group-hover:brightness-[0.4] group-hover:scale-105 transition-all duration-500"
                    unoptimized
                  />
                )}
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                {/* Content */}
                <div className="absolute inset-0 flex flex-col justify-end p-3 z-10">
                  <p className="font-display text-sm sm:text-base text-white font-medium leading-tight group-hover:text-mint transition-colors duration-300">
                    {cat.name}
                  </p>
                  <p className="font-mono text-[10px] text-white/40 mt-1 tabular-nums">
                    {cat.count} shows
                  </p>
                </div>
                {/* Hover glow */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ring-1 ring-inset ring-mint/20" />
              </Link>
            ))}
          </div>
        ) : (
          <div className="py-12 text-center font-mono">
            <p className="text-phosphor-dim text-sm">no podcasts yet</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
