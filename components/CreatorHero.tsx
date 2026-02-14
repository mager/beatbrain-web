import React from "react";
import GiantTitle from "@components/GiantTitle";
import Subtitle from "@components/Subtitle";
import Meta from "@components/Meta";
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

const typeGradients: Record<string, string> = {
  Person: "from-indigo-600/20 via-purple-600/10 to-transparent",
  Group: "from-emerald-600/20 via-teal-600/10 to-transparent",
  Orchestra: "from-amber-600/20 via-orange-600/10 to-transparent",
  Choir: "from-rose-600/20 via-pink-600/10 to-transparent",
};

const typeAccents: Record<string, string> = {
  Person: "from-indigo-500/30 to-purple-500/10",
  Group: "from-emerald-500/30 to-teal-500/10",
  Orchestra: "from-amber-500/30 to-orange-500/10",
  Choir: "from-rose-500/30 to-pink-500/10",
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
  const gradient = typeGradients[type] || typeGradients.Person;
  const accentGrad = typeAccents[type] || typeAccents.Person;

  const locationParts = [beginArea, area, country].filter(Boolean);
  const location = locationParts.length > 0 ? locationParts.join(" · ") : null;

  return (
    <div className="relative overflow-hidden">
      {/* Layered gradient background */}
      <div className={`absolute inset-0 z-0 bg-gradient-to-b ${gradient}`} />
      <div className="absolute inset-0 z-0 bg-gradient-to-br from-terminal-bg/0 via-terminal-bg/50 to-terminal-bg" />

      {/* Subtle radial glow behind the icon */}
      <div className="absolute top-16 left-1/2 -translate-x-1/2 md:left-[180px] md:translate-x-0 w-[400px] h-[400px] z-0">
        <div className={`w-full h-full rounded-full bg-gradient-to-br ${accentGrad} blur-3xl opacity-40`} />
      </div>

      <div className="relative z-10 bb-container pt-24 pb-16">
        <div className="flex flex-col md:flex-row gap-10 md:gap-14 items-start">
          {/* Type badge as a large monogram */}
          <div className="flex-shrink-0 w-full md:w-auto flex justify-center md:justify-start">
            <div className="relative w-[200px] h-[200px] md:w-[260px] md:h-[260px] border border-terminal-border/50 rounded-lg overflow-hidden flex items-center justify-center bg-terminal-surface/30 backdrop-blur-sm">
              <span className="font-display text-[7rem] md:text-[9rem] text-white/10 select-none leading-none">
                {name.charAt(0).toUpperCase()}
              </span>
              <div className="absolute bottom-3 left-0 right-0 flex justify-center">
                <span className="bg-terminal-surface/80 backdrop-blur border border-terminal-border rounded px-3 py-1 font-mono text-[11px] text-phosphor-dim uppercase tracking-widest">
                  {type || "Artist"}
                </span>
              </div>
            </div>
          </div>

          {/* Creator Info */}
          <div className="flex-1 min-w-0">
            <GiantTitle>{name}</GiantTitle>
            {disambiguation && <Subtitle>{disambiguation}</Subtitle>}

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-3 mb-4">
              {location && (
                <span className="font-mono text-sm text-phosphor-dim tracking-wide">
                  {location}
                </span>
              )}
              {activeYears && formatActiveYears(activeYears) && (
                <span className="font-mono text-sm text-phosphor-dim tracking-wide">
                  {formatActiveYears(activeYears)}
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
