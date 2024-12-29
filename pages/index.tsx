import React from "react";
import type { GetServerSideProps } from "next";
import Layout from "../components/Layout";
import type { RecommendedTracksResp, Track } from "@types";
import { SERVER_HOST } from "@util";
import Box from "@components/Box";
import TrackItem from "../components/TrackItem";
import Subtitle from "@components/Subtitle";

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
      props: { tracks: resp.tracks },
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
        <div className="flex gap-2">
          <button className="p-2 bg-green-500 text-white text-md">HOT</button>
          <button
            disabled
            className="p-2 bg-gray-200 text-md text-gray-400 cursor-not-allowed"
          >
            HIP-HOP
          </button>
          <button
            disabled
            className="p-2 bg-gray-200 text-md text-gray-400 cursor-not-allowed"
          >
            ELECTRONIC
          </button>
        </div>
      </Box>
      <Box>
        <div className="flex flex-col items-start">
          <div className="w-full">
            <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {tracks.map((track) => (
                <TrackItem track={track} key={track.source_id} />
              ))}
            </div>
          </div>
        </div>
      </Box>
    </Layout>
  );
};

export default Home;
