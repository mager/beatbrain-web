import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import type { Creator } from "@types";
import CreatorHero from "@components/CreatorHero";
import CreatorHighlights from "@components/CreatorHighlights";
import CreatorCredits from "@components/CreatorCredits";

export default function CreatorPage() {
  const router = useRouter();
  const { mbid } = router.query;
  const [creator, setCreator] = useState<Creator | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<"unavailable" | "missing" | "session" | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!router.isReady) return;
    if (typeof mbid !== "string") {
      setError("missing");
      setLoading(false);
      return;
    }
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 12000);
    let active = true;
    setCreator(null);
    setLoading(true);
    setError(null);
    const fetchCreator = async () => {
      try {
        const resp = await fetch(`/api/creator?mbid=${encodeURIComponent(mbid)}`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          signal: controller.signal,
          cache: "no-store",
        });
        if (!active) return;
        if (!resp.ok) {
          setError(resp.status === 401 ? "session" : resp.status === 404 || resp.status === 400 ? "missing" : "unavailable");
          return;
        }
        const data = await resp.json();
        if (typeof data?.id !== "string" || typeof data?.name !== "string" || !data.name.trim())
          throw new Error("Invalid creator response");
        if (active) setCreator(data);
      } catch {
        if (active) setError("unavailable");
      } finally {
        clearTimeout(timer);
        if (active) setLoading(false);
      }
    };
    void fetchCreator();
    return () => {
      active = false;
      controller.abort();
      clearTimeout(timer);
    };
  }, [router.isReady, mbid, attempt]);

  if (loading) {
    return (
      <div className="bb-container pt-24 pb-8">
        <div role="status" className="font-mono text-sm text-phosphor-dim animate-pulse">Loading creator details...</div>
      </div>
    );
  }

  if (error || !creator) {
    return (
      <div className="bb-container pt-24 pb-8">
        <div className="empty-state" role="alert">
          <h1 className="text-xl font-semibold">
            {error === "missing" ? "Creator not found." : error === "session" ? "Sign in to view creator details." : "Creator details are unavailable."}
          </h1>
          <p>{error === "missing" ? "Check the creator link or return to Discover." : error === "session" ? "Your session has ended." : "Try again in a moment."}</p>
          {error === "session" ? (
            <Link className="button button-secondary" href={`/auth/signin?callbackUrl=${encodeURIComponent(`/creator/${mbid}`)}`}>
              Sign in
            </Link>
          ) : error === "missing" ? (
            <Link className="button button-secondary" href="/discover">Discover</Link>
          ) : (
            <button type="button" className="button button-secondary" onClick={() => setAttempt((n) => n + 1)}>
              Try again
            </button>
          )}
        </div>
      </div>
    );
  }

  const totalCredits = creator.credits?.reduce(
    (sum, c) => sum + c.recordings.length,
    0
  ) ?? 0;

  return (
    <>
      <CreatorHero
        name={creator.name}
        type={creator.type}
        disambiguation={creator.disambiguation}
        country={creator.country}
        area={creator.area}
        beginArea={creator.begin_area}
        activeYears={creator.active_years}
        genres={creator.genres || []}
      />

      <div className="bb-container pb-20 space-y-12">
        {/* Known For — Highlights */}
        {creator.highlights && creator.highlights.length > 0 && (
          <section>
            <div className="terminal-window">
              <div className="terminal-titlebar">
                <span>known for</span>
              </div>
              <div className="p-6">
                <CreatorHighlights highlights={creator.highlights} />
              </div>
            </div>
          </section>
        )}

        {/* Full Credits */}
        {creator.credits?.length > 0 && (
          <section>
            <div className="terminal-window">
              <div className="terminal-titlebar">
                <span>credits</span>
                <span className="text-phosphor-dim/50 font-normal ml-1">
                  — {totalCredits.toLocaleString()} recordings across {creator.credits.length} roles
                </span>
              </div>
              <div className="p-4 md:p-6">
                <CreatorCredits credits={creator.credits} />
              </div>
            </div>
          </section>
        )}

        {/* Links */}
        {creator.links?.length > 0 && (
          <section>
            <div className="terminal-window">
              <div className="terminal-titlebar">links</div>
              <div className="p-6">
                <div className="grid gap-3 sm:grid-cols-2">
                  {creator.links.map((link, index) => (
                    <a
                      key={`link-${index}`}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-4 p-3 rounded-lg hover:bg-white/[0.03] transition-colors group"
                    >
                      <span className="font-mono text-[11px] text-phosphor-dim uppercase tracking-widest w-24 flex-shrink-0 group-hover:text-phosphor transition-colors">
                        {link.type}
                      </span>
                      <span className="font-mono text-sm text-phosphor/70 group-hover:text-accent transition-colors truncate">
                        {link.url.replace(/^https?:\/\/(www\.)?/, '').split('/').slice(0, 2).join('/')}
                      </span>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}
      </div>
    </>
  );
}
