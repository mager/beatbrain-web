import Link from "next/link";
import Head from "next/head";
import { PlusIcon } from "@heroicons/react/24/outline";
import MemberAvatar from "./MemberAvatar";
import TrackHero from "./TrackHero";
import SpotifyLogo from "./SpotifyLogo";
import AudioDNA from "./AudioDNA";
import LoudnessMap from "./LoudnessMap";
import Credits from "./Credits";
import Releases from "./Releases";
import { useAlbumTheme } from "../lib/use-album-theme";
import { trackFacts, trackSourceLinks } from "../lib/track-details";
import type { TrackV3 } from "@types";

type Props = {
  track: TrackV3;
  posts: {
    author: {
      name: string;
      image?: string | null;
      username?: string | null;
    } | null;
  }[];
  sourceId: string | null;
};
export default function TrackDetail({ track, posts, sourceId }: Props) {
  const { onArtworkLoad } = useAlbumTheme(track.image);
  const facts = trackFacts(track.meta);
  const sourceLinks = trackSourceLinks(track);
  const genres = Array.from(new Set(track.genres || [])).slice(0, 10);
  const people = Array.from(
    new Map(
      posts.flatMap((p) =>
        p.author?.username ? [[p.author.username, p.author] as const] : [],
      ),
    ).values(),
  );
  const hasCredits =
    track.instruments?.length ||
    track.production_credits?.length ||
    track.song_credits?.length;
  return (
    <>
      <Head>
        <title>{`${track.name} — ${track.artist} — Beatbrain`}</title>
      </Head>
      <TrackHero
        name={track.name}
        artist={track.artist}
        image={track.image}
        releaseDate={track.release_date}
        onArtworkLoad={onArtworkLoad}
      >
        {track.album?.name && (
          <p className="track-album">
            From{" "}
            {track.album.id && /^[a-zA-Z0-9]{22}$/.test(track.album.id) ? (
              <a
                href={`https://open.spotify.com/album/${track.album.id}`}
                target="_blank"
                rel="noreferrer"
              >
                {track.album.name}
              </a>
            ) : (
              <span>{track.album.name}</span>
            )}
          </p>
        )}
        {facts.length > 0 && (
          <dl className="track-facts">
            {facts.map((fact) => (
              <div key={fact.label}>
                <dt>{fact.label}</dt>
                <dd>{fact.value}</dd>
              </div>
            ))}
          </dl>
        )}
        {genres.length > 0 && (
          <ul className="track-genres" aria-label="Genres">
            {genres.map((genre) => (
              <li key={genre}>{genre}</li>
            ))}
          </ul>
        )}
        {sourceId && (
          <div className="track-actions">
            <Link
              className="button button-primary"
              href={`/create?track=${sourceId}`}
            >
              <PlusIcon width={18} />
              Post this track
            </Link>
            <a
              className="button button-secondary"
              href={`https://open.spotify.com/track/${sourceId}`}
              target="_blank"
              rel="noreferrer"
            >
              <SpotifyLogo />
              Listen on Spotify
            </a>
          </div>
        )}
        {people.length > 0 && (
          <p className="track-posted">
            Posted by{" "}
            {people.slice(0, 5).map((person) => (
              <span key={person.username}>
                <Link className="track-person" href={`/u/${person.username}`}>
                  <MemberAvatar image={person.image} name={person.name} />
                  {person.username}
                </Link>
              </span>
            ))}
            {people.length > 5 && ` and ${people.length - 5} more`}
          </p>
        )}
      </TrackHero>
      <div className="room-container liner-notes">
        <section className="liner-credits">
          <h2>Credits</h2>
          {hasCredits ? (
            <Credits
              instruments={track.instruments || []}
              production_credits={track.production_credits || []}
              song_credits={track.song_credits || []}
            />
          ) : (
            <p className="metadata-note">
              {track.metadata_status === "unavailable"
                ? "We could not load credits right now. Refresh to try again."
                : track.metadata_status === "matched"
                  ? "MusicBrainz has no detailed credits for this recording."
                  : track.metadata_status === "unmatched"
                    ? "No matching credits record found."
                    : "No verified credits found yet."}
            </p>
          )}
          {sourceLinks.length > 0 && (
            <nav className="track-sources" aria-label="Track sources">
              {sourceLinks.map((link) => (
                <a
                  key={link.url}
                  href={link.url}
                  target="_blank"
                  rel="noreferrer"
                >
                  {link.label}
                  <span aria-hidden="true"> ↗</span>
                </a>
              ))}
            </nav>
          )}
          {(track.isrc || track.id) && (
            <details className="recording-identifiers">
              <summary>Recording IDs</summary>
              <dl>
                {track.isrc && (
                  <div>
                    <dt>ISRC</dt>
                    <dd>{track.isrc}</dd>
                  </div>
                )}
                {track.id && (
                  <div>
                    <dt>MusicBrainz</dt>
                    <dd>{track.id}</dd>
                  </div>
                )}
              </dl>
            </details>
          )}
        </section>
        {track.features ||
        track.analysis?.segments?.length ||
        track.releases?.length ? (
          <div className="liner-extra">
            {track.features && (
              <section>
                <h2>Audio DNA</h2>
                <AudioDNA features={track.features} />
              </section>
            )}
            {!!track.analysis?.segments?.length && (
              <section>
                <h2>Loudness</h2>
                <LoudnessMap
                  segments={track.analysis.segments}
                  duration={track.analysis.duration}
                />
              </section>
            )}
            {!!track.releases?.length && (
              <section>
                <h2>Releases</h2>
                <Releases
                  key={track.id || sourceId}
                  releases={track.releases}
                />
              </section>
            )}
          </div>
        ) : null}
      </div>
    </>
  );
}
