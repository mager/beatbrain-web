import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { TrackV3 } from "@types";
import GiantTitle from "@components/GiantTitle";
import Subtitle from "@components/Subtitle";
import Image from "next/image";
import Meta from "@components/Meta";
import Relations from "@components/Relations";
import Genres from "@components/Genres";
import Releases from "@components/Releases";

export default function Track() {
  const router = useRouter();
  const { mbid } = router.query;
  const [track, setTrack] = useState<TrackV3 | null>(null);
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
    };

    fetchTrack();
  }, [mbid]);

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
          <Releases releases={track.releases|| []} />
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