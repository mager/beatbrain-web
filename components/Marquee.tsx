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
  speed = 20, 
  className = "" 
}) => {
  const generateTickerContent = () => {
    if (tracks.length === 0) {
      return (
        <span className="inline-block whitespace-nowrap">
          🎵 BEATBRAIN LIVE • DISCOVERING THE BEST NEW MUSIC • TRENDING TRACKS • HOT RELEASES • FRESH FINDS • 🎵
        </span>
      );
    }

    return (
      <span className="inline-block whitespace-nowrap">
        🎵 BEATBRAIN DISCOVER FEED •{" "}
        {tracks.map((track, index) => (
          <React.Fragment key={track.id}>
            <Link 
              href={`/song/${track.id}`}
              className="underline hover:no-underline transition-colors duration-200"
            >
              {track.name} by {track.artist}
            </Link>
            {index < tracks.length - 1 && " • "}
          </React.Fragment>
        ))}
        {" • 🎵"}
      </span>
    );
  };

  const tickerContent = generateTickerContent();

  return (
    <div className={`overflow-hidden whitespace-nowrap bg-black border-t-2 border-b-2 mt-4 border-yellow-400 ${className}`}>
      <div 
        className="inline-block animate-marquee text-yellow-300 font-bold text-lg tracking-wider drop-shadow-[0_0_6px_rgba(253,224,71,0.8)] py-3 px-4 leading-tight"
        style={{ 
          animationDuration: `${speed}s`,
          animationTimingFunction: 'linear',
          animationIterationCount: 'infinite'
        }}
      >
        {tickerContent}
        <span className="inline-block whitespace-nowrap ml-8">
          {tickerContent}
        </span>
      </div>
    </div>
  );
};

export default Marquee; 