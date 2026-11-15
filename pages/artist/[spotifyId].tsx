import { useEffect, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { ArrowUpRightIcon, MusicalNoteIcon } from "@heroicons/react/24/outline";
import AlbumArtwork from "../../components/AlbumArtwork";
import SpotifyLogo from "../../components/SpotifyLogo";
import { parseArtistPayload, validSpotifyId, type ArtistPayload } from "../../lib/artist";
import { formatReleaseDate } from "../../lib/track-details";
import styles from "../artist.module.css";

function Artwork({ src, name, portrait = false }: { src: string | null; name: string; portrait?: boolean }) {
  const [failed, setFailed] = useState(false);
  return <div className={portrait ? styles.portrait : styles.releaseArt}>
    {src && !failed
      ? <img src={src} alt={portrait ? name : `${name} cover`} width={400} height={400}
          loading={portrait ? "eager" : "lazy"} referrerPolicy="no-referrer" onError={() => setFailed(true)} />
      : <span className={styles.missingArt} aria-label={portrait ? `No photo for ${name}` : `No cover for ${name}`}>
          <MusicalNoteIcon width={40} aria-hidden="true" />
        </span>}
  </div>;
}

function ArtistCatalog({ spotifyId }: { spotifyId: string }) {
  const [data, setData] = useState<ArtistPayload | null>(null);
  const [offset, setOffset] = useState(0);
  const [attempt, setAttempt] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [status, setStatus] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    let message = "The artist is unavailable. Try again.";
    setLoading(true);
    setError("");
    setStatus(0);
    const timer = setTimeout(() => {
      controller.abort();
      if (active) {
        setLoading(false);
        setError("The artist took too long to load. Try again.");
      }
    }, 12000);
    async function load() {
      try {
        const response = await fetch(`/api/artist?spotifyId=${spotifyId}&offset=${offset}`, { signal: controller.signal });
        if (!active || controller.signal.aborted) return;
        if (!response.ok) {
          setStatus(response.status);
          if (response.status === 401) setData(null);
          message = response.status === 401 ? "Your session ended. Sign in again to view this artist."
            : response.status === 404 ? "This artist was not found on Spotify."
              : response.status === 400 ? "This artist link is invalid."
                : response.status === 504 ? "The artist took too long to load. Try again."
                  : message;
          throw new Error(message);
        }
        const result = parseArtistPayload(await response.json(), spotifyId, offset);
        if (!active || controller.signal.aborted) return;
        if (!result) throw new Error("The artist is unavailable. Try again.");
        setData(previous => {
          if (!previous) return result;
          const tracks = offset > 0 || result.unavailable.includes("tracks")
            ? Array.from(new Map([...previous.tracks, ...result.tracks].map(track => [track.id, track])).values())
            : result.tracks;
          return {
            ...result,
            tracks,
            albums: result.unavailable.includes("albums") ? previous.albums : result.albums,
          };
        });
      } catch {
        if (active && !controller.signal.aborted) {
          setError(message);
        }
      } finally {
        clearTimeout(timer);
        if (active && !controller.signal.aborted) setLoading(false);
      }
    }
    void load();
    return () => { active = false; controller.abort(); clearTimeout(timer); };
  }, [spotifyId, offset, attempt]);

  const retry = () => setAttempt(value => value + 1);
  const artist = data?.artist;
  return <div className={`room-container ${styles.page}`}>
    <Head><title>{artist ? `${artist.name} — Beatbrain` : "Artist — Beatbrain"}</title></Head>
    {artist ? <header className={styles.identity}>
      <Artwork key={artist.image} src={artist.image} name={artist.name} portrait />
      <div className={styles.identityText}>
        <h1>{artist.name}</h1>
        {artist.genres.length > 0 && <p className={styles.genres}>{artist.genres.join(" · ")}</p>}
        <a className={`button button-secondary ${styles.source}`} href={artist.url} target="_blank" rel="noreferrer">
          <SpotifyLogo /> Artist on Spotify <ArrowUpRightIcon width={17} aria-hidden="true" />
        </a>
      </div>
    </header> : <h1 className={styles.emptyTitle}>Artist</h1>}

    <p className="sr-only" role="status" aria-live="polite">
      {loading ? data ? "Loading more artist music…" : "Loading artist…" : data ? `${data.tracks.length} songs loaded.` : ""}
    </p>
    {!data && loading && <p className={styles.message}>Loading artist…</p>}
    {error && <div className={styles.error} role="alert">
      <p>{error}</p>
      {status === 401
        ? <Link className="button button-secondary" href={`/auth/signin?callbackUrl=${encodeURIComponent(`/artist/${spotifyId}`)}`}>Sign in</Link>
        : status === 400 || status === 404
          ? <Link className="button button-secondary" href="/discover">Back to Discover</Link>
          : <button className="button button-secondary" type="button" onClick={retry} disabled={loading}>Try again</button>}
    </div>}

    {data && <>
      <section className={styles.section} aria-labelledby="artist-songs" aria-busy={loading}>
        <div className={styles.sectionHeading}>
          <h2 id="artist-songs">Songs</h2>
          <p>Songs with {data.artist.name}, from Spotify.</p>
        </div>
        {data.tracks.length > 0 && <div className={styles.grid}>
          {data.tracks.map((track, index) => <article className={styles.record} key={track.id}>
            <AlbumArtwork src={track.thumb || ""} title={track.name} href={`/ext/spotify/${track.id}`} priority={index < 2} />
            <h3><Link href={`/ext/spotify/${track.id}`}>{track.name}</Link></h3>
            <p>{track.artist}</p>
          </article>)}
        </div>}
        {data.unavailable.includes("tracks") ? <div className={styles.partial} role="status">
          <p>{data.tracks.length ? "More songs are unavailable. Try again." : "Songs are unavailable. Try again."}</p>
          <button className="button button-secondary" type="button" disabled={loading} onClick={retry}>{loading ? "Loading…" : "Retry songs"}</button>
        </div> : !data.tracks.length && <p className={styles.message}>
          {data.next_offset !== null ? "No songs in this set. Load more to continue." : "No songs found for this artist."}
        </p>}
        {data.next_offset !== null && !data.unavailable.includes("tracks") && !error && <div className={styles.pagination}>
          <button className="button button-secondary" type="button" disabled={loading} onClick={() => setOffset(data.next_offset!)}>
            {loading ? "Loading songs…" : "Load more songs"}
          </button>
        </div>}
      </section>

      <section className={styles.section} aria-labelledby="artist-releases" aria-busy={loading}>
        <div className={styles.sectionHeading}>
          <h2 id="artist-releases">Releases</h2>
          <p>Open a release on Spotify.</p>
        </div>
        {data.albums.length > 0 && <div className={styles.grid}>
          {data.albums.map(album => <article className={styles.record} key={album.id}>
            <a className={styles.releaseLink} href={album.url} target="_blank" rel="noreferrer" aria-label={`${album.name} on Spotify`}>
              <Artwork key={album.image} src={album.image} name={album.name} />
            </a>
            <h3><a href={album.url} target="_blank" rel="noreferrer">{album.name}<ArrowUpRightIcon width={15} aria-hidden="true" /></a></h3>
            <p>{[album.album_type ? album.album_type[0].toUpperCase() + album.album_type.slice(1) : "", formatReleaseDate(album.release_date)].filter(Boolean).join(" · ")}</p>
          </article>)}
        </div>}
        {data.unavailable.includes("albums") ? <div className={styles.partial} role="status">
          <p>Releases are unavailable. Try again.</p>
          <button className="button button-secondary" type="button" disabled={loading} onClick={retry}>{loading ? "Loading…" : "Retry releases"}</button>
        </div> : !data.albums.length && <p className={styles.message}>No releases found for this artist.</p>}
      </section>
    </>}
  </div>;
}

export default function ArtistPage() {
  const router = useRouter();
  const spotifyId = router.query.spotifyId;
  if (!router.isReady) return <div className={`room-container ${styles.page}`}><p role="status">Loading artist…</p></div>;
  if (!validSpotifyId(spotifyId)) return <div className={`room-container ${styles.page}`}>
    <Head><title>Artist not found — Beatbrain</title></Head>
    <h1 className={styles.emptyTitle}>Artist not found</h1>
    <p className={styles.message}>This artist link is invalid.</p>
    <Link className="button button-secondary" href="/discover">Back to Discover</Link>
  </div>;
  return <ArtistCatalog key={spotifyId} spotifyId={spotifyId} />;
}
