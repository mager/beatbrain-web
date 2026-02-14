import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import type { Creator } from "@types";
import CreatorHero from "@components/CreatorHero";
import CreatorHighlights from "@components/CreatorHighlights";
import CreatorCredits from "@components/CreatorCredits";

export default function CreatorPage() {
  const router = useRouter();
  const { mbid } = router.query;
  const [creator, setCreator] = useState<Creator | null>(null);

  useEffect(() => {
    if (!mbid) return;
    const fetchCreator = async () => {
      const resp = await fetch(`/api/creator?mbid=${mbid}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      const data = await resp.json();
      setCreator(data);
    };
    fetchCreator();
  }, [mbid]);

  if (!creator) {
    return (
      <div className="bb-container pt-24 pb-8">
        <div className="font-mono text-sm text-phosphor-dim animate-pulse">Loading...</div>
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
