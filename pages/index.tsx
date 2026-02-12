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
      <div className="px-4 pt-4 pb-3 flex items-end justify-between">
        <div>
          <h1 className="font-display text-xl md:text-2xl text-white tracking-tight">
            discover
          </h1>
          <p className="font-mono text-xs text-phosphor mt-1">
            {visibleTracks.length > 0 && (
              <>
                <span className="text-accent font-semibold">{visibleTracks.length}</span>
                <span className="mx-1">hot tracks</span>
              </>
            )}
            {tracksUpdated && (
              <>
                <span className="text-terminal-border-bright mx-1">/</span>
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

      {/* ── Discover Wall ── */}
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
              key={track.source_id}
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
          <h2 className="font-display text-xl md:text-2xl text-white tracking-tight">
            feed
          </h2>
          <p className="font-mono text-xs text-phosphor mt-1">
            latest saves from the community
          </p>
        </div>
        <Link
          href="/feed"
          className="font-mono text-[11px] text-phosphor hover:text-accent transition-colors duration-300"
        >
          view all →
        </Link>
      </div>

      {/* ── Feed Wall ── */}
      {feedLoading ? (
        <div className="grid grid-cols-5 sm:grid-cols-7 md:grid-cols-9 lg:grid-cols-11 xl:grid-cols-13 2xl:grid-cols-[repeat(15,minmax(0,1fr))] gap-0 pb-16">
          {[...Array(30)].map((_, i) => (
            <div
              key={i}
              className="aspect-square bg-terminal-surface animate-pulse"
              style={{ animationDelay: `${i * 15}ms` }}
            />
          ))}
        </div>
      ) : feedTracks.length > 0 ? (
        <div className="grid grid-cols-5 sm:grid-cols-7 md:grid-cols-9 lg:grid-cols-11 xl:grid-cols-13 2xl:grid-cols-[repeat(15,minmax(0,1fr))] gap-0 pb-16">
          {feedTracks.map((post, index) => (
            <Link
              key={post.id}
              href={`/ext/spotify/${post.track?.sourceId}`}
              className="group relative aspect-square overflow-hidden bg-terminal-surface opacity-0 animate-fadeUp"
              style={{
                animationDelay: `${Math.min(index * 12, 400)}ms`,
                animationFillMode: "forwards",
              }}
            >
              <Image
                src={post.track!.image}
                alt={`${post.track?.artist} - ${post.track?.title}`}
                fill
                sizes="(max-width: 640px) 20vw, (max-width: 768px) 14.3vw, (max-width: 1024px) 11.1vw, (max-width: 1280px) 9.1vw, 7.7vw"
                className="object-cover transition-all duration-300 group-hover:scale-110 group-hover:brightness-[0.3]"
                unoptimized
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
              <div className="absolute inset-0 flex flex-col justify-end p-1.5 sm:p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
                <p className="font-mono text-[8px] sm:text-[9px] text-white leading-tight line-clamp-2 drop-shadow-lg">
                  {post.track?.title}
                </p>
                <p className="font-mono text-[7px] sm:text-[8px] text-white/50 leading-tight line-clamp-1 mt-0.5 drop-shadow-lg">
                  {post.track?.artist}
                </p>
                <p className="font-mono text-[6px] sm:text-[7px] text-accent/60 leading-tight line-clamp-1 mt-0.5">
                  {post.author?.username
                    ? `@${post.author.username}`
                    : post.author?.name || ""}
                </p>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="py-12 text-center font-mono pb-16">
          <p className="text-phosphor-dim text-xs">no activity yet</p>
        </div>
      )}
    </div>
  );
};

export default Home;
