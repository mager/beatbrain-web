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
        <div className="font-mono text-xs text-phosphor-dim animate-pulse">Loading...</div>
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

      <div className="bb-container pb-16">
        {/* Highlights — Known For */}
        {creator.highlights && creator.highlights.length > 0 && (
          <div className="terminal-window mt-8">
            <div className="terminal-titlebar">known for</div>
            <div className="p-5">
              <CreatorHighlights highlights={creator.highlights} />
            </div>
          </div>
        )}

        {/* Full Credits */}
        {creator.credits?.length > 0 && (
          <div className="terminal-window mt-8">
            <div className="terminal-titlebar">
              credits
              <span className="ml-2 text-phosphor-dim font-normal">
                ({totalCredits} recordings)
              </span>
            </div>
            <div className="p-5">
              <CreatorCredits credits={creator.credits} />
            </div>
          </div>
        )}

        {/* Links */}
        {creator.links?.length > 0 && (
          <div className="terminal-window mt-8">
            <div className="terminal-titlebar">links</div>
            <div className="p-5">
              <div className="space-y-2">
                {creator.links.map((link, index) => (
                  <div key={`link-${index}`} className="flex items-center gap-3">
                    <span className="font-mono text-[10px] text-phosphor-dim uppercase tracking-wider w-20">
                      {link.type}
                    </span>
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono text-xs text-phosphor hover:text-accent transition-colors truncate"
                    >
                      {link.url}
                    </a>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
