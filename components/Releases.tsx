import React, { useState, useMemo } from "react";
import Image from "next/image";
import type { Release } from "@types";
import { MusicalNoteIcon } from "@heroicons/react/24/solid";

interface Props {
  releases: Release[];
  className?: string;
}

// Utility function to group releases by country
const groupReleasesByCountry = (releases: Release[]) => {
  const grouped: { [country: string]: Release[] } = {};
  releases.forEach((release) => {
    const country = release.country || "Unknown";
    if (!grouped[country]) {
      grouped[country] = [];
    }
    grouped[country].push(release);
  });

  // Sort countries for consistent tab order (optional)
  const sortedCountries = Object.keys(grouped).sort((a, b) => {
    if (a === "XW") return -1;
    if (b === "XW") return 1;
    if (a === "XE") return -1;
    if (b === "XE") return 1;
    return a.localeCompare(b);
  });

  const sortedGrouped: { [country: string]: Release[] } = {};
  sortedCountries.forEach(country => {
    sortedGrouped[country] = grouped[country];
  });

  return sortedGrouped;
};

// Helper to format country names for display
const formatCountryDisplayName = (countryCode: string) => {
  switch (countryCode) {
    case "XE":
      return "Europe";
    case "XW":
      return "Worldwide";
    case "Unknown":
      return "Unknown Region";
    default:
      return countryCode;
  }
};

// Helper to get the flag emoji from a country code
const getFlagEmoji = (countryCode: string) => {
  if (countryCode === "XE") return "🇪🇺"; // Europe
  if (countryCode === "XW") return "🌍"; // Worldwide
  if (countryCode === "Unknown") return "❓"; // Unknown
  // Convert ISO country code to flag emoji
  if (countryCode.length === 2) {
    const codePoints = countryCode
      .toUpperCase()
      .split("")
      .map(char => 127397 + char.charCodeAt(0));
    return String.fromCodePoint(...codePoints);
  }
  return "❓";
};

const Releases: React.FC<Props> = ({ releases, className = "" }) => {
  const groupedReleases = useMemo(() => {
    if (!releases) return {};
    return groupReleasesByCountry(releases);
  }, [releases]);

  const countries = useMemo(() => Object.keys(groupedReleases), [groupedReleases]);
  const [activeTab, setActiveTab] = useState<string | null>(countries[0] || null);

  if (!releases || releases.length === 0) {
    return null;
  }

  return (
    <div className={`flex flex-col ${className}`}>
      {countries.length > 0 && (
        <div className="mb-8">
          <nav className="flex space-x-2" aria-label="Tabs">
            {countries.map((countryCode) => (
              <button
                key={countryCode}
                onClick={() => setActiveTab(countryCode)}
                className={`$${
                  activeTab === countryCode
                    ? "opacity-100 scale-110"
                    : "opacity-60 hover:opacity-100"
                } p-0 m-0 bg-transparent focus:outline-none transition-transform duration-150 flex items-center justify-center`}
                aria-current={activeTab === countryCode ? "page" : undefined}
                style={{ border: 'none', boxShadow: 'none', background: 'none' }}
              >
                <span
                  className={`flex items-center justify-center transition-colors duration-150 w-8 h-8
                    ${activeTab === countryCode
                      ? 'border-b-2 border-gray-300'
                      : ''}
                  `}
                  title={formatCountryDisplayName(countryCode)}
                  style={{ fontSize: '1.5rem', lineHeight: 1 }}
                >
                  {getFlagEmoji(countryCode)}
                </span>
              </button>
            ))}
          </nav>
        </div>
      )}
      {activeTab && groupedReleases[activeTab] && groupedReleases[activeTab].length > 0 ? (
        <div className="flex flex-col gap-4">
          {groupedReleases[activeTab].map((release) => (
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
                <div className="w-[128px] h-[128px] relative border border-grey-300 bg-white">
                  <Image
                    src={release.image}
                    alt="Release cover"
                    fill
                    className="object-cover"
                    unoptimized
                    sizes="128px"
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
              {release.images && release.images.length > 0 ? (
                <div className="flex flex-row gap-2">
                  {release.images.map((img, idx) => (
                    <div
                      key={img.id ?? idx}
                      className="w-[64px] h-[64px] relative border border-grey-300 bg-white"
                      style={{ flex: "0 0 auto" }}
                    >
                      <Image
                        src={img.image}
                        alt={`Release image ${idx + 1}`}
                        fill
                        className="object-cover"
                        unoptimized
                        sizes="64px"
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
                        <MusicalNoteIcon className="h-8 w-8 text-gray-400" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : null}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p>No releases found for this country.</p>
      )}
    </div>
  );
};

export default Releases;
