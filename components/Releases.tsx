import React, { useState, useMemo, useEffect } from "react";
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
    // Sort releases within each country by date (newest first)
    sortedGrouped[country] = grouped[country].sort((a, b) => {
      if (!a.date && !b.date) return 0;
      if (!a.date) return 1; // Releases without dates go to the end
      if (!b.date) return -1;
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
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

// Helper to format release date nicely
const formatReleaseDate = (dateString?: string): string => {
  if (!dateString) return "Unknown Date";
  const dateObj = new Date(dateString);
  if (isNaN(dateObj.getTime())) return "Invalid Date";
  // If day is present, show full date, else just month/year
  if (/\d{4}-\d{2}-\d{2}/.test(dateString)) {
    return dateObj.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }
  return dateObj.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
  });
};

const Releases: React.FC<Props> = ({ releases, className = "" }) => {
  const groupedReleases = useMemo(() => {
    if (!releases) return {};
    return groupReleasesByCountry(releases);
  }, [releases]);

  const countries = useMemo(() => Object.keys(groupedReleases), [groupedReleases]);
  const [activeTab, setActiveTab] = useState<string | null>(countries[0] || null);

  // State to track selected main image per release
  const [selectedImages, setSelectedImages] = useState<{ [releaseId: string]: string }>({});
  
  // State for modal functionality
  const [modalOpen, setModalOpen] = useState(false);
  const [modalImage, setModalImage] = useState<string>("");

  // Handle ESC key to close modal
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && modalOpen) {
        setModalOpen(false);
      }
    };

    if (modalOpen) {
      document.addEventListener('keydown', handleEscKey);
    }

    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [modalOpen]);

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
          {groupedReleases[activeTab].map((release) => {
            // Determine which image to show as main
            const mainImage = selectedImages[release.id] || release.image;
            return (
              <div key={release.id} className="flex flex-col items-start border-b-2 border-gray-200 pb-6">
                <div className="mb-2">
                  <span className="text-sm text-gray-500">
                    {release.date && (
                      <>
                        <span className="font-medium text-gray-700">{formatReleaseDate(release.date)}</span>
                        {" · "}
                      </>
                    )}
                    <strong className="font-bold text-lg md:text-xl text-black">{release.title}</strong>
                    {release.disambiguation && (
                      <>
                        {" "}- {release.disambiguation}
                      </>
                    )}
                  </span>
                </div>
                <div className="flex flex-row gap-4">
                  <div className="w-[250px] h-[250px] relative border border-grey-300 bg-white">
                    <div
                      className="w-full h-full cursor-pointer group"
                      onClick={() => {
                        setModalImage(mainImage.replace(/-(250|1200)\.jpg$/, "-500.jpg"));
                        setModalOpen(true);
                      }}
                      tabIndex={0}
                      role="button"
                      aria-label="Open release cover modal"
                      onKeyDown={e => {
                        if (e.key === "Enter" || e.key === " ") {
                          setModalImage(mainImage.replace(/-(250|1200)\.jpg$/, "-500.jpg"));
                          setModalOpen(true);
                        }
                      }}
                    >
                      <Image
                        src={mainImage}
                        alt="Release cover"
                        fill
                        className="object-cover"
                        unoptimized
                        sizes="250px"
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
                  </div>
                  {/* Modal for zoomed image */}
                  {modalOpen && modalImage && (
                    <div
                      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-md"
                      onClick={() => setModalOpen(false)}
                      tabIndex={-1}
                      aria-modal="true"
                      role="dialog"
                    >
                      <div
                        className="relative bg-white rounded-lg shadow-2xl flex items-center justify-center"
                        style={{ width: 520, height: 520 }}
                        onClick={e => e.stopPropagation()}
                      >
                        <Image
                          src={modalImage}
                          alt="Release cover zoomed"
                          fill
                          className="object-contain"
                          unoptimized
                          sizes="500px"
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
                          <MusicalNoteIcon className="h-20 w-20 text-gray-400" />
                        </div>
                        <button
                          className="absolute top-2 right-2 bg-white rounded-full p-1 shadow hover:bg-gray-100"
                          onClick={() => setModalOpen(false)}
                          aria-label="Close modal"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  )}
                {release.images && release.images.length > 0 ? (
                  <div className="flex flex-1 flex-wrap gap-2">
                    {release.images.map((img, idx) => (
                      <div
                        key={img.id ?? idx}
                        className={`w-[64px] h-[64px] relative border border-grey-300 bg-white cursor-pointer ${selectedImages[release.id] === img.image ? 'ring-2 ring-blue-400' : ''}`}
                        style={{ flex: "0 0 auto" }}
                        onClick={() => {
                          setSelectedImages(prev => ({ ...prev, [release.id]: img.image }));
                        }}
                        title="Set as main image"
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
            );
          })}
        </div>
      ) : (
        <p>No releases found for this country.</p>
      )}
    </div>
  );
};

export default Releases;
