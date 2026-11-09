import Link from "next/link";
import Head from "next/head";
import RadiantRecord from "../components/RadiantRecord";

export default function About() {
  return (
    <div className="room-container about-page">
      <Head>
        <title>Music charms the soul — Beatbrain</title>
      </Head>
      <div className="about-hero">
      <h1 className="display-title">
        Music charms
        <br />
        the soul.
      </h1>
      <RadiantRecord />
      </div>
      <div className="about-story">
        <p className="about-lead">
          A song finds you.
          <br />
          You pass it on.
        </p>
        <div className="about-copy">
          <p>
            Beatbrain is a place for your music friends. Find what’s hot, post
            what you’re playing, and see what everyone is into. Your profile is
            your feed.
          </p>
          <p>
            Inspired by the days of Last.fm. Built for the joy of putting a
            friend onto a track. No Spotify account needed to join or post.
          </p>
          <p>
            Made in Chicago by{" "}
            <a href="https://mager.co" target="_blank" rel="noreferrer">
              mager
            </a>
            , with agents and a lot of music.
          </p>
          <div className="about-links">
            <a href="https://github.com/mager/beatbrain-web" target="_blank" rel="noreferrer">
              GitHub
            </a>
            <a href="https://x.com/beatbrainxyz" target="_blank" rel="noreferrer">
              @beatbrainxyz on X
            </a>
            <Link href="/">Discover music</Link>
            <Link href="/feed">See the feed</Link>
          </div>
          <p className="about-attribution">
            Music metadata and credits include data from{" "}
            <a href="https://musicbrainz.org" target="_blank" rel="noreferrer">MusicBrainz</a>
            {" "}and its contributors.{" "}
            <a href="https://musicbrainz.org/doc/About/Data_License" target="_blank" rel="noreferrer">Data licenses</a>.
          </p>
        </div>
      </div>
    </div>
  );
}
