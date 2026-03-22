import React, { useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAppContext } from "../context/AppContext";

const DiscoverPage: React.FC = () => {
  const { state } = useAppContext();
  const { tracks, tracksLoading, tracksUpdated } = state;

  const visibleTracks = useMemo(() => {
    const seen = new Set<string>();
    return tracks.filter((t) => {
      if (!t.image || !t.source_id) return false;
      if (seen.has(t.image)) return false;
      seen.add(t.image);
      return true;
    });
  }, [tracks]);

  return (
    <div className="min-h-screen">
      {/* ── Header ── */}
      <div className="px-4 pt-8 pb-6">
        <div className="relative inline-block">
          <h1 className="font-display text-massive text-phosphor tracking-tight font-bold">
            discover
          </h1>
          <div className="absolute -bottom-2 left-0 w-24 h-1 bg-accent rounded-full" />
        </div>
        <p className="font-mono text-sm text-phosphor-dim mt-5">
          {visibleTracks.length > 0 && (
            <>
              <span className="text-accent font-bold text-base tabular-nums">
                {visibleTracks.length}
              </span>
              <span className="mx-2">hot tracks scored across sources</span>
            </>
          )}
          {tracksUpdated && (
            <>
              <span className="text-terminal-border-bright mx-2">/</span>
              <span className="tabular-nums text-phosphor-dim">
                updated{" "}
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
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-1 px-1 pb-16">
          {[...Array(48)].map((_, i) => (
            <div
              key={i}
              className="aspect-square bg-terminal-border/30 rounded-lg animate-pulse"
              style={{ animationDelay: `${i * 15}ms` }}
            />
          ))}
        </div>
      ) : visibleTracks.length > 0 ? (
        <div className="relative pb-16 px-1">
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-1">
            {visibleTracks.map((track, index) => (
              <Link
                key={track.source_id}
                href={`/ext/spotify/${track.source_id}`}
                className="group relative aspect-square overflow-hidden rounded-lg bg-terminal-border/20 opacity-0 animate-fadeUp"
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
                  className="object-cover transition-all duration-500 ease-out group-hover:scale-[1.08]"
                  unoptimized
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute inset-0 flex flex-col justify-end p-3 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0 z-10">
                  <p className="font-display text-[13px] sm:text-sm text-white leading-snug line-clamp-2 font-semibold">
                    {track.name}
                  </p>
                  <p className="font-mono text-[11px] sm:text-xs text-white/60 leading-snug line-clamp-1 mt-1">
                    {track.artist}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      ) : (
        <div className="py-20 text-center pb-16">
          <p className="text-phosphor-dim text-sm font-display">No tracks yet</p>
        </div>
      )}
    </div>
  );
};

export default DiscoverPage;
