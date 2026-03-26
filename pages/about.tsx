import React from "react";
import Link from "next/link";
import GiantTitle from "@components/GiantTitle";

const AboutPage: React.FC = () => {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <div className="px-4 pt-12 pb-8 md:pt-20 md:pb-12">
        <div className="bb-container">
          <GiantTitle>about</GiantTitle>
          <p className="mt-4 text-phosphor-dim font-mono text-sm md:text-base max-w-2xl">
            A social music discovery app for people who care about what they listen to —
            and who want to share that with friends.
          </p>
        </div>
      </div>

      {/* Story */}
      <div className="bb-container pb-16 space-y-12">
        {/* Why beatbrain exists */}
        <section className="terminal-window">
          <div className="terminal-titlebar">the origin</div>
          <div className="p-5 md:p-6 space-y-4 text-phosphor-dim">
            <p>
              I loved Last.fm. That site understood something important: music is social.
              The scrobbling, the charts, the discovery through friends — it was a way
              to share taste without having to write about it.
            </p>
            <p>
              Last.fm is still around, but it doesn't hit the same. So I built beatbrain
              as my take on social music discovery. A place to find what's hot, share
              your favorites, and see what your friends are actually listening to.
            </p>
            <p className="text-phosphor text-sm">
              —{" "}
              <a
                href="https://x.com/mager"
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent hover:underline"
              >
                @mager
              </a>
              , building beatbrain since 2024
            </p>
          </div>
        </section>

        {/* What it does */}
        <section className="terminal-window">
          <div className="terminal-titlebar">what it does</div>
          <div className="p-5 md:p-6">
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <h3 className="text-phosphor font-mono text-sm mb-2">discover</h3>
                <p className="text-phosphor-dim text-sm">
                  Hot new releases from Spotify, Billboard, Pitchfork, and HotNewHipHop —
                  scored and ranked so you know what's actually worth your time.
                </p>
              </div>
              <div>
                <h3 className="text-phosphor font-mono text-sm mb-2">share</h3>
                <p className="text-phosphor-dim text-sm">
                  Save tracks with notes. Build a profile of what you love. Your friends
                  can see your taste and find their next obsession.
                </p>
              </div>
              <div>
                <h3 className="text-phosphor font-mono text-sm mb-2">explore</h3>
                <p className="text-phosphor-dim text-sm">
                  Full credits: who produced it, who played bass, what key it's in.
                  Plus podcasts from 100+ categories for when you need something to
                  listen to between songs.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* The Spotify connection */}
        <section className="terminal-window">
          <div className="terminal-titlebar">spotify-pilled</div>
          <div className="p-5 md:p-6 space-y-4 text-phosphor-dim">
            <p>
              beatbrain is heavily integrated with Spotify. That's intentional — I worked
              there from 2011-2014 as the first Developer Advocate, and I believe in
              their catalog and APIs.
            </p>
            <p>
              We use Spotify for search, track metadata, audio features (danceability,
              energy, valence), and audio analysis (the loudness map you see on track
              pages). If you connect your account, you can even play tracks directly
              through the site.
            </p>
            <p>
              But beatbrain isn't just a Spotify wrapper. We enrich every track with data
              from{" "}
              <a
                href="https://musicbrainz.org"
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent hover:underline"
              >
                MusicBrainz
              </a>{" "}
              — the open music encyclopedia — to show you production credits,
              instruments, and songwriting info you won't find in the Spotify app.
            </p>
          </div>
        </section>

        {/* Podcasts */}
        <section className="terminal-window">
          <div className="terminal-titlebar">podcasts</div>
          <div className="p-5 md:p-6 space-y-4 text-phosphor-dim">
            <p>
              The newest addition: podcast discovery from 100+ categories. We index shows
              from Spotify's catalog — everything from mainstream hits to niche
              obsessions like Linguistics, Cybersecurity, DJing, Philosophy, and
              Firefighting.
            </p>
            <p>
              <Link href="/podcasts" className="text-accent hover:underline">
                Browse podcasts →
              </Link>
            </p>
          </div>
        </section>

        {/* Tech stack */}
        <section className="terminal-window">
          <div className="terminal-titlebar">the stack</div>
          <div className="p-5 md:p-6">
            <div className="space-y-3 text-sm">
              <div className="flex gap-4">
                <span className="text-phosphor font-mono w-24 shrink-0">frontend</span>
                <span className="text-phosphor-dim">
                  Next.js 14, Tailwind, Prisma, Vercel
                </span>
              </div>
              <div className="flex gap-4">
                <span className="text-phosphor font-mono w-24 shrink-0">backend</span>
                <span className="text-phosphor-dim">
                  Go + Uber FX, Cloud Run, Firestore
                </span>
              </div>
              <div className="flex gap-4">
                <span className="text-phosphor font-mono w-24 shrink-0">scrapers</span>
                <span className="text-phosphor-dim">
                  Go + Chromedp, runs on Cloud Run
                </span>
              </div>
              <div className="flex gap-4">
                <span className="text-phosphor font-mono w-24 shrink-0">apis</span>
                <span className="text-phosphor-dim">
                  Spotify, MusicBrainz, Cover Art Archive
                </span>
              </div>
              <div className="flex gap-4">
                <span className="text-phosphor font-mono w-24 shrink-0">design</span>
                <span className="text-phosphor-dim">
                  Built with Claude's impeccable design skills
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Open source */}
        <section className="terminal-window">
          <div className="terminal-titlebar">open source</div>
          <div className="p-5 md:p-6 space-y-4 text-phosphor-dim">
            <p>
              All the code is public. The backend is called{" "}
              <strong className="text-phosphor">occipital</strong> (after the part of
              your brain that processes visual information). The scraper is{" "}
              <strong className="text-phosphor">melodex</strong>. The MusicBrainz client
              is its own library.
            </p>
            <div className="flex flex-wrap gap-3">
              <a
                href="https://github.com/mager/beatbrain-web"
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent hover:underline text-sm"
              >
                beatbrain-web →
              </a>
              <a
                href="https://github.com/mager/occipital"
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent hover:underline text-sm"
              >
                occipital →
              </a>
              <a
                href="https://github.com/mager/melodex"
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent hover:underline text-sm"
              >
                melodex →
              </a>
              <a
                href="https://github.com/mager/musicbrainz-go"
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent hover:underline text-sm"
              >
                musicbrainz-go →
              </a>
            </div>
          </div>
        </section>

        {/* Links */}
        <section className="terminal-window">
          <div className="terminal-titlebar">find us</div>
          <div className="p-5 md:p-6">
            <div className="flex flex-wrap gap-6 text-sm">
              <a
                href="https://beatbrain.xyz"
                className="text-accent hover:underline"
              >
                beatbrain.xyz
              </a>
              <a
                href="https://x.com/beatbrainxyz"
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent hover:underline"
              >
                @beatbrainxyz
              </a>
              <a
                href="https://x.com/mager"
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent hover:underline"
              >
                @mager
              </a>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default AboutPage;
