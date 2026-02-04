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

  return (
    <Link
      href={`/song/${track.id}`}
      className="group relative aspect-square overflow-hidden rounded bg-terminal-surface transition-all duration-300"
    >
      {/* Album art */}
      <Image
        src={track.image}
        alt={track.name}
        fill
        className={`object-cover transition-all duration-500 group-hover:scale-105 group-hover:brightness-75 ${
          imageLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        onLoad={() => setImageLoaded(true)}
        unoptimized
      />
      
      {/* Loading state */}
      {!imageLoaded && (
        <div className="absolute inset-0 bg-terminal-surface animate-pulse" />
      )}

      {/* Bottom gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-terminal-bg/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300" />
      
      {/* Rank number */}
      {rank !== undefined && (
        <div className="absolute top-2 left-2 font-mono text-[10px] text-accent/70 bg-terminal-bg/70 px-1.5 py-0.5 rounded z-10">
          {String(rank).padStart(2, '0')}
        </div>
      )}

      {/* Track info on hover */}
      <div className="absolute inset-x-0 bottom-0 p-3 translate-y-1 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 z-10">
        <p className="font-mono text-xs text-phosphor line-clamp-1 mb-0.5">
          {track.name}
        </p>
        <p className="font-mono text-[10px] text-phosphor-dim line-clamp-1">
          {track.artist}
        </p>
        {track.isrc && (
          <p className="font-mono text-[9px] text-cool/50 mt-1">
            {track.isrc}
          </p>
        )}
      </div>
    </Link>
  );
};

export default TrackItem;
