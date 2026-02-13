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
  Person: "from-indigo-600/30 via-purple-600/20 to-terminal-bg",
  Group: "from-emerald-600/30 via-teal-600/20 to-terminal-bg",
  Orchestra: "from-amber-600/30 via-orange-600/20 to-terminal-bg",
  Choir: "from-rose-600/30 via-pink-600/20 to-terminal-bg",
};

const typeIcons: Record<string, string> = {
  Person: "👤",
  Group: "👥",
  Orchestra: "🎻",
  Choir: "🎵",
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
  const icon = typeIcons[type] || "🎵";

  const locationParts = [beginArea, area, country].filter(Boolean);
  const location = locationParts.length > 0 ? locationParts.join(" · ") : null;

  return (
    <div className="relative overflow-hidden">
      {/* Gradient background based on type */}
      <div className={`absolute inset-0 z-0 bg-gradient-to-b ${gradient}`} />

      <div className="relative z-10 bb-container pt-24 pb-12">
        <div className="flex flex-col md:flex-row gap-8 md:gap-12 items-start">
          {/* Icon placeholder */}
          <div className="flex-shrink-0 w-full md:w-auto flex justify-center md:justify-start">
            <div className="relative w-[200px] h-[200px] md:w-[240px] md:h-[240px] border border-terminal-border rounded overflow-hidden flex items-center justify-center bg-terminal-surface/50">
              <span className="text-8xl">{icon}</span>
            </div>
          </div>

          {/* Creator Info */}
          <div className="flex-1 min-w-0">
            <div className="mb-2">
              <span className="inline-block bg-terminal-surface border border-terminal-border rounded-sm px-2.5 py-1 font-mono text-[10px] text-accent uppercase tracking-wider">
                {type || "Artist"}
              </span>
            </div>
            <GiantTitle>{name}</GiantTitle>
            {disambiguation && <Subtitle>{disambiguation}</Subtitle>}
            {location && <Meta>{location}</Meta>}
            {activeYears && formatActiveYears(activeYears) && (
              <Meta>{formatActiveYears(activeYears)}</Meta>
            )}
            {genres.length > 0 && <Genres genres={genres} />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatorHero;
