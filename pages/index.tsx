import React from "react";
import type { GetServerSideProps } from "next";
// Removed Layout import as it's handled by _app.tsx
// import Layout from "../components/Layout";
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
    if (!res.ok) {
        // Handle API errors more gracefully
        console.error(`Failed to fetch discover: ${res.status} ${res.statusText}`);
        return { props: { tracks: [], updated: null } }; // Return empty/null props on error
    }
    const resp: RecommendedTracksResp = await res.json();
    return {
      props: { tracks: resp.tracks, updated: resp.updated },
    };
  } catch (err) {
    console.error("Error in getServerSideProps:", err);
    return {
      props: { tracks: [], updated: null }, // Return empty/null props on catch
    };
  }
};

type Props = {
  tracks: Track[];
  updated: string | null; // Allow updated to be null from error handling
};

const Home: React.FC<Props> = ({ tracks, updated }) => {
  const formattedDate = (() => {
    // Check if updated is null or invalid before processing
    if (!updated || isNaN(new Date(updated).getTime())) {
      // console.error("Invalid updated date:", updated); // Optional logging
      return "recently"; // Provide a fallback message
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
        return "recently"; // Fallback on formatting error
    }
  })();

  // Remove the <Layout> wrapper here
  return (
    <Box>
      <div className="flex flex-col items-start">
        <div className="w-full">
          <div className="pb-8 text-xl italic text-center text-gray-600 dark:text-gray-400"> {/* Added text color */}
            Updated {formattedDate}
          </div>
          {tracks && tracks.length > 0 ? (
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"> {/* Added sm breakpoint */}
               {tracks.map((track) => (
                 <TrackItem track={track} key={track.source_id} />
               ))}
             </div>
           ) : (
             <div className="text-center text-gray-500 py-10">
                 No tracks found. Try again later.
             </div> // Display a message if no tracks
           )
          }
        </div>
      </div>
    </Box>
  );
};

export default Home;