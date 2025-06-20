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
    <div className={`flex flex-col gap-4 ${className}`}>
      {releases.map((release) => (
        <div key={release.id} className="flex flex-col items-start border-b-2 border-gray-200 pb-6">
          <div className="mb-2">
            <span className="text-sm text-gray-500">
              {release.date}
              {release.disambiguation && (
                <>
                  {" "}- {release.disambiguation}
                </>
              )}
            </span>
          </div>
          <div className="flex flex-row gap-4">
            <div className="w-[100px] h-[100px] relative border-2 border-black bg-white">
              <Image
                src={release.image}
                alt="Release cover"
                fill
                className="object-cover rounded"
                unoptimized
                sizes="100px"
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
            {/* Future: Add more images here in the row */}
          </div>
        </div>
      ))}
    </div>
  );
};

export default Releases;
