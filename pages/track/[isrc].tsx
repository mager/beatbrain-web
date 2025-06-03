import React, { useState } from "react";
import { GetServerSideProps } from "next";
import { SERVER_HOST } from "@util";
import { GetTrackResponseV2, TrackV2 } from "@types";
import GiantTitle from "@components/GiantTitle";
import Box from "@components/Box";
import Subtitle from "@components/Subtitle";
import Image from "next/image";


export const getServerSideProps: GetServerSideProps = async (context) => {
  const { isrc } = context.params;
  if (!isrc || typeof isrc !== "string") {
    return { notFound: true };
  }
  const resp = await fetch(`${SERVER_HOST}/track?isrc=${isrc}`);
  const t: GetTrackResponseV2 = await resp.json();
  return { props: { track: t.track } };
};

export default function Track({ track }: { track: TrackV2 }) {
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