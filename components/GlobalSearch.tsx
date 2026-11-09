import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { MagnifyingGlassIcon, MusicalNoteIcon, XMarkIcon } from "@heroicons/react/24/outline";
import type { SearchPayload } from "../lib/search-types";

type Option = { key: string; href: string; title: string; detail: string; image: string | null; kind: "person" | "music" };
const empty: SearchPayload = { results: [], people: [], unavailable: [] };

export default function GlobalSearch() {
  const router = useRouter();
  const id = useId().replace(/:/g, "");
  const root = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const request = useRef<AbortController | null>(null);
  const composing = useRef(false);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<SearchPayload>(empty);
  const [error, setError] = useState("");
  const [active, setActive] = useState(-1);
  const [retry, setRetry] = useState(0);
  const people: Option[] = data.people.map(person => ({ key: `person-${person.username}`, href: `/u/${encodeURIComponent(person.username)}`, title: person.name || person.username, detail: `@${person.username}`, image: person.image, kind: "person" }));
  const music: Option[] = data.results.map(track => ({ key: `track-${track.id}`, href: `/ext/spotify/${track.id}`, title: track.name, detail: track.artist, image: track.thumb, kind: "music" }));
  const options = [...people, ...music];

  function close() { request.current?.abort(); setOpen(false); setActive(-1); }
  function change(value: string) {
    request.current?.abort();
    setQuery(value); setOpen(true); setActive(-1); setData(empty); setError("");
    setLoading(value.trim().length >= 2);
  }
  useEffect(() => {
    setData(empty); setActive(-1); setError("");
    if (!open || query.trim().length < 2) { setLoading(false); return; }
    const controller = new AbortController();
    request.current = controller;
    setLoading(true);
    let timeout: ReturnType<typeof setTimeout>;
    const timer = setTimeout(async () => {
      timeout = setTimeout(() => { controller.abort(); setLoading(false); setError("Search took too long. Try again."); }, 12000);
      try {
        const response = await fetch("/api/search", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query: query.trim(), scope: "all" }), signal: controller.signal,
        });
        const result = await response.json();
        if (controller.signal.aborted) return;
        if (!response.ok) throw new Error(response.status === 401 ? "Your session ended. Sign in again to search." : "Search is unavailable. Try again.");
        if (!Array.isArray(result.results) || !Array.isArray(result.people) || !Array.isArray(result.unavailable)) throw new Error("Search is unavailable. Try again.");
        setData(result);
      } catch (failure) {
        if (!controller.signal.aborted) setError((failure as Error).message || "Search is unavailable. Try again.");
      } finally {
        clearTimeout(timeout);
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 250);
    return () => { clearTimeout(timer); clearTimeout(timeout); controller.abort(); };
  }, [query, open, retry]);

  useEffect(() => {
    const outside = (event: PointerEvent) => { if (!root.current?.contains(event.target as Node)) close(); };
    document.addEventListener("pointerdown", outside);
    return () => document.removeEventListener("pointerdown", outside);
  }, []);
  useEffect(() => { close(); setQuery(""); setData(empty); }, [router.asPath]);
  useEffect(() => {
    if (active >= 0) document.getElementById(`${id}-option-${active}`)?.scrollIntoView({ block: "nearest" });
  }, [active, id]);

  const status = loading ? "Searching music and people…" : error || (query.trim().length < 2 ? "Type at least two characters." : `${people.length} ${people.length === 1 ? "person" : "people"} and ${music.length} ${music.length === 1 ? "track" : "tracks"} found.`);
  function group(label: string, values: Option[], offset: number) {
    if (!values.length) return null;
    return <div role="group" aria-label={label}>
      <p className="global-search-group" aria-hidden="true">{label}</p>
      {values.map((option, index) => {
        const position = index + offset;
        return <Link key={option.key} id={`${id}-option-${position}`} href={option.href}
          role="option" aria-selected={active === position} tabIndex={-1}
          className="global-search-option" onMouseEnter={() => setActive(position)}
          onMouseDown={event => event.preventDefault()} onClick={close}>
          <span className={`global-search-art ${option.kind === "person" ? "is-person" : ""}`}>
            {option.image ? <img src={option.image} alt="" width={42} height={42} loading="lazy" referrerPolicy="no-referrer" onError={event => { event.currentTarget.style.display = "none"; }} /> : null}
            <span aria-hidden="true">{option.kind === "person" ? option.title.slice(0, 1).toUpperCase() : <MusicalNoteIcon width={19}/>}</span>
          </span>
          <span className="global-search-description"><strong>{option.title}</strong><span>{option.detail}</span></span>
        </Link>;
      })}
    </div>;
  }
  return <div className="global-search" ref={root} onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget as Node)) close(); }}>
    <div className="global-search-field">
      <MagnifyingGlassIcon width={18} aria-hidden="true" />
      <input ref={input} type="search" role="combobox" aria-label="Search music and people" placeholder="Music and people"
        autoComplete="off" maxLength={200} value={query} aria-expanded={open} aria-controls={open ? `${id}-results` : undefined}
        aria-autocomplete="list" aria-activedescendant={open && active >= 0 && options[active] ? `${id}-option-${active}` : undefined}
        onFocus={() => setOpen(true)} onChange={event => change(event.target.value)}
        onCompositionStart={() => { composing.current = true; }} onCompositionEnd={() => { composing.current = false; }}
        onKeyDown={event => {
          if (composing.current || event.nativeEvent.isComposing) return;
          if (event.key === "Escape") { event.preventDefault(); close(); return; }
          if (event.key === "ArrowDown" || event.key === "ArrowUp") {
            event.preventDefault(); setOpen(true);
            if (options.length) setActive(value => event.key === "ArrowDown" ? (value + 1) % options.length : (value <= 0 ? options.length - 1 : value - 1));
          }
          if (event.key === "Enter" && open && active >= 0 && options[active]) {
            event.preventDefault(); const href = options[active].href; close(); input.current?.blur(); void router.push(href);
          }
        }} />
      {query && <button type="button" aria-label="Clear search" className="global-search-clear" onClick={() => { change(""); input.current?.focus(); }}><XMarkIcon width={17} aria-hidden="true" /></button>}
    </div>
    {open && <div className="global-search-panel">
      <span className="sr-only" role="status" aria-live="polite">{status}</span>
      <div id={`${id}-results`} role="listbox" aria-label="Music and people results" aria-busy={loading}>
        {group("People", people, 0)}
        {group("Music", music, people.length)}
      </div>
      {(loading || query.trim().length < 2) && <p className="global-search-message">{status}</p>}
      {!loading && !error && query.trim().length >= 2 && !options.length && !data.unavailable.length && <p className="global-search-message">No matches for “{query.trim()}”.</p>}
      {!loading && (error || data.unavailable.length > 0) && <div className="global-search-message global-search-error">
        <p>{error || `${data.unavailable.includes("music") ? "Music" : "People"} search is unavailable.`}</p>
        <button type="button" onClick={() => setRetry(value => value + 1)}>Try again</button>
      </div>}
    </div>}
  </div>;
}
