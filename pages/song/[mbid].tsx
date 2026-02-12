import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { TrackV3 } from "@types";
import TrackHero from "@components/TrackHero";
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

  return (
    <>
      <TrackHero
        name={track.name}
        artist={track.artist}
        image={track.image}
        isrc={track.isrc}
        releaseDate={track.release_date}
        genres={track.genres || []}
      />

      <div className="bb-container pb-16">
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

        {track.releases?.length > 0 && (
          <div className="terminal-window mt-8">
            <div className="terminal-titlebar">releases</div>
            <div className="p-5">
              <Releases releases={track.releases} />
            </div>
          </div>
        )}
      </div>
    </>
  );
}
