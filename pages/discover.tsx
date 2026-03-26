import React, { useMemo, useRef, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAppContext } from "../context/AppContext";

const DiscoverPage: React.FC = () => {
  const { state } = useAppContext();
  const { tracks, tracksLoading, tracksUpdated } = state;
  const gridRef = useRef<HTMLDivElement>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const visibleTracks = useMemo(() => {
    const seen = new Set<string>();
    return tracks.filter((t) => {
      if (!t.image || !t.source_id) return false;
      if (seen.has(t.image)) return false;
      seen.add(t.image);
      return true;
    });
  }, [tracks]);

  // Intersection Observer for scroll-triggered animations
  useEffect(() => {
    if (!gridRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '50px' }
    );

    const items = gridRef.current.querySelectorAll('.discover-item');
    items.forEach((item) => observer.observe(item));

    return () => observer.disconnect();
  }, [visibleTracks]);

  return (
    <div className="min-h-screen">
      {/* ── Header ── */}
      <div className="px-4 pt-8 pb-8">
        <div className="relative inline-block">
          <h1 className="font-display text-massive text-phosphor tracking-tight font-bold">
            discover
          </h1>
          <div className="absolute -bottom-2 left-0 w-24 h-1 bg-accent rounded-full" />
        </div>
        <div className="flex items-center gap-4 mt-5">
          <p className="font-mono text-sm text-phosphor-dim">
            {visibleTracks.length > 0 && (
              <>
                <span className="text-accent font-bold text-lg tabular-nums">
                  {visibleTracks.length}
                </span>
                <span className="mx-2">hot tracks scored across sources</span>
              </>
            )}
          </p>
          {tracksUpdated && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-terminal-surface border border-terminal-border font-mono text-[10px] text-phosphor-dim tabular-nums">
              <span className="w-1.5 h-1.5 rounded-full bg-mint animate-pulse" />
              updated{" "}
              {new Date(tracksUpdated).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}
            </span>
          )}
        </div>
      </div>

      {/* ── Discover Wall ── */}
      {tracksLoading ? (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-1.5 px-2 pb-16">
          {[...Array(48)].map((_, i) => (
            <div
              key={i}
              className="aspect-square rounded-lg bg-gradient-to-br from-terminal-border/30 to-terminal-border/10 animate-shimmer"
              style={{
                backgroundSize: '200% 100%',
                animationDelay: `${i * 25}ms`,
              }}
            />
          ))}
        </div>
      ) : visibleTracks.length > 0 ? (
        <div className="relative pb-16 px-2">
          <div
            ref={gridRef}
            className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-1.5"
          >
            {visibleTracks.map((track, index) => (
              <Link
                key={track.source_id}
                href={`/ext/spotify/${track.source_id}`}
                className={`
                  discover-item group relative aspect-square overflow-hidden rounded-lg
                  bg-terminal-border/20
                  opacity-0 translate-y-4
                  transition-all duration-700 ease-out
                  [&.is-visible]:opacity-100 [&.is-visible]:translate-y-0
                  hover:z-10 hover:rounded-xl
                `}
                style={{
                  transitionDelay: `${Math.min(index * 30, 1200)}ms`,
                }}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                <Image
                  src={track.image}
                  alt={`${track.artist} - ${track.name}`}
                  fill
                  sizes="(max-width: 640px) 33vw, (max-width: 768px) 25vw, (max-width: 1024px) 20vw, (max-width: 1280px) 16.7vw, 12.5vw"
                  className={`
                    object-cover transition-all duration-700 ease-out
                    group-hover:scale-[1.1]
                    ${hoveredIndex !== null && hoveredIndex !== index ? 'brightness-[0.7] saturate-50' : ''}
                  `}
                  unoptimized
                />

                {/* Hover overlay — cinematic gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400" />

                {/* Track info — slides up */}
                <div className="absolute inset-0 flex flex-col justify-end p-3 opacity-0 group-hover:opacity-100 translate-y-3 group-hover:translate-y-0 transition-all duration-500 ease-out z-10">
                  <p className="font-display text-[13px] sm:text-sm text-white leading-snug line-clamp-2 font-semibold drop-shadow-lg">
                    {track.name}
                  </p>
                  <p className="font-mono text-[11px] sm:text-xs text-white/70 leading-snug line-clamp-1 mt-1">
                    {track.artist}
                  </p>
                </div>

                {/* Rank badge for top tracks */}
                {index < 10 && (
                  <div className="absolute top-2 left-2 z-10 flex items-center justify-center w-6 h-6 rounded-full bg-black/60 backdrop-blur-sm border border-white/10">
                    <span className="font-mono text-[9px] text-white/90 font-bold tabular-nums">
                      {index + 1}
                    </span>
                  </div>
                )}
              </Link>
            ))}
          </div>

          {/* Bottom fade */}
          <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-terminal-bg via-terminal-bg/80 to-transparent z-30 pointer-events-none" />
        </div>
      ) : (
        <div className="py-24 text-center pb-16">
          <div className="inline-block p-8 rounded-2xl bg-terminal-surface border border-terminal-border">
            <span className="text-4xl mb-4 block">🎵</span>
            <p className="text-phosphor-dim text-sm font-display">No tracks yet</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default DiscoverPage;
