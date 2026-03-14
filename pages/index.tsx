import React, { useState, useEffect, useMemo } from "react";
import type { PostProps } from "@types";
import Link from "next/link";
import Image from "next/image";
import { useAppContext } from "../context/AppContext";

const Home: React.FC = () => {
  const { state } = useAppContext();
  const { tracks, tracksLoading, tracksUpdated } = state;

  const [feed, setFeed] = useState<PostProps[]>([]);
  const [feedLoading, setFeedLoading] = useState(true);

  // Filter to tracks with images + spotify IDs, deduplicate by image URL
  const visibleTracks = useMemo(() => {
    const seen = new Set<string>();
    return tracks.filter((t) => {
      if (!t.image || !t.source_id) return false;
      if (seen.has(t.image)) return false;
      seen.add(t.image);
      return true;
    });
  }, [tracks]);

  // Feed tracks with images, deduped by image
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
        const data = await res.json();
        setFeed(data);
      } catch (err) {
        console.error("Error fetching feed:", err);
      } finally {
        setFeedLoading(false);
      }
    };
    fetchFeed();
  }, []);

  return (
    <div className="min-h-screen">
      {/* ── Discover Header ── */}
      <div className="px-4 pt-8 pb-6">
        <div className="relative inline-block">
          <h1 className="font-display text-massive text-white tracking-tight">
            discover
          </h1>
          {/* Ambient glow behind title */}
          <div className="absolute -inset-8 -z-10 bg-accent/[0.04] blur-3xl rounded-full" />
          <div className="absolute -bottom-1 left-0 w-full h-[3px] bg-gradient-to-r from-accent via-warm to-transparent rounded-full" />
        </div>
        <p className="font-mono text-sm text-phosphor mt-4">
          {visibleTracks.length > 0 && (
            <>
              <span className="text-accent font-semibold text-base tabular-nums">
                {visibleTracks.length}
              </span>
              <span className="mx-2 text-phosphor-dim">hot tracks</span>
            </>
          )}
          {tracksUpdated && (
            <>
              <span className="text-terminal-border-bright mx-2">/</span>
              <span className="tabular-nums text-phosphor-dim">
                {new Date(tracksUpdated).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}
              </span>
            </>
          )}
        </p>
      </div>

      {/* ── Discover Wall ── */}
      {tracksLoading ? (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-[2px]">
          {[...Array(40)].map((_, i) => (
            <div
              key={i}
              className="aspect-square bg-terminal-surface animate-pulse"
              style={{ animationDelay: `${i * 15}ms` }}
            />
          ))}
        </div>
      ) : visibleTracks.length > 0 ? (
        <div className="relative">
          {/* CRT scanline overlay */}
          <div className="absolute inset-0 pointer-events-none z-20 crt-scanlines" />
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-[2px]">
            {visibleTracks.map((track, index) => (
              <Link
                key={track.source_id}
                href={`/ext/spotify/${track.source_id}`}
                className="group relative aspect-square overflow-hidden bg-terminal-surface opacity-0 animate-fadeUp"
                style={{
                  animationDelay: `${Math.min(index * 20, 800)}ms`,
                  animationFillMode: "forwards",
                }}
              >
                <Image
                  src={track.image}
                  alt={`${track.artist} - ${track.name}`}
                  fill
                  sizes="(max-width: 640px) 33vw, (max-width: 768px) 25vw, (max-width: 1024px) 20vw, (max-width: 1280px) 16.7vw, 12.5vw"
                  className="object-cover transition-all duration-500 ease-out group-hover:scale-[1.12] group-hover:brightness-[0.25]"
                  unoptimized
                />
                {/* Hover gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                {/* Hover glow ring */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ring-1 ring-inset ring-accent/30" />
                {/* Track info */}
                <div className="absolute inset-0 flex flex-col justify-end p-3 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0 z-10">
                  <p className="font-mono text-[13px] sm:text-sm text-white leading-snug line-clamp-2 drop-shadow-lg font-medium">
                    {track.name}
                  </p>
                  <p className="font-mono text-[11px] sm:text-xs text-white/60 leading-snug line-clamp-1 mt-1 drop-shadow-lg">
                    {track.artist}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      ) : null}

      {/* ── Section Divider ── */}
      <div className="relative py-16">
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-px bg-gradient-to-r from-transparent via-terminal-border-bright to-transparent" />
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-px bg-gradient-to-r from-transparent via-accent/20 to-transparent blur-sm" />
      </div>

      {/* ── Feed Header ── */}
      <div className="px-4 pb-6 flex items-end justify-between">
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
          className="font-mono text-sm text-phosphor-dim hover:text-accent transition-colors duration-300 mb-2"
        >
          view all →
        </Link>
      </div>

      {/* ── Feed Wall ── */}
      {feedLoading ? (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-[2px] pb-16">
          {[...Array(24)].map((_, i) => (
            <div
              key={i}
              className="aspect-square bg-terminal-surface animate-pulse"
              style={{ animationDelay: `${i * 20}ms` }}
            />
          ))}
        </div>
      ) : feedTracks.length > 0 ? (
        <div className="relative pb-16">
          <div className="absolute inset-0 pointer-events-none z-20 crt-scanlines" />
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-[2px]">
            {feedTracks.map((post, index) => (
              <Link
                key={post.id}
                href={`/ext/spotify/${post.track?.sourceId}`}
                className="group relative aspect-square overflow-hidden bg-terminal-surface opacity-0 animate-fadeUp"
                style={{
                  animationDelay: `${Math.min(index * 25, 600)}ms`,
                  animationFillMode: "forwards",
                }}
              >
                <Image
                  src={post.track!.image}
                  alt={`${post.track?.artist} - ${post.track?.title}`}
                  fill
                  sizes="(max-width: 640px) 33vw, (max-width: 768px) 25vw, (max-width: 1024px) 20vw, (max-width: 1280px) 16.7vw, 12.5vw"
                  className="object-cover transition-all duration-500 ease-out group-hover:scale-[1.12] group-hover:brightness-[0.25]"
                  unoptimized
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ring-1 ring-inset ring-accent/30" />
                <div className="absolute inset-0 flex flex-col justify-end p-3 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0 z-10">
                  <p className="font-mono text-[13px] sm:text-sm text-white leading-snug line-clamp-2 drop-shadow-lg font-medium">
                    {post.track?.title}
                  </p>
                  <p className="font-mono text-[11px] sm:text-xs text-white/60 leading-snug line-clamp-1 mt-1 drop-shadow-lg">
                    {post.track?.artist}
                  </p>
                  <p className="font-mono text-[10px] sm:text-[11px] text-accent/60 leading-tight line-clamp-1 mt-1">
                    {post.author?.username
                      ? `@${post.author.username}`
                      : post.author?.name || ""}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      ) : (
        <div className="py-20 text-center font-mono pb-16">
          <p className="text-phosphor-dim text-sm">no activity yet</p>
        </div>
      )}
    </div>
  );
};

export default Home;
