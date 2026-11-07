import Link from "next/link";
import Head from "next/head";

export default function About() {
  return (
    <div className="room-container about-page">
      <Head>
        <title>Music charms the soul — Beatbrain</title>
      </Head>
      <h1 className="display-title">
        Music charms
        <br />
        the soul.
      </h1>
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
            <Link href="/">Discover music</Link>
            <Link href="/feed">See the feed</Link>
            <a href="https://github.com/mager" target="_blank" rel="noreferrer">
              GitHub
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
