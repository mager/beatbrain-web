import type { ReactNode } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import TrackHero from "./TrackHero";
import { useAlbumTheme } from "../lib/use-album-theme";
import type { SearchTrack } from "../lib/search-types";
import { trackReleaseLabel } from "../lib/track-details";

type Props = {
  track: SearchTrack;
  onChange: () => void;
  busy: boolean;
  children: ReactNode;
};

export default function SelectedTrack({ track, onChange, busy, children }: Props) {
  const { onArtworkLoad } = useAlbumTheme(track.thumb || "");
  const release = trackReleaseLabel(track);
  return (
    <div className="selected-track">
      <TrackHero
        name={track.name}
        artist={track.artist}
        image={track.thumb || ""}
        headingLevel={2}
        onArtworkLoad={onArtworkLoad}
        afterArtist={release ? <p className="track-release">{release}</p> : undefined}
      >
        <button type="button" className="text-button" disabled={busy} onClick={onChange}>
          <XMarkIcon width={16} aria-hidden="true" /> Change track
        </button>
        <div className="compose-note form-stack">{children}</div>
      </TrackHero>
    </div>
  );
}
