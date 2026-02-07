import React, { useState, useEffect } from "react";
import type { RecommendedTracksResp, Track } from "@types";
import type { PostProps } from "@components/Post";
import Link from "next/link";
import Image from "next/image";

const Home: React.FC = () => {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [feed, setFeed] = useState<PostProps[]>([]);
  const [updated, setUpdated] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [feedLoading, setFeedLoading] = useState(true);

  const fetchTracks = async () => {
    try {
      const res = await fetch(`/api/discover`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      if (!res.ok) return;
      const resp: RecommendedTracksResp = await res.json();
      setTracks(resp.tracks);
      setUpdated(resp.updated || null);
    } catch (err) {
      console.error("Error fetching tracks:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchFeed = async () => {
    try {
      const res = await fetch(`/api/feed?limit=6`);
      if (!res.ok) return;
      const data = await res.json();
      setFeed(data);
    } catch (err) {
      console.error("Error fetching feed:", err);
    } finally {
      setFeedLoading(false);
    }
  };

  useEffect(() => {
    fetchTracks();
    fetchFeed();
  }, []);

  const heroTrack = tracks[0];
  const sideTracks = tracks.slice(1, 3);
  const gridTracks = tracks.slice(3, 27);

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
      {/* ── Section Header ── */}
      <section className="bb-container pt-20 pb-6">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <h1 className="font-display text-xl md:text-2xl text-phosphor tracking-tight">
              discover
            </h1>
            <p className="font-mono text-xs text-phosphor-dim mt-1">
              dig deeper
              {updated && (
                <>
                  <span className="text-terminal-border mx-2">·</span>
                  <span className="tabular-nums">
                    updated{" "}
                    {new Date(updated).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </>
              )}
            </p>
          </div>

        </div>
      </section>

      {/* ── Hero + Side Tracks ── */}
      <section className="bb-container pb-2">
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            <div className="col-span-2 aspect-[16/10] md:aspect-auto md:row-span-2 bg-terminal-surface rounded animate-pulse" />
            <div className="hidden md:block aspect-square bg-terminal-surface rounded animate-pulse" />
            <div className="hidden md:block aspect-square bg-terminal-surface rounded animate-pulse" />
          </div>
        ) : heroTrack ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {/* Hero — #1 */}
            <Link
              href={`/song/${heroTrack.id}`}
              className={`group col-span-2 md:row-span-2 relative overflow-hidden rounded bg-terminal-surface opacity-0 animate-fadeUp`}
              style={{ animationFillMode: "forwards" }}
            >
              <div className="relative aspect-[16/10] md:aspect-auto md:h-full">
                <Image
                  src={heroTrack.image}
                  alt={heroTrack.name}
                  fill
                  className="object-cover transition-all duration-700 group-hover:scale-[1.03] group-hover:brightness-75"
                  priority
                  unoptimized
                />
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-terminal-bg via-terminal-bg/20 to-transparent" />

                {/* Info */}
                <div className="absolute inset-x-0 bottom-0 p-4 md:p-6 z-10">
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className="w-2 h-2 rounded-full bg-accent animate-pulse"
                    />
                    <span className="font-mono text-[10px] text-accent uppercase tracking-wider">
                      featured
                    </span>
                  </div>
                  <h2 className="font-mono text-lg md:text-xl text-phosphor leading-tight line-clamp-2 group-hover:text-white transition-colors duration-300">
                    {heroTrack.name}
                  </h2>
                  <p className="font-mono text-sm text-phosphor-dim mt-1 line-clamp-1">
                    {heroTrack.artist}
                  </p>
                  {heroTrack.genres && heroTrack.genres.length > 0 && (
                    <p className="font-mono text-[10px] text-phosphor-dim/60 mt-2 line-clamp-1">
                      {heroTrack.genres.slice(0, 3).join(" · ")}
                    </p>
                  )}
                </div>
              </div>
            </Link>

            {/* Side tracks — #2 & #3 */}
            {sideTracks.map((track, i) => (
              <Link
                key={track.id}
                href={`/song/${track.id}`}
                className="group relative aspect-square overflow-hidden rounded bg-terminal-surface opacity-0 animate-fadeUp hidden md:block"
                style={{
                  animationDelay: `${(i + 1) * 80}ms`,
                  animationFillMode: "forwards",
                }}
              >
                <Image
                  src={track.image}
                  alt={track.name}
                  fill
                  className="object-cover transition-all duration-500 group-hover:scale-105 group-hover:brightness-75"
                  unoptimized
                />
                <div className="absolute inset-0 bg-gradient-to-t from-terminal-bg/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute inset-x-0 bottom-0 p-3 translate-y-1 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 z-10">
                  <p className="font-mono text-xs text-phosphor line-clamp-1">
                    {track.name}
                  </p>
                  <p className="font-mono text-[10px] text-phosphor-dim line-clamp-1 mt-0.5">
                    {track.artist}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        ) : null}
      </section>

      {/* ── Track Grid ── */}
      <section className="bb-container py-6">
        {isLoading ? (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2">
            {[...Array(18)].map((_, i) => (
              <div
                key={i}
                className="aspect-square bg-terminal-surface rounded animate-pulse"
                style={{ animationDelay: `${i * 40}ms` }}
              />
            ))}
          </div>
        ) : gridTracks.length > 0 ? (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2">
            {gridTracks.map((track, index) => (
              <Link
                key={track.id}
                href={`/song/${track.id}`}
                className="group relative aspect-square overflow-hidden rounded bg-terminal-surface opacity-0 animate-fadeUp"
                style={{
                  animationDelay: `${index * 25}ms`,
                  animationFillMode: "forwards",
                }}
              >
                <Image
                  src={track.image}
                  alt={track.name}
                  fill
                  className="object-cover transition-all duration-500 group-hover:scale-105 group-hover:brightness-75"
                  unoptimized
                />
                <div className="absolute inset-0 bg-gradient-to-t from-terminal-bg/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300" />
                <div className="absolute inset-x-0 bottom-0 p-2 translate-y-1 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 z-10">
                  <p className="font-mono text-[11px] text-phosphor line-clamp-1">
                    {track.name}
                  </p>
                  <p className="font-mono text-[9px] text-phosphor-dim line-clamp-1 mt-0.5">
                    {track.artist}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 font-mono">
            <p className="text-phosphor-dim text-sm">no tracks found</p>
          </div>
        )}
      </section>

      {/* ── Community Feed ── */}
      <section className="bb-container pt-6 pb-16">
        <div className="flex items-end justify-between mb-4 border-b border-terminal-border pb-3">
          <div className="font-mono">
            <span className="text-[10px] text-phosphor-dim block mb-1 uppercase tracking-wider">
              community
            </span>
            <h3 className="text-sm text-phosphor">recent saves</h3>
          </div>
          <Link
            href="/feed"
            className="font-mono text-[11px] text-phosphor-dim hover:text-accent transition-colors duration-300"
          >
            view all →
          </Link>
        </div>

        {feedLoading ? (
          <div className="space-y-2">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="h-14 bg-terminal-surface rounded animate-pulse"
                style={{ animationDelay: `${i * 60}ms` }}
              />
            ))}
          </div>
        ) : feed.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {feed.map((post, index) => (
              <Link
                key={post.id}
                href={`/ext/spotify/${post.track?.sourceId || ""}`}
                className="group flex items-center gap-3 p-3 rounded border border-terminal-border hover:border-terminal-border-bright bg-terminal-surface/50 hover:bg-terminal-surface transition-all duration-300 opacity-0 animate-fadeUp"
                style={{
                  animationDelay: `${index * 40}ms`,
                  animationFillMode: "forwards",
                }}
              >
                {/* Tiny album art */}
                <div className="relative flex-shrink-0 w-10 h-10 rounded overflow-hidden bg-terminal-bg">
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

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-mono text-xs text-phosphor line-clamp-1 group-hover:text-accent transition-colors duration-300">
                    {post.track?.title || "Unknown"}
                  </p>
                  <p className="font-mono text-[10px] text-phosphor-dim line-clamp-1">
                    {post.track?.artist || "Unknown"}
                  </p>
                </div>

                {/* Meta */}
                <div className="flex-shrink-0 text-right">
                  <p className="font-mono text-[10px] text-cool">
                    {post.author?.username
                      ? `@${post.author.username}`
                      : post.author?.name || "anon"}
                  </p>
                  <p className="font-mono text-[9px] text-phosphor-dim/50 tabular-nums">
                    {timeAgo(post.createdAt)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center font-mono">
            <p className="text-phosphor-dim text-xs">no activity yet</p>
          </div>
        )}
      </section>
    </div>
  );
};

export default Home;
