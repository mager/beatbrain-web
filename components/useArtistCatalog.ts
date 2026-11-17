import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import { parseArtistPayload, type ArtistPayload, type ArtistSection } from "../lib/artist";

type Section = Exclude<ArtistSection, "all">;
type LoadState = { loading: boolean; automatic: boolean; stopped: boolean; error: string };
const idle: LoadState = { loading: false, automatic: false, stopped: false, error: "" };

class CatalogError extends Error {
  constructor(message: string, readonly status = 0) { super(message); }
}

function appendUnique<T extends { id: string }>(previous: T[], incoming: T[]): T[] {
  const items = new Map(previous.map(item => [item.id, item]));
  incoming.forEach(item => { if (!items.has(item.id)) items.set(item.id, item); });
  return Array.from(items.values());
}

async function requestCatalog(
  spotifyId: string,
  controller: AbortController,
  context: { section: ArtistSection; cursor?: string; offset?: number },
) {
  const params = new URLSearchParams({ spotifyId, section: context.section });
  if (context.cursor !== undefined) params.set("cursor", context.cursor);
  if (context.offset !== undefined) params.set("offset", String(context.offset));
  const label = context.section === "all" ? "artist" : context.section;
  let timedOut = false;
  const timer = setTimeout(() => { timedOut = true; controller.abort(); }, 12000);
  try {
    const response = await fetch(`/api/artist?${params}`, { signal: controller.signal });
    if (!response.ok) {
      const message = response.status === 401 ? "Your session ended. Sign in again to view this artist."
        : response.status === 404 ? "This artist was not found on Spotify."
          : response.status === 400 ? "This artist link is invalid."
            : response.status === 429 ? "Spotify is busy. Wait a moment, then try again."
              : response.status === 504 ? `The ${label} took too long to load. Try again.`
                : `The ${label} could not load. Try again.`;
      throw new CatalogError(message, response.status);
    }
    const result = parseArtistPayload(await response.json(), spotifyId, context);
    if (!result) throw new CatalogError(`The ${label} could not load. Try again.`);
    return result;
  } catch (error) {
    if (timedOut) throw new CatalogError(`The ${label} took too long to load. Try again.`, 504);
    throw error;
  } finally {
    clearTimeout(timer);
  }
}

export function useArtistCatalog(spotifyId: string) {
  const router = useRouter();
  const [data, setData] = useState<ArtistPayload | null>(null);
  const [initial, setInitial] = useState({ loading: true, error: "", status: 0 });
  const [songs, setSongs] = useState<LoadState>(idle);
  const [releases, setReleases] = useState<LoadState>(idle);
  const confirmed = useRef<ArtistPayload | null>(null);
  const mounted = useRef(false);
  const sessionEnded = useRef(false);
  const controllers = useRef<Record<ArtistSection, AbortController | null>>({ all: null, songs: null, releases: null });
  const lastPosition = useRef({ songs: "0.0", releases: 0 });

  function commit(next: ArtistPayload | null) {
    confirmed.current = next;
    setData(next);
  }

  function current(section: ArtistSection, controller: AbortController) {
    return mounted.current && controllers.current[section] === controller;
  }

  function abortAll() {
    for (const section of ["all", "songs", "releases"] as const) {
      controllers.current[section]?.abort();
      controllers.current[section] = null;
    }
  }

  function expireSession(message: string) {
    sessionEnded.current = true;
    abortAll();
    commit(null);
    setInitial({ loading: false, error: message, status: 401 });
    setSongs(idle);
    setReleases(idle);
  }

  async function loadInitial() {
    if (controllers.current.all || sessionEnded.current) return;
    const controller = new AbortController();
    controllers.current.all = controller;
    setInitial({ loading: true, error: "", status: 0 });
    try {
      const result = await requestCatalog(spotifyId, controller, { section: "all" });
      if (!current("all", controller) || controller.signal.aborted) return;
      commit({ ...result, tracks: appendUnique([], result.tracks), albums: appendUnique([], result.albums) });
      setSongs({ ...idle, error: result.unavailable.includes("tracks") ? "Some songs could not load. Try again to continue." : "" });
      setReleases({ ...idle, error: result.unavailable.includes("albums") ? "Some releases could not load. Try again to continue." : "" });
    } catch (error) {
      if (!current("all", controller)) return;
      if (error instanceof CatalogError && error.status === 401) {
        expireSession(error.message);
        return;
      }
      setInitial({ loading: false, error: error instanceof CatalogError ? error.message : "The artist could not load. Try again.",
        status: error instanceof CatalogError ? error.status : 0 });
    } finally {
      if (current("all", controller)) {
        controllers.current.all = null;
        setInitial(previous => ({ ...previous, loading: false }));
      }
    }
  }

  async function load(section: Section, automatic = false) {
    const previous = confirmed.current;
    if (!previous || controllers.current.all || controllers.current[section] || sessionEnded.current) return;
    const unavailable = section === "songs" ? "tracks" : "albums";
    let position = section === "songs" ? previous.next_cursor : previous.next_release_offset;
    if (position === null && !previous.unavailable.includes(unavailable)) return;
    position ??= lastPosition.current[section];
    const controller = new AbortController();
    controllers.current[section] = controller;
    const setSection = section === "songs" ? setSongs : setReleases;
    setSection({ loading: true, automatic, stopped: false, error: "" });
    try {
      do {
        const context = section === "songs"
          ? { section, cursor: position as string }
          : { section, offset: position as number };
        if (section === "songs") lastPosition.current.songs = position as string;
        else lastPosition.current.releases = position as number;
        const result = await requestCatalog(spotifyId, controller, context);
        if (!current(section, controller) || controller.signal.aborted || !confirmed.current) return;
        const saved = confirmed.current;
        const partial = result.unavailable.includes(unavailable);
        const nextUnavailable = saved.unavailable.filter(item => item !== unavailable);
        if (partial) nextUnavailable.push(unavailable);
        commit({
          ...saved,
          release_total: Math.max(saved.release_total, result.release_total),
          unavailable: nextUnavailable,
          ...(section === "songs" ? {
            tracks: appendUnique(saved.tracks, result.tracks),
            next_cursor: result.next_cursor,
            scanned_releases: Math.max(saved.scanned_releases, result.scanned_releases),
          } : {
            albums: appendUnique(saved.albums, result.albums),
            next_release_offset: result.next_release_offset,
          }),
        });
        if (partial) {
          setSection(state => ({ ...state, error: `Some ${section} could not load. Try again to continue.` }));
          break;
        }
        position = section === "songs" ? result.next_cursor : result.next_release_offset;
      } while (automatic && position !== null && current(section, controller) && !controller.signal.aborted);
    } catch (error) {
      if (!current(section, controller)) return;
      if (error instanceof CatalogError && error.status === 401) {
        expireSession(error.message);
        return;
      }
      setSection(state => ({ ...state,
        error: error instanceof CatalogError ? error.message : `The ${section} could not load. Try again.` }));
    } finally {
      if (current(section, controller)) {
        controllers.current[section] = null;
        setSection(state => ({ ...state, loading: false, automatic: false }));
      }
    }
  }

  function stop(section: Section) {
    controllers.current[section]?.abort();
    controllers.current[section] = null;
    const setSection = section === "songs" ? setSongs : setReleases;
    setSection(state => ({ ...state, loading: false, automatic: false, stopped: true }));
  }

  useEffect(() => {
    mounted.current = true;
    void loadInitial();
    const onRouteChange = () => {
      abortAll();
      setInitial(state => state.loading ? { loading: false, status: 0, error: "Loading stopped. Try again." } : state);
      setSongs(state => ({ ...state, loading: false, automatic: false, stopped: state.loading || state.stopped }));
      setReleases(state => ({ ...state, loading: false, automatic: false, stopped: state.loading || state.stopped }));
    };
    router.events.on("routeChangeStart", onRouteChange);
    return () => {
      mounted.current = false;
      abortAll();
      router.events.off("routeChangeStart", onRouteChange);
    };
    // ArtistCatalog is keyed by Spotify ID, so each artist has its own lifetime.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spotifyId, router.events]);

  return { data, initial, songs, releases, retryInitial: loadInitial, load, stop };
}
