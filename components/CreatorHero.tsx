import React from "react";
import GiantTitle from "@components/GiantTitle";
import Subtitle from "@components/Subtitle";
import Genres from "@components/Genres";
import type { ActiveYears } from "@types";

type Props = {
  name: string;
  type: string;
  disambiguation?: string;
  country?: string;
  area?: string;
  beginArea?: string;
  activeYears?: ActiveYears;
  genres: string[];
};

const formatActiveYears = (ay: ActiveYears): string => {
  if (!ay.begin && !ay.end) return "";
  const begin = ay.begin ? ay.begin.substring(0, 4) : "?";
  const end = ay.ended ? (ay.end ? ay.end.substring(0, 4) : "?") : "present";
  return `${begin} – ${end}`;
};

// Each type gets a distinct color vibe
const typeConfig: Record<string, { gradient: string; glow: string; badge: string }> = {
  Person: {
    gradient: "from-violet/15 via-cool/8 to-transparent",
    glow: "from-violet/25 to-cool/10",
    badge: "text-violet border-violet/30",
  },
  Group: {
    gradient: "from-mint/15 via-cool/8 to-transparent",
    glow: "from-mint/25 to-cool/10",
    badge: "text-mint border-mint/30",
  },
  Orchestra: {
    gradient: "from-accent/15 via-warm/8 to-transparent",
    glow: "from-accent/25 to-warm/10",
    badge: "text-accent border-accent/30",
  },
  Choir: {
    gradient: "from-rose/15 via-violet/8 to-transparent",
    glow: "from-rose/25 to-violet/10",
    badge: "text-rose border-rose/30",
  },
};

const CreatorHero: React.FC<Props> = ({
  name,
  type,
  disambiguation,
  country,
  area,
  beginArea,
  activeYears,
  genres,
}) => {
  const config = typeConfig[type] || typeConfig.Person;

  const locationParts = [beginArea, area, country].filter(Boolean);
  const location = locationParts.length > 0 ? locationParts.join(" · ") : null;

  return (
    <div className="relative overflow-hidden">
      {/* Layered gradient background */}
      <div className={`absolute inset-0 z-0 bg-gradient-to-b ${config.gradient}`} />
      <div className="absolute inset-0 z-0 bg-gradient-to-br from-terminal-bg/0 via-terminal-bg/40 to-terminal-bg" />

      {/* Diffused color glow */}
      <div className="absolute top-8 left-1/2 -translate-x-1/2 md:left-[200px] md:translate-x-0 w-[500px] h-[500px] z-0">
        <div className={`w-full h-full rounded-full bg-gradient-to-br ${config.glow} blur-3xl opacity-50`} />
      </div>

      <div className="relative z-10 bb-container pt-24 pb-16">
        <div className="flex flex-col md:flex-row gap-10 md:gap-14 items-start">
          {/* Large monogram */}
          <div className="flex-shrink-0 w-full md:w-auto flex justify-center md:justify-start">
            <div className="relative w-[200px] h-[200px] md:w-[260px] md:h-[260px] border border-terminal-border/40 rounded-xl overflow-hidden flex items-center justify-center bg-terminal-surface/40 backdrop-blur-sm">
              <span className="font-display text-[7rem] md:text-[9rem] text-white/8 select-none leading-none">
                {name.charAt(0).toUpperCase()}
              </span>
              <div className="absolute bottom-4 left-0 right-0 flex justify-center">
                <span className={`bg-terminal-bg/60 backdrop-blur border rounded-full px-4 py-1.5 font-mono text-[11px] uppercase tracking-widest ${config.badge}`}>
                  {type || "Artist"}
                </span>
              </div>
            </div>
          </div>

          {/* Creator Info */}
          <div className="flex-1 min-w-0">
            <GiantTitle>{name}</GiantTitle>
            {disambiguation && <Subtitle>{disambiguation}</Subtitle>}

            <div className="flex flex-wrap items-center gap-x-5 gap-y-1 mt-4 mb-5">
              {location && (
                <span className="font-mono text-sm text-phosphor-dim tracking-wide">
                  📍 {location}
                </span>
              )}
              {activeYears && formatActiveYears(activeYears) && (
                <span className="font-mono text-sm text-phosphor-dim tracking-wide">
                  🎵 {formatActiveYears(activeYears)}
                </span>
              )}
            </div>

            {genres.length > 0 && <Genres genres={genres} />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatorHero;
