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
  const res = await fetch(`${SERVER_HOST}/spotify/recommended_tracks`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ genre: "hot" }),
  });
  const resp: RecommendedTracksResp = await res.json();
  return {
    props: { tracks: shuffle(resp.tracks).slice(0, 48) },
  };
};

type Props = {
  tracks: Track[];
};

const Home: React.FC<Props> = ({ tracks }) => {
  const [selectedGenre, setSelectedGenre] = useState("HOT");
  const [displayedTracks, setDisplayedTracks] = useState(tracks);
  const genres = ["HOT", "POP", "HIP-HOP", "COUNTRY", "ELECTRONIC"];

  useEffect(() => {
    const getTracks = async () => {
      const newTracks = await fetchTracks(selectedGenre.toLowerCase()); // Pass lowercase genre
      setDisplayedTracks(newTracks);
    };
    getTracks();
  }, [selectedGenre]);
  console.log({ displayedTracks });
  return (
    <Layout>
      <Box>
        <div className="flex flex-col items-start">
          {/* Mobile: Stack elements vertically */}
          <div>
            <div className="text-4xl md:text-7xl font-bold font-mono">
              beatbrain
            </div>
            <div className="text-base md:text-2xl">
              Share and discover your favorite tunes
            </div>
          </div>
          <div className="flex flex-wrap mt-4">
            {genres.map((genre) => (
              <button
                key={genre}
                onClick={() => setSelectedGenre(genre)}
                className={`px-4 py-2 rounded-full font-medium mr-2 mb-2
                 ${
                   selectedGenre === genre
                     ? "bg-blue-500 text-white"
                     : "bg-gray-200 text-gray-800"
                 }`}
              >
                {genre}
              </button>
            ))}
          </div>
        </div>

        {displayedTracks.length > 0 && (
          <div className="mt-8 mb-24 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {displayedTracks.map((t, index) => {
              const trackLink = `/t/${t.source.toLowerCase()}/${t.source_id}`;
              return (
                <div key={index} className="flex">
                  <div className="flex flex-col">
                    <Link href={trackLink}>
                      <Image
                        src={t.image}
                        alt={`Track ${index}`}
                        width={300}
                        height={300}
                        className="object-cover"
                        unoptimized
                      />
                    </Link>
                    <div className="text-xl font-bold">
                      <Link href={trackLink}>{t.artist}</Link>
                    </div>
                    <div className="text-lg">
                      <Link href={trackLink}>{t.name}</Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Box>
    </Layout>
  );
};

export default Home;
