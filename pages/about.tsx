import React from "react";
import Link from "next/link";

const AboutPage: React.FC = () => {
  return (
    <div className="min-h-screen">
      {/* Header — matches discover/feed style */}
      <div className="px-4 pt-8 pb-8">
        <div className="relative inline-block">
          <h1 className="font-display text-massive text-phosphor tracking-tight font-bold">
            about
          </h1>
          <div className="absolute -bottom-2 left-0 w-16 h-1 bg-accent rounded-full" />
        </div>
      </div>

      {/* Story */}
      <div className="bb-container pb-16 space-y-12">
        {/* Why */}
        <section className="terminal-window">
          <div className="terminal-titlebar">why this exists</div>
          <div className="p-5 md:p-6 space-y-4 text-phosphor-dim">
            <p>
              I loved Last.fm. The scrobbling, the charts, seeing what your friends
              were actually listening to — that site understood that music is social.
              It&apos;s still around, but it doesn&apos;t hit the same anymore.
            </p>
            <p>
              So I built beatbrain. It&apos;s my take on social music discovery.
              Find what&apos;s hot, share your favorites, see what your friends are
              into. That&apos;s it. No algorithm trying to keep you scrolling. Just
              music and the people who care about it.
            </p>
            <p>
              I started building this in 2024 and I haven&apos;t stopped. It&apos;s a
              side project that became a real thing.
            </p>
          </div>
        </section>

        {/* Spotify */}
        <section className="terminal-window">
          <div className="terminal-titlebar">spotify-pilled</div>
          <div className="p-5 md:p-6 space-y-4 text-phosphor-dim">
            <p>
              Yeah, beatbrain is heavily Spotify-integrated. I&apos;m fine with that.
              I worked at Spotify from 2011-2014 as their first Developer Advocate.
              I believe in their catalog and their APIs.
            </p>
            <p>
              But I also wanted to show you things Spotify doesn&apos;t. Who played
              bass on that track. Who produced it. What key it&apos;s in. How loud it
              gets. That data comes from{" "}
              <a
                href="https://musicbrainz.org"
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent hover:underline"
              >
                MusicBrainz
              </a>
              , the open music encyclopedia. I built a{" "}
              <a
                href="https://github.com/mager/musicbrainz-go"
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent hover:underline"
              >
                Go client library
              </a>{" "}
              to talk to it.
            </p>
            <p>
              Click any track and you&apos;ll see the Audio DNA — danceability,
              energy, acousticness, all of it visualized. Plus a loudness map of the
              entire song. Plus full liner-notes-style credits. That&apos;s the stuff I
              always wanted to see and couldn&apos;t find anywhere.
            </p>
          </div>
        </section>

        {/* How it works */}
        <section className="terminal-window">
          <div className="terminal-titlebar">how it works</div>
          <div className="p-5 md:p-6 space-y-4 text-phosphor-dim">
            <p>
              The discover page aggregates hot releases from Spotify New Releases,
              Billboard, HotNewHipHop, and Pitchfork. A Go service called{" "}
              <strong className="text-phosphor">melodex</strong> scrapes these sources,
              scores the tracks, and stores them in Firestore.
            </p>
            <p>
              When you click a track, another Go service called{" "}
              <strong className="text-phosphor">occipital</strong> (named after the part
              of your brain that processes visual information) fans out parallel API
              calls to Spotify and MusicBrainz, assembles everything, caches it, and
              returns it in about 200ms. It used to take 3 seconds. I{" "}
              <a
                href="https://mager.co/blog/beatbrain-v2-backend-rewrite"
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent hover:underline"
              >
                wrote about the rewrite
              </a>
              .
            </p>
          </div>
        </section>

        {/* Podcasts */}
        <section className="terminal-window">
          <div className="terminal-titlebar">podcasts</div>
          <div className="p-5 md:p-6 space-y-4 text-phosphor-dim">
            <p>
              I added podcast discovery because I listen to a lot of podcasts and
              Spotify&apos;s browse experience is... fine. beatbrain indexes shows from
              100+ categories — and I mean weird ones. Linguistics. Cybersecurity.
              Firefighting. DJing. Philosophy. If Spotify has a category for it, I
              indexed it.
            </p>
            <p>
              <Link href="/podcasts" className="text-accent hover:underline">
                Browse podcasts →
              </Link>
            </p>
          </div>
        </section>

        {/* Stack */}
        <section className="terminal-window">
          <div className="terminal-titlebar">the stack</div>
          <div className="p-5 md:p-6 space-y-4 text-phosphor-dim">
            <p>
              Everything is open source. The frontend is Next.js on Vercel. The backend
              is Go on Cloud Run. The scrapers use Chromedp for headless browsing. I use
              AI to build — Claude with the{" "}
              <a
                href="https://github.com/pbasaus/impeccable"
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent hover:underline"
              >
                impeccable
              </a>{" "}
              design skills for the frontend, and my own agent{" "}
              <a
                href="https://github.com/mager/openclaw-brain"
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent hover:underline"
              >
                magerbot
              </a>{" "}
              for everything else.
            </p>
            <div className="flex flex-wrap gap-3 mt-4">
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

        {/* Find me */}
        <section className="terminal-window">
          <div className="terminal-titlebar">find me</div>
          <div className="p-5 md:p-6 space-y-4 text-phosphor-dim">
            <p>
              I&apos;m{" "}
              <a
                href="https://x.com/mager"
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent hover:underline"
              >
                @mager
              </a>{" "}
              everywhere. beatbrain is{" "}
              <a
                href="https://x.com/beatbrainxyz"
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent hover:underline"
              >
                @beatbrainxyz
              </a>
              . I write about building stuff at{" "}
              <a
                href="https://mager.co"
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent hover:underline"
              >
                mager.co
              </a>
              .
            </p>
            <p>
              If you find a bug, want to contribute, or just want to talk about music —
              I&apos;m around. ✌️
            </p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default AboutPage;
