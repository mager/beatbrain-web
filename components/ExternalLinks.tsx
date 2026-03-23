import Image from "next/image";
import type { Link } from "@types";

type Props = {
  links?: Link[];
  sourceId?: string;
  light?: boolean;
};

const iconMap: Record<string, { src: string; label: string }> = {
  spotify: { src: "/images/icon-spotify.png", label: "Spotify" },
  genius: { src: "/images/icon-genius.png", label: "Genius" },
};

// Convert a Spotify web URL to a spotify: deep link URI
const toSpotifyUri = (url: string): string => {
  const trackId = url.split("/").pop()?.split("?")[0];
  return trackId ? `spotify:track:${trackId}` : url;
};

const ExternalLinks = ({ links, sourceId, light = false }: Props) => {
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
        const href =
          link.type === "spotify" ? toSpotifyUri(link.url) : link.url;
        const isDeepLink = href.startsWith("spotify:");

        return (
          <a
            key={link.url}
            href={href}
            {...(!isDeepLink && { target: "_blank", rel: "noopener noreferrer" })}
            className={`inline-flex items-center gap-2 border rounded px-3 py-1.5 font-mono text-[10px] transition-all ${
            light
              ? "border-white/25 text-white/70 hover:border-white/60 hover:text-white"
              : "border-terminal-border text-phosphor-dim hover:border-accent/50 hover:text-accent"
          }`}
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
