import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";

interface TrackItemProps {
  track: {
    source_id: string;
    id: string;
    image: string;
    name: string;
    artist: string;
    isrc?: string;
    source?: string;
  };
  rank?: number;
}

const TrackItem: React.FC<TrackItemProps> = ({ track, rank }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Link
      href={`/song/${track.id}`}
      className="group relative aspect-square overflow-hidden border border-terminal-border hover:border-matrix/50 transition-all duration-300 bg-terminal-surface"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Album art */}
      <Image
        src={track.image}
        alt={track.name}
        fill
        className={`object-cover transition-all duration-500 group-hover:opacity-70 group-hover:scale-105 ${
          imageLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        onLoad={() => setImageLoaded(true)}
        unoptimized
      />
      
      {/* Loading state */}
      {!imageLoaded && (
        <div className="absolute inset-0 bg-terminal-surface animate-pulse" />
      )}

      {/* Scanline overlay on hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{
          background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.15) 2px, rgba(0,0,0,0.15) 4px)',
        }}
      />
      
      {/* Bottom gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-terminal-bg via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300" />
      
      {/* Rank number - top left */}
      {rank !== undefined && (
        <div className="absolute top-2 left-2 font-mono text-[10px] text-matrix/80 bg-terminal-bg/80 px-1.5 py-0.5 border border-terminal-border z-10">
          {String(rank).padStart(2, '0')}
        </div>
      )}

      {/* Track info on hover */}
      <div className="absolute inset-x-0 bottom-0 p-3 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 z-10">
        <p className="font-mono text-xs text-phosphor line-clamp-1 mb-0.5">
          {track.name}
        </p>
        <p className="font-mono text-[10px] text-phosphor-dim line-clamp-1">
          {track.artist}
        </p>
        {/* ISRC data readout */}
        {track.isrc && isHovered && (
          <p className="font-mono text-[9px] text-matrix/60 mt-1">
            ISRC:{track.isrc}
          </p>
        )}
      </div>

      {/* Corner brackets on hover */}
      <div className="absolute top-1 left-1 w-3 h-3 border-t border-l border-matrix/0 group-hover:border-matrix/60 transition-all duration-300" />
      <div className="absolute top-1 right-1 w-3 h-3 border-t border-r border-matrix/0 group-hover:border-matrix/60 transition-all duration-300" />
      <div className="absolute bottom-1 left-1 w-3 h-3 border-b border-l border-matrix/0 group-hover:border-matrix/60 transition-all duration-300" />
      <div className="absolute bottom-1 right-1 w-3 h-3 border-b border-r border-matrix/0 group-hover:border-matrix/60 transition-all duration-300" />
    </Link>
  );
};

export default TrackItem;
