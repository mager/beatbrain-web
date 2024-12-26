import React from "react";
import Link from "next/link";
import Image from "next/image";

interface TrackItemProps {
  track: {
    source_id: string;
    image: string;
    name: string;
    artist: string;
  };
}

const TrackItem: React.FC<TrackItemProps> = ({ track }) => (
  <Link
    href={`/ext/spotify/${track.source_id}`}
    key={track.source_id}
    className="block hover:opacity-75 transition-opacity"
  >
    <div className="flex flex-row lg:flex-col max-w-full">
      <Image
        src={track.image}
        alt={track.name}
        width={300}
        height={300}
        className="w-[100px] h-[100px] lg:w-[300px] lg:h-[300px] object-cover flex-shrink-0"
      />
      <div className="ml-4 lg:ml-0 lg:mt-2 flex flex-col justify-center min-w-0">
        <div className="font-bold text-xl truncate max-w-full">
          {track.name}
        </div>
        <div className="text-sm text-gray-600 truncate max-w-full">
          {track.artist}
        </div>
      </div>
    </div>
  </Link>
);

export default TrackItem;
