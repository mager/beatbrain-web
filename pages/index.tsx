import React from "react";
import type { GetServerSideProps } from "next";
import Image from "next/image";
import Layout from "../components/Layout";
import { shuffle } from "../lib/util";
import Title from "../components/Title";
import type { RecommendedTracksResp, Track } from "@types";
import Link from "next/link";
import { SERVER_HOST } from "@util";

export const getServerSideProps: GetServerSideProps = async () => {
  const res = await fetch(`${SERVER_HOST}/spotify/recommended_tracks`);
  const resp: RecommendedTracksResp = await res.json();
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
            {tracks.map((t, index) => {
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
      </div>
    </Layout>
  );
};

export default Home;
