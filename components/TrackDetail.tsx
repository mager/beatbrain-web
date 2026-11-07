import Link from "next/link";
import Head from "next/head";
import { PlusIcon } from "@heroicons/react/24/outline";
import TrackHero from "./TrackHero";
import SpotifyLogo from "./SpotifyLogo";
import AudioDNA from "./AudioDNA";
import LoudnessMap from "./LoudnessMap";
import Credits from "./Credits";
import Releases from "./Releases";
import type { TrackV3 } from "@types";

type Props = {
  track: TrackV3;
  posts: { author: { name: string; username?: string | null } | null }[];
  sourceId: string | null;
};
export default function TrackDetail({ track, posts, sourceId }: Props) {
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
        <title>
          {track.name} — {track.artist} — Beatbrain
        </title>
      </Head>
      <TrackHero
        name={track.name}
        artist={track.artist}
        image={track.image}
        releaseDate={track.release_date}
      >
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
            {people.slice(0, 5).map((person, i) => (
              <span key={person.username}>
                {i > 0 && ", "}
                <Link href={`/u/${person.username}`}>{person.username}</Link>
              </span>
            ))}
            {people.length > 5 && ` and ${people.length - 5} more`}
          </p>
        )}
      </TrackHero>
      <div className="room-container track-extra">
        {!!hasCredits && (
          <section className="track-section">
            <h2>Credits</h2>
            <Credits
              instruments={track.instruments || []}
              production_credits={track.production_credits || []}
              song_credits={track.song_credits || []}
            />
          </section>
        )}
        {track.features && (
          <section className="track-section">
            <h2>Audio DNA</h2>
            <AudioDNA meta={track.meta} features={track.features} />
          </section>
        )}
        {!!track.analysis?.segments?.length && (
          <section className="track-section">
            <h2>Loudness</h2>
            <LoudnessMap
              segments={track.analysis.segments}
              duration={track.analysis.duration}
            />
          </section>
        )}
        {!!track.releases?.length && (
          <section className="track-section">
            <h2>Releases</h2>
            <Releases releases={track.releases} />
          </section>
        )}
      </div>
    </>
  );
}
