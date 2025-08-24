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
  // For mobile tap overlay
  const [showOverlay, setShowOverlay] = useState(false);

  return (
    <Link
      href={`/song/${track.id}`}
      key={track.id}
      className="block group relative w-full aspect-square overflow-hidden"
      onTouchStart={() => setShowOverlay((v) => !v)}
      onMouseLeave={() => setShowOverlay(false)}
    >
      <Image
        src={track.image}
        alt={track.name}
        width={600}
        height={600}
        className="w-full h-full object-cover transition-transform duration-300 ease-in-out group-hover:scale-110"
        priority
        unoptimized
      />
      <div
        className={`absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent text-white transition-all duration-300 ease-in-out transform translate-y-full opacity-0 group-hover:translate-y-0 group-hover:opacity-100 ${
          showOverlay ? "translate-y-0 opacity-100" : ""
        }`}
      >
        <div className="font-bold text-base md:text-lg truncate w-full">
          {track.name}
        </div>
        <div className="text-xs md:text-sm text-gray-200 truncate w-full mt-1">
          {track.artist}
        </div>
      </div>
    </Link>
  );
};

export default TrackItem;