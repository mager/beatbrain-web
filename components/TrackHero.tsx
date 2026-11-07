import type { ReactNode } from "react";
import { MusicalNoteIcon } from "@heroicons/react/24/outline";

type Props = {
  name: string;
  artist: string;
  image: string;
  releaseDate?: string;
  children?: ReactNode;
};
export default function TrackHero({
  name,
  artist,
  image,
  releaseDate,
  children,
}: Props) {
  const date = releaseDate ? new Date(releaseDate) : null;
  return (
    <section className="room-container track-hero">
      {image ? (
        <img
          className="track-cover"
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
      <div>
        <h1>{name}</h1>
        <p className="track-artist">{artist}</p>
        {date && !Number.isNaN(date.getTime()) && (
          <p className="track-release">
            Released{" "}
            {date.toLocaleDateString("en-US", {
              month: "long",
              year: "numeric",
              timeZone: "UTC",
            })}
          </p>
        )}
        {children}
      </div>
    </section>
  );
}
