import React from "react";
import Link from "next/link";
import type { Track } from "@types";

interface MarqueeProps {
  tracks?: Track[];
  speed?: number;
  className?: string;
}

const Marquee: React.FC<MarqueeProps> = ({
  tracks = [],
  speed = 50,
  className = ""
}) => {
  if (tracks.length === 0) return null;

  const tickerContent = (
    <span className="inline-flex items-center gap-6 whitespace-nowrap">
      {tracks.filter((t) => t.source_id).slice(0, 20).map((track, index) => (
        <Link
          key={`${track.source_id}-${index}`}
          href={`/ext/spotify/${track.source_id}`}
          className="inline-flex items-center gap-2 group"
        >
          <span className="font-mono text-[10px] text-accent/60 tabular-nums">
            {String(index + 1).padStart(2, '0')}
          </span>
          <span className="text-phosphor group-hover:text-accent transition-colors duration-200 text-xs font-mono">
            {track.name}
          </span>
          <span className="text-phosphor-dim mx-0.5">—</span>
          <span className="text-phosphor/70 group-hover:text-phosphor transition-colors duration-200 text-xs font-mono">
            {track.artist}
          </span>
          <span className="text-accent/30 mx-2">/</span>
        </Link>
      ))}
    </span>
  );

  return (
    <div className={`overflow-hidden whitespace-nowrap py-2.5 mt-4 border-y border-terminal-border/60 bg-terminal-surface/40 ${className}`}>
      <div
        className="inline-flex animate-marquee"
        style={{
          ['--marquee-duration' as string]: `${speed}s`,
        }}
      >
        {tickerContent}
        <span className="inline-flex items-center gap-6 whitespace-nowrap ml-6">
          {tickerContent}
        </span>
      </div>
    </div>
  );
};

export default Marquee;
