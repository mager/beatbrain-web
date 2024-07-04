import React from "react";
import type { GetServerSideProps } from "next";
import Image from "next/image";
import Layout from "../components/Layout";
import { shuffle } from "../lib/util";
import Title from "../components/Title";

type GetFeaturedTracksResp = {
  tracks: Track[];
};

type Track = {
  image: string;
  artist: string;
  name: string;
};

export const getServerSideProps: GetServerSideProps = async () => {
  const res = await fetch(
    "https://occipital-cqaymsy2sa-uc.a.run.app/spotify/get_featured_tracks"
  );
  const resp: GetFeaturedTracksResp = await res.json();
  return {
    props: { tracks: shuffle(resp.tracks).slice(0, 12) },
  };
};

type Props = {
  tracks: Track[];
};

const Home: React.FC<Props> = ({ tracks }) => {
  return (
    <Layout>
      <div className="py-4">
        <Title>
          <span className="text-5xl font-mono">beatbrain</span>{" "}
          <span className="text-xl">
            Share and discover your favorite tunes
          </span>
        </Title>
        {tracks && (
          <div className="mt-8 mb-24 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {tracks.map((t, index) => (
              <div key={index} className="flex">
                <div className="flex flex-col">
                  <Image
                    src={t.image}
                    alt={`Track ${index}`}
                    width={300}
                    height={300}
                    className="object-cover"
                  />
                  <div className="text-xl font-bold">{t.artist}</div>
                  <div className="text-lg">{t.name}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Home;
