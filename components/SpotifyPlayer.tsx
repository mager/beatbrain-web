import React from "react";
import { useAppContext } from "../context/AppContext";

const PLAYER_HEIGHT = 80;

const SpotifyPlayer: React.FC = () => {
  const { state, setState } = useAppContext();
  const { currentTrackUri } = state;

  if (!currentTrackUri) return null;

  // Convert spotify:track:ID → embed URL
  const trackId = currentTrackUri.split(":").pop();
  if (!trackId) return null;

  const embedUrl = `https://open.spotify.com/embed/track/${trackId}?utm_source=generator&theme=0`;

  const dismiss = () => {
    setState((prev) => ({ ...prev, currentTrackUri: null, isPlaying: false }));
    if (typeof window !== "undefined") {
      localStorage.removeItem("currentTrackUri");
    }
  };

  return (
    <div
      className="fixed bottom-9 left-0 w-full z-40 border-t border-terminal-border bg-terminal-bg"
      style={{ height: `${PLAYER_HEIGHT}px` }}
    >
      <div className="relative w-full h-full">
        <iframe
          src={embedUrl}
          width="100%"
          height={PLAYER_HEIGHT}
          frameBorder="0"
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          loading="lazy"
          style={{ display: "block" }}
        />
        <button
          onClick={dismiss}
          aria-label="Close player"
          className="absolute top-1 right-2 text-phosphor-dim hover:text-accent font-mono text-xs transition-colors"
        >
          ✕
        </button>
      </div>
    </div>
  );
};

export { PLAYER_HEIGHT };
export default SpotifyPlayer;
