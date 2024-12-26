import React, { useEffect } from "react";
import { GetServerSideProps } from "next";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";
import { PrismaClient } from "@prisma/client";

import Layout from "@components/Layout";
import GiantTitle from "@components/GiantTitle";
import Subtitle from "@components/Subtitle";
import Relations from "@components/Relations";
import Meta from "@components/Meta";
import Tag from "@components/Tag";
import type { GetTrackResponse, Track } from "@types";
import { SERVER_HOST, getSpotifyTrackURL } from "@util";

const prisma = new PrismaClient();

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { sourceId } = context.params;
  const resp = await fetch(
    `${SERVER_HOST}/track?source=SPOTIFY&sourceId=${sourceId}`
  );
  const response: GetTrackResponse = await resp.json();

  const posts = await prisma.post.findMany({
    where: {
      track: {
        sourceId: sourceId as string,
      },
    },
    select: {
      author: true,
    },
  });

  return {
    props: { track: response.track, posts },
  };
};

type Props = {
  track: Track;
  posts: {
    author: {
      name: string;
      image: string;
    };
  }[];
};

const Track: React.FC<Props> = ({ track, posts }) => {
  const {
    artist,
    genres,
    image,
    instruments,
    isrc,
    name,
    production_credits,
    release_date,
    source_id,
  } = track;
  return (
    <Layout>
      <div className="py-2 pb-8 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="col-span-1 xl:col-span-3">
          <GiantTitle title={isrc}>{name}</GiantTitle>
          <Subtitle>{artist}</Subtitle>
          <Meta>
            Released {formatDistanceToNow(new Date(release_date))} ago
          </Meta>
          {genres.length > 0 && (
            <div className="mb-2">
              {genres.map((genre) => (
                <Tag name={genre}>{genre}</Tag>
              ))}
            </div>
          )}
          <Relations
            instruments={instruments}
            production_credits={production_credits}
          />
          {posts && posts.length > 0 && (
            <div className="mt-4 mb-2 flex items-center">
              <img
                src={posts[0].author.image}
                alt={posts[0].author.name}
                className="w-8 h-8 rounded-full mr-2"
              />
              {posts.length > 1 ? (
                <p>
                  Saved by {posts[0].author.name}, and {posts.length - 1} others
                </p>
              ) : (
                <p> Saved by {posts[0].author.name}</p>
              )}
            </div>
          )}
        </div>
        <div className="col-span-1 xl:col-span-1">
          <div className="mb-8 border-4 border-black">
            <Image
              src={image}
              alt={name}
              width={300}
              height={300}
              className="object-cover w-full"
              unoptimized
            />
          </div>
          <div className="pb-12 flex items-center justify-between">
            <a target="blank" href={getSpotifyTrackURL(source_id)}>
              <Image
                src={`/images/icon-spotify.png`}
                width={64}
                height={64}
                alt="Listen on Spotify"
                title="Listen on Spotify"
                unoptimized
              />
            </a>
            <button
              className="cursor-pointer focus:outline-none text-white bg-green-400 hover:bg-green-500 focus:bg-green-600 rounded-lg text-xl p-4 me-2 mb-2"
              onClick={() => console.log("click")}
              disabled
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Track;
