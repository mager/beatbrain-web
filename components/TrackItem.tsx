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
  };
}

const TrackItem: React.FC<TrackItemProps> = ({ track }) => {
  const [showOverlay, setShowOverlay] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <Link
      href={`/song/${track.id}`}
      key={track.id}
      className="block group relative w-full aspect-square overflow-hidden bg-white/5 rounded-sm"
      onTouchStart={() => setShowOverlay((v) => !v)}
      onMouseLeave={() => setShowOverlay(false)}
    >
      <Image
        src={track.image}
        alt={track.name}
        width={300}
        height={300}
        className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-110 ${
          imageLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        onLoad={() => setImageLoaded(true)}
        unoptimized
      />
      
      {/* Hover overlay with gradient */}
      <div
        className={`absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 ${
          showOverlay ? "opacity-100" : ""
        }`}
      />
      
      {/* Track info */}
      <div
        className={`absolute inset-0 flex flex-col items-center justify-end p-2 text-white opacity-0 group-hover:opacity-100 transition-all duration-300 ${
          showOverlay ? "opacity-100" : ""
        }`}
      >
        <div className="w-full">
          <div className="font-bold text-xs md:text-sm truncate leading-tight drop-shadow-lg">
            {track.name}
          </div>
          <div className="text-[10px] md:text-xs text-white/70 truncate mt-0.5 drop-shadow-lg">
            {track.artist}
          </div>
        </div>
      </div>

      {/* Play indicator on hover */}
      <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-green-500/90 flex items-center justify-center opacity-0 group-hover:opacity-100 scale-75 group-hover:scale-100 transition-all duration-300 shadow-lg ${showOverlay ? "opacity-100 scale-100" : ""}`}>
        <svg className="w-4 h-4 text-black ml-0.5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M8 5v14l11-7z" />
        </svg>
      </div>
    </Link>
  );
};

export default TrackItem;
