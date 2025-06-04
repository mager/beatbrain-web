import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { GetTrackResponseV2, TrackV2 } from "@types";
import GiantTitle from "@components/GiantTitle";
import Box from "@components/Box";
import Subtitle from "@components/Subtitle";
import Image from "next/image";

export default function Track() {
  const router = useRouter();
  const { isrc } = router.query;
  const [track, setTrack] = useState<TrackV2 | null>(null);

  useEffect(() => {
    if (!isrc) return;
    
    const fetchTrack = async () => {
      const resp = await fetch(`/api/track?isrc=${isrc}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await resp.json();
      setTrack(data);
    };

    fetchTrack();
  }, [isrc]);

  if (!track) return <div>Loading...</div>;

  return (
    <Box>
      <GiantTitle>{track.name}</GiantTitle>
      <Subtitle>{track.artist}</Subtitle>
      <Image
        src={track.image || "https://placehold.co/300"}
        alt={track.name || "Track artwork"}
        width={300}
        height={300}
        className="object-cover w-full block"
        unoptimized
        priority
      />
    </Box>
  );
}