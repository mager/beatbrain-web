import React, { useState, useEffect } from "react";
import type { GetServerSideProps } from "next";
import Image from "next/image";
import Layout from "../components/Layout";
import { shuffle } from "../lib/util";
import type { RecommendedTracksResp, Track } from "@types";
import Link from "next/link";
import { SERVER_HOST } from "@util";
import Box from "@components/Box";

const fetchTracks = async (genre: string = "hot") => {
  const res = await fetch(`/api/tracks`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ genre }),
  });
  const resp: RecommendedTracksResp = await res.json();
  return shuffle(resp.tracks).slice(0, 48);
};

export const getServerSideProps: GetServerSideProps = async () => {
  try {
    const res = await fetch(`${SERVER_HOST}/discover`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({}),
    });
    const resp: RecommendedTracksResp = await res.json();
    return {
      props: { tracks: shuffle(resp).slice(0, 96) },
    };
  } catch (err) {
    console.log(err);
    return {
      props: { tracks: [] },
    };
  }
};

type Props = {
  tracks: Track[];
};

const Home: React.FC<Props> = ({ tracks }) => {
  return (
    <Layout>
      <Box>
        <div className="flex flex-col items-start">
          <div>
            <div className="text-4xl md:text-7xl font-bold font-mono">
              beatbrain
            </div>
            <div className="text-base md:text-2xl">
              Share and discover your favorite songs
            </div>
          </div>
          <div className="mt-4 w-full">
            <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {tracks.map((track) => (
                <Link
                  href={`/ext/spotify/${track.source_id}`}
                  key={track.source_id}
                  className="block hover:opacity-75 transition-opacity"
                >
                  <div className="flex flex-row lg:flex-col max-w-full">
                    <Image
                      src={track.image}
                      alt={track.name}
                      width={300}
                      height={300}
                      className="w-[100px] h-[100px] lg:w-[300px] lg:h-[300px] object-cover flex-shrink-0"
                    />
                    <div className="ml-4 lg:ml-0 lg:mt-2 flex flex-col justify-center min-w-0">
                      <div className="font-bold truncate max-w-full">
                        {track.name}
                      </div>
                      <div className="text-sm text-gray-600 truncate max-w-full">
                        {track.artist}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </Box>
    </Layout>
  );
};

export default Home;
