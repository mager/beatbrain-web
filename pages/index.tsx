import React, { useState, useEffect } from "react";
import type { RecommendedTracksResp, Track } from "@types";
import Box from "@components/Box";
import TrackItem from "../components/TrackItem";
// import { useAppContext } from "../context/AppContext";

type Props = {};
const Home: React.FC<Props> = () => {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [activeFilter, setActiveFilter] = useState<'hot' | 'new'>('new');
  const [updated, setUpdated] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  // const { setTracks: setContextTracks } = useAppContext();

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
        setUpdated(null);
        return;
      }
      const resp: RecommendedTracksResp = await res.json();
      console.log('Received tracks response:', resp);
      console.log('First track data:', resp.tracks[0]);
      setTracks(resp.tracks);
      // setContextTracks(resp.tracks);
      setUpdated(resp.updated || null);
    } catch (err) {
      console.error("Error fetching tracks:", err);
      setUpdated(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch initial tracks on component mount
  useEffect(() => {
    fetchTracks('new');
  }, []);

  const handleFilterChange = (filter: 'hot' | 'new') => {
    setTracks([]);
    setIsLoading(true);
    setUpdated(null);
    setActiveFilter(filter);
    
    setTimeout(() => {
      fetchTracks(filter);
    }, 0);
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
          {isLoading ? (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-0.5 p-0">
              {[...Array(96)].map((_, i) => (
                <div
                  key={i}
                  className="aspect-square bg-gray-200 rounded animate-pulse"
                />
              ))}
            </div>
          ) : tracks && tracks.length > 0 ? (
             <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-0.5 p-0">
               {tracks.map((track) => (
                 <TrackItem track={track} key={track.id} />
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