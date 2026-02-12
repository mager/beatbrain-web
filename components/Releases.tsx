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

  const sortedCountries = Object.keys(grouped).sort((a, b) => {
    if (a === "XW") return -1;
    if (b === "XW") return 1;
    if (a === "XE") return -1;
    if (b === "XE") return 1;
    return a.localeCompare(b);
  });

  const sortedGrouped: { [country: string]: Release[] } = {};
  sortedCountries.forEach(country => {
    sortedGrouped[country] = grouped[country].sort((a, b) => {
      if (!a.date && !b.date) return 0;
      if (!a.date) return 1;
      if (!b.date) return -1;
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
  });

  return sortedGrouped;
};

const formatCountryDisplayName = (countryCode: string) => {
  switch (countryCode) {
    case "XE": return "Europe";
    case "XW": return "Worldwide";
    case "Unknown": return "Unknown Region";
    default: return countryCode;
  }
};

const getFlagEmoji = (countryCode: string) => {
  if (countryCode === "XE") return "🇪🇺";
  if (countryCode === "XW") return "🌍";
  if (countryCode === "Unknown") return "❓";
  if (countryCode.length === 2) {
    const codePoints = countryCode
      .toUpperCase()
      .split("")
      .map(char => 127397 + char.charCodeAt(0));
    return String.fromCodePoint(...codePoints);
  }
  return "❓";
};

const formatReleaseDate = (dateString?: string): string => {
  if (!dateString) return "Unknown Date";
  const dateObj = new Date(dateString);
  if (isNaN(dateObj.getTime())) return "Invalid Date";
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
  const [selectedImages, setSelectedImages] = useState<{ [releaseId: string]: string }>({});
  const [modalOpen, setModalOpen] = useState(false);
  const [modalImage, setModalImage] = useState<string>("");

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
        <div className="mb-6">
          <nav className="flex items-center gap-1" aria-label="Tabs">
            {countries.map((countryCode) => (
              <button
                key={countryCode}
                onClick={() => setActiveTab(countryCode)}
                className={`flex items-center justify-center w-10 h-10 rounded transition-all duration-150 ${
                  activeTab === countryCode
                    ? "bg-terminal-surface border border-accent/30 scale-110"
                    : "opacity-60 hover:opacity-100 border border-transparent hover:border-terminal-border"
                }`}
                aria-current={activeTab === countryCode ? "page" : undefined}
                title={formatCountryDisplayName(countryCode)}
              >
                <span style={{ fontSize: '1.25rem', lineHeight: 1 }}>
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
            const mainImage = selectedImages[release.id] || release.image;
            return (
              <div key={release.id} className="flex flex-col items-start border-b border-terminal-border pb-6">
                <div className="mb-3">
                  <strong className="font-display text-lg text-white">{release.title}</strong>
                  {release.disambiguation && (
                    <span className="text-phosphor-dim font-mono text-xs ml-2">— {release.disambiguation}</span>
                  )}
                  {release.date && (
                    <div className="font-mono text-xs text-phosphor-dim mt-1">
                      {formatReleaseDate(release.date)}
                    </div>
                  )}
                </div>
                <div className="flex flex-row gap-4">
                  <div className="w-[250px] h-[250px] relative border border-terminal-border bg-terminal-surface rounded overflow-hidden">
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
                      <div className="release-placeholder absolute inset-0 hidden items-center justify-center bg-terminal-surface">
                        <MusicalNoteIcon className="h-12 w-12 text-phosphor-dim" />
                      </div>
                    </div>
                  </div>
                  {/* Modal for zoomed image */}
                  {modalOpen && modalImage && (
                    <div
                      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
                      onClick={() => setModalOpen(false)}
                      tabIndex={-1}
                      aria-modal="true"
                      role="dialog"
                    >
                      <div
                        className="relative bg-terminal-surface border border-terminal-border rounded shadow-2xl flex items-center justify-center"
                        style={{ width: 520, height: 520 }}
                        onClick={e => e.stopPropagation()}
                      >
                        <Image
                          src={modalImage}
                          alt="Release cover zoomed"
                          fill
                          className="object-contain rounded"
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
                        <div className="release-placeholder absolute inset-0 hidden items-center justify-center bg-terminal-surface">
                          <MusicalNoteIcon className="h-20 w-20 text-phosphor-dim" />
                        </div>
                        <button
                          className="absolute top-3 right-3 bg-terminal-bg border border-terminal-border rounded-sm p-1.5 hover:border-accent/50 transition-colors"
                          onClick={() => setModalOpen(false)}
                          aria-label="Close modal"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-phosphor-dim" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
                        className={`w-[64px] h-[64px] relative border bg-terminal-surface cursor-pointer rounded overflow-hidden transition-all ${
                          selectedImages[release.id] === img.image
                            ? 'border-accent ring-1 ring-accent'
                            : 'border-terminal-border hover:border-accent/50'
                        }`}
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
                        <div className="release-placeholder absolute inset-0 hidden items-center justify-center bg-terminal-surface">
                          <MusicalNoteIcon className="h-8 w-8 text-phosphor-dim" />
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
        <p className="text-phosphor-dim font-mono text-xs">No releases found for this region.</p>
      )}
    </div>
  );
};

export default Releases;
