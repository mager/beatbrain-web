import Image from "next/image";
import type { Link } from "@types";

type Props = {
  links?: Link[];
  sourceId?: string; // legacy fallback for ext/spotify pages
};

const iconMap: Record<string, { src: string; label: string }> = {
  spotify: { src: "/images/icon-spotify.png", label: "Spotify" },
  genius: { src: "/images/icon-genius.png", label: "Genius" },
};

const ExternalLinks = ({ links, sourceId }: Props) => {
  // Build link list: prefer links[] from MusicBrainz, fall back to sourceId
  const resolvedLinks: { type: string; url: string }[] = [];

  if (links && links.length > 0) {
    resolvedLinks.push(...links);
  } else if (sourceId) {
    resolvedLinks.push({
      type: "spotify",
      url: `https://open.spotify.com/track/${sourceId}`,
    });
  }

  if (resolvedLinks.length === 0) return null;

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {resolvedLinks.map((link) => {
        const icon = iconMap[link.type];
        return (
          <a
            key={link.url}
            target="_blank"
            href={link.url}
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 border border-terminal-border rounded px-3 py-1.5 font-mono text-[10px] text-phosphor-dim hover:border-accent/50 hover:text-accent transition-all"
          >
            {icon && (
              <Image
                src={icon.src}
                width={16}
                height={16}
                alt={icon.label}
                unoptimized
                className="w-4 h-4"
              />
            )}
            <span>{icon?.label || link.type}</span>
          </a>
        );
      })}
    </div>
  );
};

export default ExternalLinks;
