import React, { useState } from "react";
import { GetServerSideProps } from "next";
import Image from "next/image";
import Link from "next/link";
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

const SavedByText = ({ author, othersCount }) => {
  return (
    <p>
      Saved by{" "}
      <Link
        href={`/u/${author.name}`}
        className="border-b-2 hover:border-green-300"
      >
        {author.name}
      </Link>
      {othersCount > 0 && (
        <>
          , and {othersCount} {othersCount === 1 ? "other" : "others"}
        </>
      )}
    </p>
  );
};

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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [content, setContent] = useState("");

  const {
    artist,
    genres,
    image,
    instruments,
    isrc,
    name,
    production_credits,
    song_credits,
    release_date,
    source_id,
  } = track;

  const author = posts[0]?.author;
  const othersCount = posts.length - 1;

  const submitPost = async () => {
    const body = {
      content,
      track: {
        source: "SPOTIFY",
        sourceId: source_id,
        artist,
        title: name,
        image,
      },
    };
    await fetch(`/api/post`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setIsModalOpen(false);
  };

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
            song_credits={song_credits}
          />
          {posts && posts.length > 0 && (
            <div className="mt-4 mb-2 flex items-center">
              <img
                src={posts[0].author.image}
                alt={posts[0].author.name}
                className="w-8 h-8 rounded-full mr-2"
              />
              <SavedByText author={author} othersCount={othersCount} />
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
              onClick={() => setIsModalOpen(true)}
            >
              Save
            </button>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="modal-content bg-white rounded-lg p-6 shadow-lg">
            <h2 className="text-xl font-bold mb-4">Share your thoughts</h2>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="How does it make you feel?"
              className="w-full h-24 border border-gray-300 rounded-md p-2"
            />
            <div className="mt-4 flex justify-end">
              <button
                className="bg-blue-500 text-white rounded-lg px-4 py-2 mr-2"
                onClick={submitPost}
              >
                Post
              </button>
              <button
                className="bg-gray-300 text-gray-700 rounded-lg px-4 py-2"
                onClick={() => setIsModalOpen(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Track;
