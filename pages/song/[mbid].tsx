import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/router";
import { TrackV3, Release } from "@types";
import GiantTitle from "@components/GiantTitle";
import Subtitle from "@components/Subtitle";
import Image from "next/image";
import Meta from "@components/Meta";
import Relations from "@components/Relations";
import Genres from "@components/Genres";
import Releases from "@components/Releases";

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

export default function Track() {
  const router = useRouter();
  const { mbid } = router.query;
  const [track, setTrack] = useState<TrackV3 | null>(null);
  const [activeTab, setActiveTab] = useState<string | null>(null);

  useEffect(() => {
    if (!mbid) return;

    const fetchTrack = async () => {
      const resp = await fetch(`/api/song?mbid=${mbid}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await resp.json();
      setTrack(data);

      // After fetching track data, set the initial active tab
      if (data && data.releases && data.releases.length > 0) {
        const grouped = groupReleasesByCountry(data.releases);
        const firstCountry = Object.keys(grouped)[0];
        if (firstCountry) {
          setActiveTab(firstCountry);
        }
      }
    };

    fetchTrack();
  }, [mbid]);

  // Group releases by country whenever `track.releases` changes
  const groupedReleases = useMemo(() => {
    if (!track?.releases) {
      return {};
    }
    return groupReleasesByCountry(track.releases);
  }, [track?.releases]);

  // Extract unique country codes for tabs
  const countries = useMemo(() => Object.keys(groupedReleases), [groupedReleases]);

  if (!track) return <div>Loading...</div>;

  const formatReleaseDate = (dateString: string): string => {
    try {
      const dateObj = new Date(dateString);
      if (isNaN(dateObj.getTime())) {
        return "Invalid Date";
      }
      const month = dateObj.toLocaleString("default", { month: "short" });
      const year = dateObj.getFullYear();
      return `Released in ${month} ${year}`;
    } catch (e) {
      console.error("Error parsing date:", dateString, e);
      return "Unknown Release Date";
    }
  };

  return (
    <div className="py-2 pb-8 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
      <div className="col-span-1 xl:col-span-3">
        <div className="relative">
          <GiantTitle title={track.isrc}>{track.name}</GiantTitle>
          <Subtitle>{track.artist}</Subtitle>
          <Meta>{formatReleaseDate(track.release_date)}</Meta>
          <Genres genres={track.genres || []} />

          {/* Country tabs and grouped releases are now handled inside Releases component */}
          <Releases releases={track.releases || []} />
        </div>

        <div className="md:hidden mt-4 border-b-4 border-gray-300 mb-4 pb-4">
          <div className="relative mb-4 border-4 border-black group">
            <Image
              src={track.image}
              placeholder="empty"
              alt={track.name || "Track artwork"}
              width={300}
              height={300}
              className="object-cover w-full block"
              unoptimized
              priority
            />
          </div>
          <Relations
            instruments={track.instruments || []}
            production_credits={track.production_credits || []}
            song_credits={track.song_credits || []}
          />
        </div>
      </div>

      <div className="col-span-1 xl:col-span-1 hidden md:block">
        <div className="relative mb-4 border-4 border-black group">
          <Image
            src={track.image}
            placeholder="empty"
            alt={track.name || "Track artwork"}
            width={300}
            height={300}
            className="object-cover w-full block"
            unoptimized
          />
        </div>
        <Relations
          instruments={track.instruments || []}
          production_credits={track.production_credits || []}
          song_credits={track.song_credits || []}
        />
      </div>
    </div>
  );
}