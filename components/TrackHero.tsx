import React from "react";
import Image from "next/image";
import Genres from "@components/Genres";

type Props = {
  name: string;
  artist: string;
  image: string;
  isrc?: string;
  releaseDate?: string;
  genres?: string[];
  children?: React.ReactNode;
};

const formatReleaseDate = (dateString: string): string => {
  try {
    const dateObj = new Date(dateString);
    if (isNaN(dateObj.getTime())) return "Unknown";
    const month = dateObj.toLocaleString("default", { month: "short" });
    const year = dateObj.getFullYear();
    return `${month} ${year}`;
  } catch {
    return "Unknown";
  }
};

const TrackHero: React.FC<Props> = ({ name, artist, image, isrc, releaseDate, genres = [], children }) => {
  return (
    <div className="relative overflow-hidden">
      {/* Full bleed blurred album art — properly dark so text reads */}
      <div className="absolute inset-0 z-0">
        {image && (
          <Image
            src={image}
            alt=""
            fill
            className="object-cover blur-2xl scale-125 opacity-50"
            unoptimized
            priority
          />
        )}
        {/* Dark overlay — warm black wash + bottom fade to page bg */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-black/65 to-[#faf9f7]" />
      </div>

      <div className="relative z-10 bb-container pt-14 pb-16 md:pt-20 md:pb-20">
        <div className="flex flex-col md:flex-row gap-8 md:gap-12 items-start">

          {/* Cover Art */}
          <div className="flex-shrink-0 w-full md:w-auto flex justify-center md:justify-start">
            <div className="relative w-[200px] h-[200px] md:w-[260px] md:h-[260px] rounded-xl overflow-hidden shadow-2xl ring-1 ring-white/10">
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
          <div className="flex-1 min-w-0 flex flex-col justify-end">
            {/* Eyebrow */}
            <p className="text-[11px] font-mono font-semibold uppercase tracking-[0.18em] text-white/50 mb-3">
              Track
            </p>

            {/* Title */}
            <h1
              title={isrc}
              className="font-display font-bold text-white leading-[0.92] tracking-tight break-words mb-3"
              style={{ fontSize: "clamp(2.2rem, 7vw, 6rem)" }}
            >
              {name}
            </h1>

            {/* Artist */}
            <h2
              className="font-display font-semibold text-white/80 tracking-tight mb-3"
              style={{ fontSize: "clamp(1.1rem, 3vw, 2rem)", lineHeight: 1.15 }}
            >
              {artist}
            </h2>

            {/* Meta row */}
            {releaseDate && (
              <p className="font-mono text-xs text-white/45 uppercase tracking-wider mb-4">
                Released {formatReleaseDate(releaseDate)}
              </p>
            )}

            {/* Genres */}
            {genres.length > 0 && (
              <div className="mb-5">
                <Genres genres={genres} light />
              </div>
            )}

            {/* Action row */}
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrackHero;
