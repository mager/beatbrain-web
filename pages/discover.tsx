import { useEffect, useState } from "react";
import Link from "next/link";
import Head from "next/head";
import { ArrowUpRightIcon, PlusIcon } from "@heroicons/react/24/outline";
import AlbumArtwork from "../components/AlbumArtwork";
import type { Track } from "@types";

export default function Discover() {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [updated, setUpdated] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 12000);
    let active = true;
    setLoading(true);
    setError(false);
    async function load() {
      try {
        const response = await fetch("/api/discover", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: "{}",
          signal: controller.signal,
        });
        if (!response.ok) throw new Error("Discovery unavailable");
        const data = await response.json();
        if (!Array.isArray(data.tracks))
          throw new Error("Invalid discovery response");
        if (!active) return;
        const seen = new Set<string>();
        setTracks(
          data.tracks.filter((track: Track) => {
            if (!track?.source_id || !track.name || seen.has(track.source_id))
              return false;
            seen.add(track.source_id);
            return true;
          }),
        );
        setUpdated(typeof data.updated === "string" ? data.updated : "");
      } catch {
        if (active) setError(true);
      } finally {
        clearTimeout(timer);
        if (active) setLoading(false);
      }
    }
    void load();
    return () => {
      active = false;
      controller.abort();
      clearTimeout(timer);
    };
  }, [attempt]);

  const date = updated ? new Date(updated) : null;
  const dateLabel =
    date && !Number.isNaN(date.getTime())
      ? date.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          timeZone: "UTC",
        })
      : "";
  return (
    <div className="room-container discover-page">
      <Head>
        <title>Discover — Beatbrain</title>
      </Head>
      <header className="collection-heading">
        <h1 className="display-title">Discover</h1>
        {!loading && !error && tracks.length > 0 && (
          <p>
            {tracks.length} tracks
            {dateLabel && (
              <>
                {" "}
                <span aria-hidden="true">/</span> Updated {dateLabel}
              </>
            )}
          </p>
        )}
      </header>
      {loading ? (
        <div
          className="discover-grid"
          role="status"
          aria-label="Loading discoveries"
        >
          {Array.from({ length: 10 }, (_, i) => (
            <div key={i} className={`discovery-skeleton${i === 0 ? " discovery-lead" : ""}`} aria-hidden="true">
              <div />
              <span />
              <span />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="empty-state" role="alert">
          <h2>Couldn’t load the music.</h2>
          <p>Try again in a moment.</p>
          <button
            className="button button-secondary"
            onClick={() => setAttempt((n) => n + 1)}
          >
            Try again
          </button>
        </div>
      ) : tracks.length === 0 ? (
        <div className="empty-state">
          <h2>No discoveries yet.</h2>
          <p>New tracks will appear here.</p>
          <button
            className="button button-secondary"
            onClick={() => setAttempt((n) => n + 1)}
          >
            Check again
          </button>
        </div>
      ) : (
        <div className="discover-grid">
          {tracks.map((track, index) => (
            <article key={track.source_id} className={`discovery-track${index === 0 ? " discovery-lead" : ""}`}>
              <AlbumArtwork
                src={track.image || ""}
                title={`${track.name} by ${track.artist}`}
                href={`/ext/spotify/${track.source_id}`}
                priority={index === 0}
              />
              <div className="post-track">
                <div>
                  <h2>
                    <Link href={`/ext/spotify/${track.source_id}`}>
                      {track.name}
                    </Link>
                  </h2>
                  <p>{track.artist}</p>
                </div>
                <a
                  className="listen-link"
                  href={`https://open.spotify.com/track/${track.source_id}`}
                  aria-label={`Listen to ${track.name} on Spotify`}
                  target="_blank"
                  rel="noreferrer"
                >
                  <ArrowUpRightIcon width={18} />
                </a>
              </div>
              {index === 0 && (
                <Link className="discovery-post-link" href={`/create?track=${track.source_id}`}>
                  <PlusIcon width={17} aria-hidden="true" /> Post this track
                </Link>
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
