import Image from "next/image";
import { getSpotifyTrackURL } from "@util";

type Props = {
  sourceId: string;
};

const ExternalLinks = ({ sourceId }: Props) => {
  return (
    <div className="flex justify-center">
      <a
        target="_blank"
        href={getSpotifyTrackURL(sourceId)}
        rel="noopener noreferrer"
      >
        <Image
          src={`/images/icon-spotify.png`}
          width={32}
          height={32}
          alt="Listen on Spotify"
          title="Listen on Spotify"
          unoptimized
          className="hover:scale-110 transition-transform"
        />
      </a>
    </div>
  );
};

export default ExternalLinks;
