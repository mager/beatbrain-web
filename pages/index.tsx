import React from "react";
import type { GetServerSideProps } from "next";
import Layout from "../components/Layout";
import type { RecommendedTracksResp, Track } from "@types";
import { SERVER_HOST } from "@util";
import Box from "@components/Box";
import TrackItem from "../components/TrackItem";

export const getServerSideProps: GetServerSideProps = async () => {
  try {
    const res = await fetch(`${SERVER_HOST}/discover`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        popular: 0,
      }),
    });
    const resp: RecommendedTracksResp = await res.json();
    return {
      props: { tracks: resp.tracks, updated: resp.updated },
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
  updated: string;
};

const Home: React.FC<Props> = ({ tracks, updated }) => {
  const formattedDate = (() => {
    if (!updated || isNaN(new Date(updated).getTime())) {
      console.error("Invalid updated date:", updated);
      return "";
    }
    return new Date(updated)
      .toUTCString()
      .replace("GMT", "UTC")
      .split(" ")
      .slice(0, 4)
      .join(" ");
  })();
  return (
    <Layout>
      <Box>
        <div className="flex flex-col items-start">
          <div className="w-full">
            <div className="pb-8 text-xl italic text-center">
              Updated {formattedDate}
            </div>
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
