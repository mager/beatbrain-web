import React from "react";
import Image from "next/image";
import type { CreatorHighlight } from "@types";

type Props = {
  highlights: CreatorHighlight[];
};

const CreatorHighlights: React.FC<Props> = ({ highlights }) => {
  if (!highlights || highlights.length === 0) return null;

  return (
    <div className="space-y-0.5">
      {highlights.map((track, index) => (
        <a
          key={track.id}
          href={`https://open.spotify.com/track/${track.id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="group flex items-center gap-5 py-3.5 px-4 -mx-4 rounded-xl hover:bg-white/[0.04] transition-all duration-200"
        >
          {/* Rank */}
          <span className="font-mono text-lg font-bold w-7 text-right flex-shrink-0 tabular-nums text-phosphor-dim/40 group-hover:text-accent/60 transition-colors">
            {index + 1}
          </span>

          {/* Album art */}
          <div className="relative w-14 h-14 flex-shrink-0 rounded-lg overflow-hidden border border-terminal-border group-hover:border-accent/30 transition-all duration-300 group-hover:shadow-glow-accent">
            {track.image ? (
              <Image
                src={track.image}
                alt={track.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
                sizes="56px"
              />
            ) : (
              <div className="w-full h-full bg-terminal-surface flex items-center justify-center">
                <span className="text-phosphor-dim text-lg">♪</span>
              </div>
            )}
          </div>

          {/* Track info */}
          <div className="min-w-0 flex-1">
            <div className="font-mono text-[15px] text-phosphor group-hover:text-white transition-colors truncate leading-snug">
              {track.title}
            </div>
            <div className="font-mono text-xs text-phosphor-dim mt-1 truncate">
              {track.artist}
            </div>
          </div>

          {/* Play hint */}
          <div className="hidden sm:flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <span className="font-mono text-xs text-accent tracking-wider">
              PLAY
            </span>
            <span className="text-accent">→</span>
          </div>
        </a>
      ))}
    </div>
  );
};

export default CreatorHighlights;
