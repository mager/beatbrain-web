import React, { useState, useEffect } from "react";
import type { RecommendedTracksResp, Track } from "@types";
import Box from "@components/Box";
import TrackItem from "../components/TrackItem";

type Props = {};
const Home: React.FC<Props> = () => {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [activeFilter, setActiveFilter] = useState<'hot' | 'new'>('new');
  const [updated, setUpdated] = useState<string | null>(null);

  const fetchTracks = async (filter: 'hot' | 'new') => {
    try {
      const res = await fetch(`/api/discover`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          mode: filter,
        }),
      });
      if (!res.ok) {
        console.error(`Failed to fetch discover: ${res.status} ${res.statusText}`);
        setTracks([]);
        setUpdated(null);
        return;
      }
      const resp: RecommendedTracksResp = await res.json();
      console.log('Received tracks response:', resp);
      setTracks(resp.tracks);
      setUpdated(resp.updated || null);
    } catch (err) {
      console.error("Error fetching tracks:", err);
      setTracks([]);
      setUpdated(null);
    }
  };

  // Fetch initial tracks on component mount
  useEffect(() => {
    fetchTracks('new');
    setActiveFilter('new');
  }, []);

  const handleFilterChange = (filter: 'hot' | 'new') => {
    setActiveFilter(filter);
    fetchTracks(filter);
  };

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
          <div className="flex justify-center gap-4 mb-8">
            <button
              onClick={() => handleFilterChange('new')}
              className={`px-6 py-2 rounded-full text-lg font-medium transition-colors ${
                activeFilter === 'new'
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
              }`}
            >
              NEW
            </button>
            <button
              onClick={() => handleFilterChange('hot')}
              className={`px-6 py-2 rounded-full text-lg font-medium transition-colors ${
                activeFilter === 'hot'
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
              }`}
            >
              HOT
            </button>
          </div>
          {tracks && tracks.length > 0 ? (
             <div className="grid grid-cols-3 gap-1 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 p-0 sm:gap-2">
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
          <div className="w-full flex justify-end mt-4">
            <span className="text-xs text-gray-400 italic">Last updated: {formattedDate}</span>
          </div>
        </div>
      </div>
    </Box>
  );
};

export default Home;