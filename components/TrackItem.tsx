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
      className="block group relative w-full aspect-square overflow-hidden rounded-md transition-all duration-200 group-hover:ring-2 group-hover:ring-blue-500 group-hover:ring-offset-2 group-hover:ring-offset-black group-hover:scale-105"
      onTouchStart={() => setShowOverlay((v) => !v)}
      onMouseLeave={() => setShowOverlay(false)}
    >
      <Image
        src={track.image}
        alt={track.name}
        width={600}
        height={600}
        className="w-full h-full object-cover"
        priority
      />
      <div
        className={`absolute inset-0 flex flex-col items-center justify-center bg-black/70 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 px-2 text-center ${showOverlay ? "opacity-100" : ""}`}
        style={{ pointerEvents: "none" }}
      >
        <div className="font-bold text-base md:text-lg truncate w-full" style={{ pointerEvents: "auto" }}>
          {track.name}
        </div>
        <div className="text-xs md:text-sm text-gray-200 truncate w-full mt-1" style={{ pointerEvents: "auto" }}>
          {track.artist}
        </div>
      </div>
    </Link>
  );
};

export default TrackItem;
