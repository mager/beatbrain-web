import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import {
  MagnifyingGlassIcon,
  ArrowUpRightIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { useAppContext } from "../../context/AppContext";
type Track = { id: string; name: string; artist: string; thumb: string | null };
export default function Create() {
  const router = useRouter();
  const {
    state: { user },
  } = useAppContext();
  const [query, setQuery] = useState(""),
    [tracks, setTracks] = useState<Track[]>([]),
    [selected, setSelected] = useState<Track | null>(null),
    [content, setContent] = useState(""),
    [searching, setSearching] = useState(false),
    [saving, setSaving] = useState(false),
    [error, setError] = useState("");
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
      await router.push(user?.username ? `/u/${user.username}` : "/");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSaving(false);
    }
  }
  return (
    <div className="compose-page">
      <Link href="/" className="back-link">
        Back to the room
      </Link>
      <h1>What’s on repeat?</h1>
      <p className="muted">One track. A few words. Your kind of people.</p>
      <form onSubmit={submit} className="form-stack compose-form">
        {!selected ? (
          <>
            <label htmlFor="track-search">Find a track</label>
            <div className="search-field">
              <MagnifyingGlassIcon width={20} />
              <input
                id="track-search"
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
          <div className="selected-track">
            {selected.thumb && (
              <img
                src={selected.thumb.replace(
                  "ab67616d00001e02",
                  "ab67616d0000b273",
                )}
                alt={`${selected.name} cover`}
                width={280}
                height={280}
              />
            )}
            <div>
              <h2>{selected.name}</h2>
              <p>{selected.artist}</p>
              <button
                type="button"
                className="text-button"
                onClick={() => {
                  setSelected(null);
                  setQuery("");
                }}
              >
                <XMarkIcon width={14} /> Change track
              </button>
            </div>
          </div>
        )}
        <label>
          Your note <span className="muted">(optional)</span>
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
          <button
            className="button button-primary"
            disabled={!selected || saving}
          >
            {saving ? "Posting…" : "Post to my feed"}
            <ArrowUpRightIcon width={18} />
          </button>
        </div>
        {error && (
          <p role="alert" className="form-error">
            {error}
          </p>
        )}
      </form>
    </div>
  );
}
