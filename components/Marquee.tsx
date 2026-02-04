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
  speed = 60, 
  className = "" 
}) => {
  if (tracks.length === 0) return null;

  const tickerContent = (
    <span className="inline-flex items-center gap-6 whitespace-nowrap">
      {tracks.slice(0, 20).map((track, index) => (
        <Link 
          key={`${track.id}-${index}`}
          href={`/song/${track.id}`}
          className="inline-flex items-center gap-2 group"
        >
          <span className="font-mono text-[10px] text-phosphor-dim/50 tabular-nums">
            {String(index + 1).padStart(2, '0')}
          </span>
          <span className="text-phosphor/50 group-hover:text-accent transition-colors duration-200 text-xs font-mono">
            {track.name}
          </span>
          <span className="text-phosphor-dim/40 text-[10px]">—</span>
          <span className="text-phosphor-dim group-hover:text-phosphor/60 transition-colors duration-200 text-xs font-mono">
            {track.artist}
          </span>
          <span className="text-terminal-border mx-2">·</span>
        </Link>
      ))}
    </span>
  );

  return (
    <div className={`overflow-hidden whitespace-nowrap py-2 border-y border-terminal-border bg-terminal-bg/80 ${className}`}>
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
