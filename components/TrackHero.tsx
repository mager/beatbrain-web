import React from "react";
import Image from "next/image";
import GiantTitle from "@components/GiantTitle";
import Subtitle from "@components/Subtitle";
import Meta from "@components/Meta";
import Genres from "@components/Genres";

type Props = {
  name: string;
  artist: string;
  image: string;
  isrc?: string;
  releaseDate?: string;
  genres?: string[];
  children?: React.ReactNode; // action row, saved by, etc.
};

const formatReleaseDate = (dateString: string): string => {
  try {
    const dateObj = new Date(dateString);
    if (isNaN(dateObj.getTime())) return "Invalid Date";
    const month = dateObj.toLocaleString("default", { month: "short" });
    const year = dateObj.getFullYear();
    return `Released in ${month} ${year}`;
  } catch (e) {
    return "Unknown Release Date";
  }
};

const TrackHero: React.FC<Props> = ({ name, artist, image, isrc, releaseDate, genres = [], children }) => {
  return (
    <div className="relative overflow-hidden">
      {/* Blurred background */}
      {image && (
        <div className="absolute inset-0 z-0">
          <Image
            src={image}
            alt=""
            fill
            className="object-cover blur-3xl scale-110 opacity-20"
            unoptimized
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-terminal-bg/40 via-terminal-bg/70 to-terminal-bg" />
        </div>
      )}

      <div className="relative z-10 bb-container pt-16 pb-10">
        <div className="flex flex-col md:flex-row gap-6 md:gap-10 items-start">
          {/* Cover Art */}
          <div className="flex-shrink-0 w-full md:w-auto flex justify-center md:justify-start">
            <div className="relative w-[240px] h-[240px] md:w-[280px] md:h-[280px] border border-terminal-border rounded-lg overflow-hidden group hover:shadow-glow-accent transition-shadow duration-500">
              <Image
                src={image || "/placeholder-image.png"}
                alt={name || "Track artwork"}
                fill
                className="object-cover"
                unoptimized
                priority
              />
            </div>
          </div>

          {/* Track Info */}
          <div className="flex-1 min-w-0">
            <GiantTitle title={isrc}>{name}</GiantTitle>
            <Subtitle>{artist}</Subtitle>
            {releaseDate && <Meta>{formatReleaseDate(releaseDate)}</Meta>}
            {genres.length > 0 && <Genres genres={genres} />}
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrackHero;
