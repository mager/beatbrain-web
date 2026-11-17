import { useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { ArrowUpRightIcon, MusicalNoteIcon } from "@heroicons/react/24/outline";
import AlbumArtwork from "../../components/AlbumArtwork";
import SpotifyLogo from "../../components/SpotifyLogo";
import { useArtistCatalog } from "../../components/useArtistCatalog";
import { validSpotifyId } from "../../lib/artist";
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

function CatalogControls({ section, state, complete, progress, onLoad, onStop }: {
  section: "songs" | "releases";
  state: { loading: boolean; automatic: boolean; stopped: boolean; error: string };
  complete: boolean;
  progress: string;
  onLoad: (automatic?: boolean) => void;
  onStop: () => void;
}) {
  return <div className={styles.catalogControls}>
    <p className={styles.progress} id={`${section}-progress`} role="status" aria-live="polite" aria-atomic="true">
      {progress}
      <span className={styles.loadStatus}>
        {state.loading ? state.automatic ? `Loading all ${section}…` : `Loading more ${section}…`
          : state.stopped ? `Loading stopped. Loaded ${section} are kept.`
            : complete ? section === "songs" ? "All available releases checked." : "All available releases loaded." : ""}
      </span>
    </p>
    {state.error && <p className={styles.sectionError} role="alert">{state.error} Loaded {section} are kept.</p>}
    <div className={styles.pagination}>
      <button className="button button-secondary" type="button" disabled={state.loading}
        aria-disabled={complete || state.loading} aria-describedby={`${section}-progress`}
        onClick={() => { if (!complete) onLoad(); }}>
        {state.loading ? `Loading ${section}…` : state.error ? `Retry ${section}` : `Load more ${section}`}
      </button>
      <button className="button button-secondary" type="button" aria-disabled={complete}
        aria-describedby={`${section}-progress`} aria-label={state.loading ? `Stop loading ${section}` : undefined}
        onClick={() => { if (state.loading) onStop(); else if (!complete) onLoad(true); }}>
        {state.loading ? "Stop" : section === "songs" ? "Load full catalog" : "Load all releases"}
      </button>
    </div>
  </div>;
}

function ArtistCatalog({ spotifyId }: { spotifyId: string }) {
  const { data, initial, songs, releases, retryInitial, load, stop } = useArtistCatalog(spotifyId);
  const [songFilter, setSongFilter] = useState("");
  const [releaseFilter, setReleaseFilter] = useState("");
  const songQuery = songFilter.trim().toLocaleLowerCase();
  const releaseQuery = releaseFilter.trim().toLocaleLowerCase();
  const visibleSongs = data?.tracks.filter(track =>
    [track.name, track.artist, track.album_name].some(value => value.toLocaleLowerCase().includes(songQuery))) || [];
  const visibleReleases = data?.albums.filter(album => album.name.toLocaleLowerCase().includes(releaseQuery)) || [];
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
      {initial.loading ? "Loading artist…" : ""}
    </p>
    {!data && initial.loading && <p className={styles.message}>Loading artist…</p>}
    {initial.error && <div className={styles.error} role="alert">
      <p>{initial.error}</p>
      {initial.status === 401
        ? <Link className="button button-secondary" href={`/auth/signin?callbackUrl=${encodeURIComponent(`/artist/${spotifyId}`)}`}>Sign in</Link>
        : initial.status === 400 || initial.status === 404
          ? <Link className="button button-secondary" href="/discover">Back to Discover</Link>
          : <button className="button button-secondary" type="button" onClick={retryInitial} disabled={initial.loading}>Try again</button>}
    </div>}

    {data && <>
      <section className={styles.section} aria-labelledby="artist-songs">
        <div className={styles.sectionHeading}>
          <h2 id="artist-songs">Songs</h2>
          <p>Songs that credit {data.artist.name} as a performing artist on Spotify.</p>
        </div>
        <CatalogControls section="songs" state={songs}
          complete={data.next_cursor === null && !songs.error && !data.unavailable.includes("tracks")}
          progress={`${data.tracks.length.toLocaleString()} songs loaded · ${data.scanned_releases.toLocaleString()} of ${data.release_total.toLocaleString()} releases checked`}
          onLoad={automatic => { void load("songs", automatic); }} onStop={() => stop("songs")} />
        <div className={styles.filter}>
          <label htmlFor="song-filter">Filter loaded songs</label>
          <input id="song-filter" type="search" value={songFilter} onChange={event => setSongFilter(event.target.value)}
            placeholder="Song, artist, or album" aria-describedby={songQuery ? "song-matches" : undefined} />
          {songQuery && <p id="song-matches" role="status">{visibleSongs.length.toLocaleString()} matching songs in {data.tracks.length.toLocaleString()} loaded.</p>}
        </div>
        {visibleSongs.length > 0 && <div className={styles.grid} aria-busy={songs.loading}>
          {visibleSongs.map((track, index) => <article className={styles.record} key={track.id}>
            <AlbumArtwork src={track.thumb || ""} title={track.name} href={`/ext/spotify/${track.id}`} priority={index < 2} />
            <h3><Link href={`/ext/spotify/${track.id}`}>{track.name}</Link></h3>
            <p>{track.artist}</p>
            <p className={styles.albumContext}>
              <a href={`https://open.spotify.com/album/${track.album_id}`} target="_blank" rel="noreferrer">{track.album_name}</a>
              {track.release_date && <> · {formatReleaseDate(track.release_date)}</>}
            </p>
          </article>)}
        </div>}
        {!data.tracks.length && !songs.error && <p className={styles.message}>
          {data.next_cursor !== null ? "No songs in these releases. Load more to continue." : "No songs found for this artist."}
        </p>}
        {songQuery && data.tracks.length > 0 && !visibleSongs.length && <p className={styles.message}>
          No loaded songs match this filter. {data.next_cursor !== null ? "Change the filter or load more songs." : "Change the filter."}
        </p>}
      </section>

      <section className={styles.section} aria-labelledby="artist-releases">
        <div className={styles.sectionHeading}>
          <h2 id="artist-releases">Releases</h2>
          <p>Albums, singles, compilations, and appearances. Open a release on Spotify.</p>
        </div>
        <CatalogControls section="releases" state={releases}
          complete={data.next_release_offset === null && !releases.error && !data.unavailable.includes("albums")}
          progress={`${data.albums.length.toLocaleString()} releases loaded · ${data.release_total.toLocaleString()} release entries on Spotify`}
          onLoad={automatic => { void load("releases", automatic); }} onStop={() => stop("releases")} />
        <div className={styles.filter}>
          <label htmlFor="release-filter">Filter loaded releases</label>
          <input id="release-filter" type="search" value={releaseFilter} onChange={event => setReleaseFilter(event.target.value)}
            placeholder="Release name" aria-describedby={releaseQuery ? "release-matches" : undefined} />
          {releaseQuery && <p id="release-matches" role="status">{visibleReleases.length.toLocaleString()} matching releases in {data.albums.length.toLocaleString()} loaded.</p>}
        </div>
        {visibleReleases.length > 0 && <div className={styles.grid} aria-busy={releases.loading}>
          {visibleReleases.map(album => <article className={styles.record} key={album.id}>
            <a className={styles.releaseLink} href={album.url} target="_blank" rel="noreferrer" aria-label={`${album.name} on Spotify`}>
              <Artwork key={album.image} src={album.image} name={album.name} />
            </a>
            <h3><a href={album.url} target="_blank" rel="noreferrer">{album.name}<ArrowUpRightIcon width={15} aria-hidden="true" /></a></h3>
            <p>{[album.album_group === "appears_on" ? "Appears on" : album.album_type ? album.album_type[0].toUpperCase() + album.album_type.slice(1) : "",
              formatReleaseDate(album.release_date)].filter(Boolean).join(" · ")}</p>
          </article>)}
        </div>}
        {!data.albums.length && !releases.error && <p className={styles.message}>No releases found for this artist.</p>}
        {releaseQuery && data.albums.length > 0 && !visibleReleases.length && <p className={styles.message}>
          No loaded releases match this filter. {data.next_release_offset !== null ? "Change the filter or load more releases." : "Change the filter."}
        </p>}
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
