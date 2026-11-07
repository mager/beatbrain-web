import { useState } from "react";
import { ArrowUpRightIcon, MusicalNoteIcon } from "@heroicons/react/24/outline";
import type { Release } from "@types";
import { formatReleaseDate } from "../lib/track-details";
function ReleaseArtwork({ release }: { release: Release }) {
  const [failed, setFailed] = useState(false);
  return release.image && !failed ? (
    <img
      src={release.image}
      alt=""
      width={64}
      height={64}
      loading="lazy"
      onError={() => setFailed(true)}
    />
  ) : (
    <span className="release-placeholder">
      <MusicalNoteIcon width={25} />
    </span>
  );
}
export default function Releases({ releases }: { releases: Release[] }) {
  const [all, setAll] = useState(false);
  const visible = all ? releases : releases.slice(0, 4);
  return (
    <>
      <ul className="release-list">
        {visible.map((release) => (
          <li key={release.id}>
            <a
              href={`https://musicbrainz.org/release/${release.id}`}
              target="_blank"
              rel="noreferrer"
            >
              <ReleaseArtwork release={release} />
              <span>
                <strong>{release.title}</strong>
                <span>
                  {[
                    formatReleaseDate(release.date),
                    release.country === "XW"
                      ? "Worldwide"
                      : release.country === "XE"
                        ? "Europe"
                        : release.country,
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                </span>
                {release.disambiguation && (
                  <span>{release.disambiguation}</span>
                )}
              </span>
              <ArrowUpRightIcon width={17} />
            </a>
          </li>
        ))}
      </ul>
      {releases.length > 4 && (
        <button
          className="text-button"
          onClick={() => setAll(!all)}
          aria-expanded={all}
        >
          {all ? "Show fewer releases" : `Show all ${releases.length} releases`}
        </button>
      )}
    </>
  );
}
