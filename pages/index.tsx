import React from "react";
import type { GetServerSideProps } from "next";
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
        popular: 60,
      }),
    });
    if (!res.ok) {
        console.error(`Failed to fetch discover: ${res.status} ${res.statusText}`);
        return { props: { tracks: [], updated: null } };
    }
    const resp: RecommendedTracksResp = await res.json();
    return {
      props: { tracks: resp.tracks, updated: resp.updated },
    };
  } catch (err) {
    console.error("Error in getServerSideProps:", err);
    return {
      props: { tracks: [], updated: null },
    };
  }
};

type Props = {
  tracks: Track[];
  updated: string | null;
};

const Home: React.FC<Props> = ({ tracks, updated }) => {
  const formattedDate = (() => {
    if (!updated || isNaN(new Date(updated).getTime())) {
      return "recently";
    }
    try {
        return new Date(updated)
        .toUTCString()
        .replace("GMT", "UTC")
        .split(" ")
        .slice(0, 4)
        .join(" ");
    } catch (e) {
        console.error("Error formatting date:", updated, e);
        return "recently"; 
    }
  })();

  return (
    <Box>
      <div className="flex flex-col items-start">
        <div className="w-full">
          <div className="pb-8 text-xl italic text-center text-gray-600 dark:text-gray-400"> 
            Updated {formattedDate}
          </div>
          {tracks && tracks.length > 0 ? (
             <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 p-1 sm:gap-4">
               {tracks.map((track) => (
                 <TrackItem track={track} key={track.source_id} />
               ))}
             </div>
           ) : (
             <div className="text-center text-gray-500 py-10">
                 No tracks found. Try again later.
             </div> 
           )
          }
        </div>
      </div>
    </Box>
  );
};

export default Home;