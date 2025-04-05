import React, { useContext, useState } from "react";
import { AppContext } from "../../../context/AppContext";
import { GetServerSideProps } from "next";
import Image from "next/image";
import { formatDistanceToNowStrict } from "date-fns";
import { PrismaClient } from "@prisma/client";
import SpotifyPlayer from 'react-spotify-web-playback';
import { useSession } from "next-auth/react";

import Layout from "@components/Layout";
import GiantTitle from "@components/GiantTitle";
import SavedBy from "@components/SavedBy";
import Subtitle from "@components/Subtitle";
import Relations from "@components/Relations";
import ExternalLinks from "@components/ExternalLinks";
import Meta from "@components/Meta";
import Genres from "@components/Genres";
import type { GetTrackResponse, Track } from "@types";
import { SERVER_HOST, getSpotifyTrackURL } from "@util";
import SaveModal from "@components/SaveModal";

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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [content, setContent] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const { data: session } = useSession();

  const formatReleaseDate = (date) => {
    const dateObj = new Date(date);
    const month = dateObj.toLocaleString('default', { month: 'short' });
    const year = dateObj.getFullYear();
    return `Released in ${month} ${year}`;
  };

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

  const context = useContext(AppContext);
  const { state } = context;
  const username = state?.user?.username;

  const hideSaveButton = posts.some((post) => post.author.name === username);

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
  const spotifyUri = `spotify:track:${source_id}`;

  // @ts-ignore
  const spotifyToken = session?.accessToken as string | undefined;
  return (
    <Layout>
      <div className="py-2 pb-8 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="col-span-1 xl:col-span-3">
          <GiantTitle title={isrc}>{name}</GiantTitle>
          <Subtitle>{artist}</Subtitle>

          <Meta>
            {formatReleaseDate(release_date)}
          </Meta>
          <Genres genres={genres} />
          <div className="md:hidden border-b-4 border-gray-300">
            <div className="mb-4 border-4 border-black">
              <Image
                src={image}
                alt={name}
                width={300}
                height={300}
                className="object-cover w-full"
                unoptimized
              />
            </div>
            <ExternalLinks sourceId={source_id} />
            <Relations
              instruments={instruments}
              production_credits={production_credits}
              song_credits={song_credits}
            />
          </div>

          {posts && posts.length > 0 && (
            <div className="my-4 py-4 flex items-center">
              <img
                src={posts[0].author.image}
                alt={posts[0].author.name}
                className="w-8 h-8 rounded-full mr-2"
              />
              <SavedBy author={author} othersCount={othersCount} />
            </div>
          )}
          {!hideSaveButton && (
            <div className="pt-4">
              <button
                className="cursor-pointer focus:outline-none text-white bg-green-400 hover:bg-green-500 focus:bg-green-600 rounded-lg text-xl p-4 me-2 mb-2"
                onClick={() => setIsModalOpen(true)}
              >
                Save
              </button>
            </div>
          )}
          {/* Spotify Player */}
          <div className="mt-4">
            {spotifyToken ? ( // Conditionally render the player
              <SpotifyPlayer
                token={spotifyToken} // Use the token from session
                uris={[spotifyUri]}
                play={isPlaying} // use isPlaying
                callback={state => {
                  if (!state.isPlaying) setIsPlaying(false)
                }}
              />
            ) : (
              <p>Loading Spotify Player...</p> // Display a loading message
            )}
            <button onClick={() => setIsPlaying(!isPlaying)}>
              {isPlaying ? 'Pause' : 'Play'}
            </button>
          </div>
        </div>
        <div className="col-span-1 xl:col-span-1 hidden md:block">
          <div className="mb-4 border-4 border-black">
            <Image
              src={image}
              alt={name}
              width={300}
              height={300}
              className="object-cover w-full"
              unoptimized
            />
          </div>
          <ExternalLinks sourceId={source_id} />
          <Relations
            instruments={instruments}
            production_credits={production_credits}
            song_credits={song_credits}
          />
        </div>
      </div>

      {isModalOpen && (
        <SaveModal
          content={content}
          setContent={setContent}
          submitPost={submitPost}
          setIsModalOpen={setIsModalOpen}
        />
      )}
    </Layout>
  );
};

export default Track;
