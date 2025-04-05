import React, { useState, useEffect } from "react";
import { GetServerSideProps } from "next";
import Image from "next/image";
import { PrismaClient } from "@prisma/client";
import { useSession } from "next-auth/react";
import { useAppContext } from "../../../context/AppContext";
import { PlayIcon } from '@heroicons/react/24/solid';

import GiantTitle from "@components/GiantTitle";
import SavedBy from "@components/SavedBy";
import Subtitle from "@components/Subtitle";
import Relations from "@components/Relations";
import ExternalLinks from "@components/ExternalLinks";
import Meta from "@components/Meta";
import Genres from "@components/Genres";
import type { GetTrackResponse, Track as TrackType } from "@types";
import { SERVER_HOST } from "@util";
import SaveModal from "@components/SaveModal";

const prisma = new PrismaClient();

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { sourceId } = context.params;
  if (!sourceId || typeof sourceId !== 'string') {
    return { notFound: true };
  }
  const resp = await fetch(
    `${SERVER_HOST}/track?source=SPOTIFY&sourceId=${sourceId}`
  );

  if (!resp.ok) {
    console.error(`Failed to fetch track: ${resp.status} ${resp.statusText}`);
    return { notFound: true };
  }

  const response: GetTrackResponse = await resp.json();

  if (!response.track) {
    return { notFound: true };
  }

  const posts = await prisma.post.findMany({
    where: {
      track: {
        sourceId: sourceId,
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
  track: TrackType;
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
  const { data: session } = useSession();
  const { state: appState, playTrack } = useAppContext();
  const { user } = appState;
  const username = user?.name;

  const formatReleaseDate = (dateString: string): string => {
    try {
        const dateObj = new Date(dateString);
        if (isNaN(dateObj.getTime())) {
            return "Invalid Date";
        }
        const month = dateObj.toLocaleString('default', { month: 'short' });
        const year = dateObj.getFullYear();
        return `Released in ${month} ${year}`;
    } catch (e) {
        console.error("Error parsing date:", dateString, e);
        return "Unknown Release Date";
    }
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
  const othersCount = posts.length > 0 ? posts.length - 1 : 0;
  const hideSaveButton = posts.some((post) => post.author.name === username);
  const spotifyUri = `spotify:track:${source_id}`;

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
    try {
        const response = await fetch(`/api/post`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        });
        if (!response.ok) {
            throw new Error('Failed to save post');
        }
        setIsModalOpen(false);
        setContent("");
    } catch (error) {
        console.error("Error submitting post:", error);
    }
  };

  const handlePlayClick = () => {
    if (spotifyUri && spotifyUri !== 'spotify:track:undefined') {
      playTrack(spotifyUri);
    }
  };

  // Removed the useEffect that automatically played the track on load.
  // Playback is now triggered by the handlePlayClick function via the button.

  return (
    <>
      <div className="py-2 pb-8 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="col-span-1 xl:col-span-3">
          <GiantTitle title={isrc}>{name}</GiantTitle>
          <Subtitle>{artist}</Subtitle>
          <Meta>{formatReleaseDate(release_date)}</Meta>
          <Genres genres={genres} />

          <div className="md:hidden border-b-4 border-gray-300 mb-4 pb-4">
            <div className="relative mb-4 border-4 border-black group">
              <Image
                src={image || '/placeholder-image.png'}
                alt={name || 'Track artwork'}
                width={300}
                height={300}
                className="object-cover w-full block"
                unoptimized
                priority
              />
              <button
                onClick={handlePlayClick}
                className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 hover:bg-opacity-60 transition-opacity duration-200 ease-in-out z-10 cursor-pointer"
                aria-label={`Play ${name}`}
              >
                <PlayIcon className="h-16 w-16 text-white opacity-80 group-hover:opacity-100 transform group-hover:scale-110 transition-all duration-200" />
              </button>
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
                src={posts[0].author.image || '/default-avatar.png'}
                alt={posts[0].author.name || 'User'}
                className="w-8 h-8 rounded-full mr-2 border border-gray-300"
              />
              <SavedBy author={author} othersCount={othersCount} />
            </div>
          )}

          {!hideSaveButton && (
            <div className="pt-4">
              <button
                className="cursor-pointer focus:outline-none text-white bg-green-500 hover:bg-green-600 focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-lg px-5 py-2.5 me-2 mb-2 transition duration-150 ease-in-out"
                onClick={() => setIsModalOpen(true)}
              >
                Save Track
              </button>
            </div>
          )}
        </div>

        <div className="col-span-1 xl:col-span-1 hidden md:block">
           <div className="relative mb-4 border-4 border-black sticky top-24 group">
            <Image
              src={image || '/placeholder-image.png'}
              alt={name || 'Track artwork'}
              width={300}
              height={300}
              className="object-cover w-full block"
              unoptimized
            />
            <button
              onClick={handlePlayClick}
              className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 hover:bg-opacity-60 transition-opacity duration-200 ease-in-out z-10 cursor-pointer"
              aria-label={`Play ${name}`}
            >
              <PlayIcon className="h-16 w-16 text-white opacity-80 group-hover:opacity-100 transform group-hover:scale-110 transition-all duration-200" />
            </button>
          </div>
          <div className="sticky top-[348px]">
             <ExternalLinks sourceId={source_id} />
             <Relations
                instruments={instruments}
                production_credits={production_credits}
                song_credits={song_credits}
             />
          </div>
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
    </>
  );
};

export default Track;