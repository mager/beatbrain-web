import React, { useEffect, useRef, useState } from "react";
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

const TrackHero: React.FC<Props> = ({
  name,
  artist,
  image,
  isrc,
  releaseDate,
  genres = [],
  children,
}) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Trigger entrance animations after mount
    const t = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(t);
  }, []);

  return (
    <div className="relative overflow-hidden bg-[#0d0c0b]">
      {/* ── Full-bleed blurred album art bg ── */}
      {image && (
        <div className="absolute inset-0 z-0">
          <Image
            src={image}
            alt=""
            fill
            className="object-cover blur-3xl scale-110 opacity-40"
            unoptimized
            priority
          />
          {/* Cinematic overlay — stays dark, never bleeds to page bg */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/70 to-black/80" />
          {/* Subtle vignette edges */}
          <div className="absolute inset-0"
            style={{
              background: "radial-gradient(ellipse at 50% 0%, transparent 40%, rgba(0,0,0,0.6) 100%)"
            }}
          />
        </div>
      )}

      {/* ── Hero Content ── */}
      <div className="relative z-10 bb-container pt-10 pb-0 md:pt-16">
        <div className="flex flex-col md:flex-row gap-8 md:gap-14 items-center md:items-end">

          {/* ─── Album Art ─── */}
          <div
            className="flex-shrink-0 flex justify-center md:justify-start"
            style={{
              opacity: mounted ? 1 : 0,
              transform: mounted ? "translateY(0) scale(1)" : "translateY(20px) scale(0.96)",
              transition: "opacity 0.55s cubic-bezier(0.22,1,0.36,1), transform 0.55s cubic-bezier(0.22,1,0.36,1)",
            }}
          >
            {/* Vinyl ring peek behind the cover */}
            <div className="relative">
              {/* Vinyl disc peeking out (subtle ring) */}
              <div
                className="absolute -right-4 top-1/2 -translate-y-1/2 rounded-full bg-[#1a1a1a] border border-white/5"
                style={{
                  width: "clamp(160px, 28vw, 280px)",
                  height: "clamp(160px, 28vw, 280px)",
                  boxShadow: "0 0 40px rgba(0,0,0,0.6)",
                }}
              >
                {/* Groove rings */}
                <div className="absolute inset-[15%] rounded-full border border-white/5" />
                <div className="absolute inset-[30%] rounded-full border border-white/5" />
                <div className="absolute inset-[45%] rounded-full bg-[#111]" />
                <div className="absolute inset-[48%] rounded-full bg-[#1a1a1a] border border-white/10" />
              </div>

              {/* Cover art */}
              <div
                className="relative z-10 rounded-xl overflow-hidden ring-1 ring-white/10"
                style={{
                  width: "clamp(160px, 26vw, 260px)",
                  height: "clamp(160px, 26vw, 260px)",
                  boxShadow:
                    "0 20px 60px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.05)",
                }}
              >
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
          </div>

          {/* ─── Track Info ─── */}
          <div className="flex-1 min-w-0 flex flex-col text-center md:text-left pb-10 md:pb-12">
            {/* Eyebrow label */}
            <p
              className="text-[10px] font-mono font-semibold uppercase tracking-[0.22em] text-white/40 mb-3"
              style={{
                opacity: mounted ? 1 : 0,
                transform: mounted ? "translateY(0)" : "translateY(12px)",
                transition: "opacity 0.45s 0.05s cubic-bezier(0.22,1,0.36,1), transform 0.45s 0.05s cubic-bezier(0.22,1,0.36,1)",
              }}
            >
              Track
            </p>

            {/* Title */}
            <h1
              title={isrc}
              className="font-display font-bold text-white leading-[0.9] tracking-tight break-words mb-2"
              style={{
                fontSize: "clamp(2rem, 6.5vw, 5.5rem)",
                opacity: mounted ? 1 : 0,
                transform: mounted ? "translateY(0)" : "translateY(16px)",
                transition: "opacity 0.5s 0.1s cubic-bezier(0.22,1,0.36,1), transform 0.5s 0.1s cubic-bezier(0.22,1,0.36,1)",
              }}
            >
              {name}
            </h1>

            {/* Artist — accent color */}
            <h2
              className="font-display font-semibold tracking-tight mb-2"
              style={{
                fontSize: "clamp(1rem, 2.8vw, 1.9rem)",
                lineHeight: 1.15,
                color: "var(--accent)",
                opacity: mounted ? 1 : 0,
                transform: mounted ? "translateY(0)" : "translateY(12px)",
                transition: "opacity 0.5s 0.17s cubic-bezier(0.22,1,0.36,1), transform 0.5s 0.17s cubic-bezier(0.22,1,0.36,1)",
              }}
            >
              {artist}
            </h2>

            {/* Release date */}
            {releaseDate && (
              <p
                className="font-mono text-[11px] text-white/35 uppercase tracking-wider mb-4"
                style={{
                  opacity: mounted ? 1 : 0,
                  transition: "opacity 0.4s 0.24s cubic-bezier(0.22,1,0.36,1)",
                }}
              >
                Released {formatReleaseDate(releaseDate)}
              </p>
            )}

            {/* Genres */}
            {genres.length > 0 && (
              <div
                className="mb-5 flex justify-center md:justify-start"
                style={{
                  opacity: mounted ? 1 : 0,
                  transition: "opacity 0.4s 0.3s cubic-bezier(0.22,1,0.36,1)",
                }}
              >
                <Genres genres={genres} light />
              </div>
            )}

            {/* Action row (children — Save + Spotify links) */}
            <div
              style={{
                opacity: mounted ? 1 : 0,
                transition: "opacity 0.4s 0.38s cubic-bezier(0.22,1,0.36,1)",
              }}
            >
              {children}
            </div>
          </div>
        </div>
      </div>

      {/* ── Bottom transition: dark → page bg ── */}
      <div
        className="relative z-10 h-10"
        style={{
          background: "linear-gradient(to bottom, transparent, #faf9f7)",
        }}
      />
    </div>
  );
};

export default TrackHero;
