import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { TrackV3 } from "@types";
import TrackHero from "@components/TrackHero";
import ExternalLinks from "@components/ExternalLinks";
import Relations from "@components/Relations";
import Releases from "@components/Releases";

export default function Track() {
  const router = useRouter();
  const { mbid } = router.query;
  const [track, setTrack] = useState<TrackV3 | null>(null);

  useEffect(() => {
    if (!mbid) return;
    const fetchTrack = async () => {
      const resp = await fetch(`/api/song?mbid=${mbid}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      const data = await resp.json();
      setTrack(data);
    };
    fetchTrack();
  }, [mbid]);

  if (!track) {
    return (
      <div className="bb-container pt-24 pb-8">
        <div className="font-mono text-xs text-phosphor-dim animate-pulse">Loading...</div>
      </div>
    );
  }

  // Extract spotify link for play button
  const spotifyLink = track.links?.find((l) => l.type === "spotify");
  const spotifyUri = spotifyLink?.url
    ? `spotify:track:${spotifyLink.url.split("/").pop()}`
    : null;

  return (
    <>
      <TrackHero
        name={track.name}
        artist={track.artist}
        image={track.image}
        isrc={track.isrc}
        releaseDate={track.release_date}
        genres={track.genres || []}
      >
        {/* Action Row */}
        <div className="flex items-center gap-3 mt-6 flex-wrap">
          <ExternalLinks links={track.links} />
          {spotifyUri && (
            <button
              onClick={() => window.open(spotifyLink!.url, "_blank")}
              className="border border-terminal-border text-phosphor-dim hover:border-accent/50 hover:text-accent font-mono text-[10px] rounded px-3 py-1.5 transition-all flex items-center gap-1.5"
            >
              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
              Play
            </button>
          )}
        </div>
      </TrackHero>

      <div className="bb-container pb-16">
        {/* Releases — promoted to top */}
        {track.releases?.length > 0 && (
          <div className="terminal-window mt-8">
            <div className="terminal-titlebar">releases</div>
            <div className="p-5">
              <Releases releases={track.releases} />
            </div>
          </div>
        )}

        {/* Credits */}
        {((track.instruments?.length > 0) || (track.production_credits?.length > 0) || (track.song_credits?.length > 0)) && (
          <div className="terminal-window mt-8">
            <div className="terminal-titlebar">credits</div>
            <div className="p-5">
              <Relations
                instruments={track.instruments || []}
                production_credits={track.production_credits || []}
                song_credits={track.song_credits || []}
              />
            </div>
          </div>
        )}
      </div>
    </>
  );
}
