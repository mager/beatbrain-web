import React, { useState, useEffect, useMemo } from "react";
import type { PostProps } from "@components/Post";
import Link from "next/link";
import Image from "next/image";
import { useAppContext } from "../context/AppContext";

const Home: React.FC = () => {
  const { state } = useAppContext();
  const { tracks, tracksLoading, tracksUpdated } = state;

  const [feed, setFeed] = useState<PostProps[]>([]);
  const [feedLoading, setFeedLoading] = useState(true);

  const visibleTracks = useMemo(
    () => tracks.filter((t) => t.image && t.source_id),
    [tracks]
  );

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

  const timeAgo = (dateStr: string | Date) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const mins = Math.floor(diffMs / 60000);
    const hrs = Math.floor(diffMs / 3600000);
    const days = Math.floor(diffMs / 86400000);
    if (mins < 1) return "now";
    if (mins < 60) return `${mins}m`;
    if (hrs < 24) return `${hrs}h`;
    if (days < 7) return `${days}d`;
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  return (
    <div className="min-h-screen">
      {/* ── Discover Header ── */}
      <div className="px-4 pt-4 pb-3 flex items-end justify-between">
        <div>
          <h1 className="font-display text-xl md:text-2xl text-phosphor tracking-tight">
            discover
          </h1>
          <p className="font-mono text-xs text-phosphor-dim mt-1">
            {visibleTracks.length > 0 && (
              <>
                <span className="text-accent">{visibleTracks.length}</span>
                <span className="mx-1">hot tracks</span>
              </>
            )}
            {tracksUpdated && (
              <>
                <span className="text-terminal-border mx-1">/</span>
                <span className="tabular-nums">
                  {new Date(tracksUpdated).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              </>
            )}
          </p>
        </div>
      </div>

      {/* ── Wall of Covers ── */}
      {tracksLoading ? (
        <div className="grid grid-cols-5 sm:grid-cols-7 md:grid-cols-9 lg:grid-cols-11 xl:grid-cols-13 2xl:grid-cols-[repeat(15,minmax(0,1fr))] gap-0">
          {[...Array(75)].map((_, i) => (
            <div
              key={i}
              className="aspect-square bg-terminal-surface animate-pulse"
              style={{ animationDelay: `${i * 10}ms` }}
            />
          ))}
        </div>
      ) : visibleTracks.length > 0 ? (
        <div className="grid grid-cols-5 sm:grid-cols-7 md:grid-cols-9 lg:grid-cols-11 xl:grid-cols-13 2xl:grid-cols-[repeat(15,minmax(0,1fr))] gap-0">
          {visibleTracks.map((track, index) => (
            <Link
              key={track.source_id || index}
              href={`/ext/spotify/${track.source_id}`}
              className="group relative aspect-square overflow-hidden bg-terminal-surface opacity-0 animate-fadeUp"
              style={{
                animationDelay: `${Math.min(index * 8, 500)}ms`,
                animationFillMode: "forwards",
              }}
            >
              <Image
                src={track.image}
                alt={`${track.artist} - ${track.name}`}
                fill
                sizes="(max-width: 640px) 20vw, (max-width: 768px) 14.3vw, (max-width: 1024px) 11.1vw, (max-width: 1280px) 9.1vw, 7.7vw"
                className="object-cover transition-all duration-300 group-hover:scale-110 group-hover:brightness-[0.3]"
                unoptimized
              />
              {/* Hover overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
              <div className="absolute inset-0 flex flex-col justify-end p-1.5 sm:p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
                <p className="font-mono text-[8px] sm:text-[9px] text-white leading-tight line-clamp-2 drop-shadow-lg">
                  {track.name}
                </p>
                <p className="font-mono text-[7px] sm:text-[8px] text-white/50 leading-tight line-clamp-1 mt-0.5 drop-shadow-lg">
                  {track.artist}
                </p>
              </div>
            </Link>
          ))}
        </div>
      ) : null}

      {/* ── Feed Header ── */}
      <div className="px-4 pt-10 pb-3 flex items-end justify-between">
        <div>
          <h2 className="font-display text-xl md:text-2xl text-phosphor tracking-tight">
            feed
          </h2>
          <p className="font-mono text-xs text-phosphor-dim mt-1">
            latest saves from the community
          </p>
        </div>
        <Link
          href="/feed"
          className="font-mono text-[11px] text-phosphor-dim hover:text-accent transition-colors duration-300"
        >
          view all →
        </Link>
      </div>

      {/* ── Feed Firehose ── */}
      {feedLoading ? (
        <div className="px-4 pb-16 space-y-[1px]">
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="h-14 bg-terminal-surface animate-pulse"
              style={{ animationDelay: `${i * 30}ms` }}
            />
          ))}
        </div>
      ) : feed.length > 0 ? (
        <div className="pb-16">
          {feed.map((post, index) => (
            <Link
              key={post.id}
              href={`/ext/spotify/${post.track?.sourceId || ""}`}
              className="group flex items-center gap-3 px-4 py-2.5 border-b border-terminal-border/30 hover:bg-terminal-surface/60 transition-all duration-150 opacity-0 animate-fadeUp"
              style={{
                animationDelay: `${index * 20}ms`,
                animationFillMode: "forwards",
              }}
            >
              {/* Album art */}
              <div className="relative flex-shrink-0 w-10 h-10 overflow-hidden bg-terminal-surface">
                {post.track?.image ? (
                  <Image
                    src={post.track.image}
                    alt={post.track?.title || "Track"}
                    width={40}
                    height={40}
                    className="w-full h-full object-cover"
                    unoptimized
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-phosphor-dim text-[10px]">
                    —
                  </div>
                )}
              </div>

              {/* Track info */}
              <div className="flex-1 min-w-0">
                <p className="font-mono text-xs text-phosphor line-clamp-1 group-hover:text-accent transition-colors duration-200">
                  {post.track?.title || "Unknown"}
                </p>
                <p className="font-mono text-[10px] text-phosphor-dim line-clamp-1">
                  {post.track?.artist || "Unknown"}
                </p>
              </div>

              {/* User + time */}
              <div className="flex-shrink-0 flex items-center gap-3">
                <span className="font-mono text-[10px] text-cool hidden sm:inline">
                  {post.author?.username
                    ? `@${post.author.username}`
                    : post.author?.name || "anon"}
                </span>
                <span className="font-mono text-[10px] text-phosphor-dim/40 tabular-nums w-8 text-right">
                  {timeAgo(post.createdAt)}
                </span>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="py-12 text-center font-mono">
          <p className="text-phosphor-dim text-xs">no activity yet</p>
        </div>
      )}
    </div>
  );
};

export default Home;
