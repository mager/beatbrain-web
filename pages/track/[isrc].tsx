import React, { useState } from "react";
import { GetServerSideProps } from "next";
import { SERVER_HOST } from "@util";
import { GetTrackResponseV2, TrackV2 } from "@types";



export const getServerSideProps: GetServerSideProps = async (context) => {
  const { isrc } = context.params;
  if (!isrc || typeof isrc !== "string") {
    return { notFound: true };
  }
  const resp = await fetch(`${SERVER_HOST}/track?isrc=${isrc}`);
  const respBody: GetTrackResponseV2 = await resp.json();
  return { props: { track: respBody.track } };
};

export default function Track({ track }: { track: TrackV2 }) {
  return <div>{track.name}</div>;
}