import React from "react";
import Image from "next/image";
import type { CreatorHighlight } from "@types";

type Props = {
  highlights: CreatorHighlight[];
};

const CreatorHighlights: React.FC<Props> = ({ highlights }) => {
  if (!highlights || highlights.length === 0) return null;

  return (
    <div className="space-y-1">
      {highlights.map((track, index) => (
        <a
          key={track.id}
          href={`https://open.spotify.com/track/${track.id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="group flex items-center gap-5 py-3 px-3 -mx-3 rounded-lg hover:bg-white/[0.03] transition-all duration-200"
        >
          {/* Rank */}
          <span className="font-mono text-base text-phosphor-dim/60 w-6 text-right flex-shrink-0 tabular-nums group-hover:text-phosphor-dim transition-colors">
            {index + 1}
          </span>

          {/* Album art */}
          <div className="relative w-14 h-14 flex-shrink-0 rounded overflow-hidden border border-terminal-border group-hover:border-terminal-border-bright transition-colors shadow-lg">
            {track.image ? (
              <Image
                src={track.image}
                alt={track.title}
                fill
                className="object-cover"
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
            <div className="font-mono text-sm text-phosphor group-hover:text-white transition-colors truncate leading-snug">
              {track.title}
            </div>
            <div className="font-mono text-xs text-phosphor-dim mt-0.5 truncate">
              {track.artist}
            </div>
          </div>

          {/* Spotify hint on hover */}
          <div className="hidden sm:flex items-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <span className="font-mono text-[10px] text-phosphor-dim/60 uppercase tracking-wider">
              Play →
            </span>
          </div>
        </a>
      ))}
    </div>
  );
};

export default CreatorHighlights;
