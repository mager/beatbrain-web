import React from "react";
import Image from "next/image";
import type { Release } from "@types";

import { MusicalNoteIcon } from "@heroicons/react/24/solid";

interface Props {
  releases: Release[];
  className?: string;
}
const Releases: React.FC<Props> = ({ releases, className = "" }) => {
  if (!releases || releases.length === 0) {
    return null;
  }

  return (
    <div
      className={`flex flex-wrap gap-4 ${className}`}
    >
      {releases.map((release) => (
        <div key={release.id} className="flex flex-col items-center">
          <a
            href={`https://musicbrainz.org/release/${release.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-[125px]"
            title={release.id}
          >
            <div className="relative w-full aspect-square border-2 border-black bg-white">
              <Image
                src={release.image}
                alt="Release cover"
                fill
                className="object-cover"
                unoptimized
                sizes="125px"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = "none";
                  const placeholder = target.parentElement?.querySelector(
                    ".release-placeholder"
                  ) as HTMLElement;
                  if (placeholder) placeholder.style.display = "flex";
                }}
              />
              <div className="release-placeholder absolute inset-0 hidden items-center justify-center bg-gray-100">
                <MusicalNoteIcon className="h-12 w-12 text-gray-400" />
              </div>
            </div>
          </a>
        </div>
      ))}
    </div>
  );
};

export default Releases;
