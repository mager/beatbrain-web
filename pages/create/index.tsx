import type { GetServerSideProps } from "next";
import { backendFetch } from "../../lib/backend";
import { SERVER_HOST } from "@util";
import { adaptTrack } from "@adapters/track";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import {
  MagnifyingGlassIcon,
  ArrowUpRightIcon,
} from "@heroicons/react/24/outline";
import SelectedTrack from "../../components/SelectedTrack";
type Track = { id: string; name: string; artist: string; thumb: string | null };
export const getServerSideProps: GetServerSideProps = async ({ query }) => {
  if (typeof query.track !== "string" || !/^[a-zA-Z0-9]{22}$/.test(query.track))
    return { props: { initialTrack: null } };
  try {
    let response = await backendFetch(
      `${SERVER_HOST}/v2/track?spotifyId=${query.track}`,
    );
    if (!response.ok)
      response = await backendFetch(
        `${SERVER_HOST}/track?spotifyId=${query.track}`,
      );
    if (!response.ok) throw new Error("Track unavailable");
    const data = await response.json();
    if (!data.track) throw new Error("Track unavailable");
    const track = adaptTrack(data);
    return {
      props: {
        initialTrack: {
          id: query.track,
          name: track.name,
          artist: track.artist,
          thumb: track.image || null,
        },
      },
    };
  } catch {
    return {
      props: {
        initialTrack: null,
        initialError: "Couldn’t load that track. Search for it below.",
      },
    };
  }
};
export default function Create({
  initialTrack,
  initialError = "",
}: {
  initialTrack: Track | null;
  initialError?: string;
}) {
  const router = useRouter();
  const searchInput = useRef<HTMLInputElement>(null);
  const restoreSearchFocus = useRef(false);
  const [query, setQuery] = useState(""),
    [tracks, setTracks] = useState<Track[]>([]),
    [selected, setSelected] = useState<Track | null>(initialTrack),
    [content, setContent] = useState(""),
    [searching, setSearching] = useState(false),
    [saving, setSaving] = useState(false),
    [error, setError] = useState(initialError);
  useEffect(() => {
    if (!selected && restoreSearchFocus.current) {
      searchInput.current?.focus({ preventScroll: true });
      restoreSearchFocus.current = false;
    }
  }, [selected]);
  useEffect(() => {
    setSelected(initialTrack);
    setError(initialError);
    setContent("");
    setQuery("");
  }, [initialTrack, initialError]);
  useEffect(() => {
    if (query.trim().length < 2 || selected) {
      setTracks([]);
      setSearching(false);
      return;
    }
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setSearching(true);
      setError("");
      try {
        const response = await fetch("/api/search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query }),
          signal: controller.signal,
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error);
        setTracks(data.results || []);
      } catch (e) {
        if (!controller.signal.aborted)
          setError(
            (e as Error).message || "Search did not finish. Please try again.",
          );
      } finally {
        if (!controller.signal.aborted) setSearching(false);
      }
    }, 300);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query, selected]);
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!selected) return;
    setSaving(true);
    setError("");
    try {
      const response = await fetch("/api/post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content,
          track: {
            source: "SPOTIFY",
            sourceId: selected.id,
            title: selected.name,
            artist: selected.artist,
            image: selected.thumb || "",
          },
        }),
      });
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.error || "Your track was not posted.");
      await router.push(data.profilePath || "/feed");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSaving(false);
    }
  }
  return (
    <div className={`compose-page${selected ? " compose-with-track" : ""}`}>
      <Link href="/feed" className="back-link">
        Back to Feed
      </Link>
      <h1>What’s on repeat?</h1>
      <form onSubmit={submit} className="form-stack compose-form">
        {!selected ? (
          <>
            <label htmlFor="track-search">Find a track</label>
            <div className="search-field">
              <MagnifyingGlassIcon width={20} />
              <input
                id="track-search"
                ref={searchInput}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Track or artist name"
                autoComplete="off"
                maxLength={200}
              />
            </div>
            <div aria-live="polite" className="field-hint">
              {searching
                ? "Finding your track…"
                : query.trim().length >= 2 && !tracks.length
                  ? "No tracks found. Try a different title or artist."
                  : "Search, then choose the cover."}
            </div>
            <ul className="search-results">
              {tracks.map((track) => (
                <li key={track.id}>
                  <button
                    type="button"
                    onClick={() => {
                      setSelected(track);
                      setError("");
                    }}
                  >
                    {track.thumb && (
                      <img src={track.thumb} width={56} height={56} alt="" />
                    )}
                    <span>
                      <strong>{track.name}</strong>
                      <span>{track.artist}</span>
                    </span>
                    <ArrowUpRightIcon width={18} />
                  </button>
                </li>
              ))}
            </ul>
          </>
        ) : (
          <SelectedTrack
            track={selected}
            busy={saving}
            onChange={() => {
              restoreSearchFocus.current = true;
              setSelected(null);
              setQuery("");
            }}
          >
            <label>
              <span>Your note <span className="muted">(optional)</span></span>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                maxLength={1000}
                rows={3}
                placeholder="The part you can’t stop thinking about…"
              />
            </label>
            <div className="compose-actions">
              <span className="field-hint">{content.length}/1000</span>
              <button className="button button-primary" disabled={saving}>
                {saving ? "Posting…" : "Post to my feed"}
                <ArrowUpRightIcon width={18} />
              </button>
            </div>
            {error && <p role="alert" className="form-error">{error}</p>}
          </SelectedTrack>
        )}
        {!selected && error && <p role="alert" className="form-error">{error}</p>}
      </form>
    </div>
  );
}
