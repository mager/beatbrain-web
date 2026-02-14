import React from "react";
import Image from "next/image";
import type { CreatorHighlight } from "@types";

type Props = {
  highlights: CreatorHighlight[];
};

const CreatorHighlights: React.FC<Props> = ({ highlights }) => {
  if (!highlights || highlights.length === 0) return null;

  return (
    <div>
      <div className="space-y-1">
        {highlights.map((track, index) => (
          <a
            key={track.id}
            href={`https://open.spotify.com/track/${track.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-4 p-2 -mx-2 rounded hover:bg-terminal-surface/50 transition-colors"
          >
            {/* Rank number */}
            <span className="font-mono text-xs text-phosphor-dim w-5 text-right flex-shrink-0">
              {index + 1}
            </span>

            {/* Album art */}
            {track.image ? (
              <div className="relative w-10 h-10 flex-shrink-0 rounded overflow-hidden border border-terminal-border">
                <Image
                  src={track.image}
                  alt={track.title}
                  fill
                  className="object-cover"
                  sizes="40px"
                />
              </div>
            ) : (
              <div className="w-10 h-10 flex-shrink-0 rounded border border-terminal-border bg-terminal-surface/50 flex items-center justify-center">
                <span className="text-phosphor-dim text-xs">♪</span>
              </div>
            )}

            {/* Track info */}
            <div className="min-w-0 flex-1">
              <div className="font-mono text-xs text-phosphor group-hover:text-accent transition-colors truncate">
                {track.title}
              </div>
              <div className="font-mono text-[10px] text-phosphor-dim truncate">
                {track.artist}
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
};

export default CreatorHighlights;
