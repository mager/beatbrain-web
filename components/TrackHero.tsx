import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { formatReleaseDate } from "../lib/track-details";
import { MusicalNoteIcon } from "@heroicons/react/24/outline";

type Props = {
  name: string;
  artist: string;
  image: string;
  releaseDate?: string;
  children?: ReactNode;
  onArtworkLoad?: (image: HTMLImageElement) => void;
  headingLevel?: 1 | 2;
  afterArtist?: ReactNode;
  className?: string;
};
export default function TrackHero({
  name,
  artist,
  image,
  releaseDate,
  children,
  onArtworkLoad,
  headingLevel = 1,
  afterArtist,
  className = "",
}: Props) {
  const Heading = headingLevel === 1 ? "h1" : "h2";
  const date = formatReleaseDate(releaseDate);
  const [failedSource, setFailedSource] = useState("");
  const artwork = useRef<HTMLImageElement>(null);
  const onArtworkError = useCallback((img: HTMLImageElement) => {
    if (img.crossOrigin) {
      img.removeAttribute("crossorigin");
      img.src = image;
    } else setFailedSource(image);
  }, [image]);
  useEffect(() => {
    // A cached cover can finish loading before React attaches its load handler.
    const img = artwork.current;
    if (!img?.complete) return;
    if (img.naturalWidth > 0) onArtworkLoad?.(img);
    else onArtworkError(img);
  }, [image, onArtworkLoad, onArtworkError]);
  return (
    <section className={`room-container track-hero ${className}`}>
      {image && failedSource !== image ? (
        <img
          ref={artwork}
          key={image}
          className="track-cover"
          crossOrigin="anonymous"
          onLoad={(event) => onArtworkLoad?.(event.currentTarget)}
          onError={(event) => onArtworkError(event.currentTarget)}
          src={image.replace("ab67616d00001e02", "ab67616d0000b273")}
          alt={`${name} cover`}
          width={600}
          height={600}
        />
      ) : (
        <div className="missing-art track-cover">
          <MusicalNoteIcon width={64} />
        </div>
      )}
      <div className="track-info">
        <Heading className="track-title">{name}</Heading>
        <p className="track-artist">{artist}</p>
        {afterArtist}
        {date && <p className="track-release">Released {date}</p>}
        {children}
      </div>
    </section>
  );
}
