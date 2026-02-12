import Image from "next/image";
import { getSpotifyTrackURL } from "@util";

type Props = {
  sourceId: string;
};

const ExternalLinks = ({ sourceId }: Props) => {
  return (
    <div className="flex items-center gap-2">
      <a
        target="_blank"
        href={getSpotifyTrackURL(sourceId)}
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 border border-terminal-border rounded px-3 py-1.5 font-mono text-[10px] text-phosphor-dim hover:border-accent/50 hover:text-accent transition-all"
      >
        <Image
          src={`/images/icon-spotify.png`}
          width={16}
          height={16}
          alt="Spotify"
          unoptimized
          className="w-4 h-4"
        />
        <span>Spotify</span>
      </a>
    </div>
  );
};

export default ExternalLinks;
