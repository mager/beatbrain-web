import React, { useState } from "react";
import { GetServerSideProps } from "next";
import { useSession } from "next-auth/react";
import prisma from "../../../lib/prisma";
import { useAppContext } from "../../../context/AppContext";

import TrackHero from "@components/TrackHero";
import SavedBy from "@components/SavedBy";
import Relations from "@components/Relations";
import ExternalLinks from "@components/ExternalLinks";
import type { GetTrackResponse, Track as TrackType } from "@types";
import { SERVER_HOST } from "@util";
import SaveModal from "@components/SaveModal";

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { sourceId } = context.params;
  if (!sourceId || typeof sourceId !== "string") {
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
    where: { track: { sourceId } },
    select: { author: true },
  });

  return { props: { track: response.track, posts } };
};

type Props = {
  track: TrackType;
  posts: { author: { name: string; image: string } }[];
};

const Track: React.FC<Props> = ({ track, posts }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [content, setContent] = useState("");
  const { data: session } = useSession();
  const { state: appState, playTrack } = useAppContext();
  const { user } = appState;

  const { artist, genres, image, instruments, isrc, name, production_credits, song_credits, release_date, source_id } = track;
  const author = posts[0]?.author;
  const othersCount = posts.length > 0 ? posts.length - 1 : 0;
  const hideSaveButton = !session || posts.some((post) => post.author.name === user?.name);
  const spotifyUri = `spotify:track:${source_id}`;

  const submitPost = async () => {
    const body = { content, track: { source: "SPOTIFY", sourceId: source_id, artist, title: name, image } };
    try {
      const response = await fetch(`/api/post`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!response.ok) throw new Error("Failed to save post");
      setIsModalOpen(false);
      setContent("");
    } catch (error) {
      console.error("Error submitting post:", error);
    }
  };

  return (
    <>
      <TrackHero
        name={name}
        artist={artist}
        image={image}
        isrc={isrc}
        releaseDate={release_date}
        genres={genres}
      >
        {/* Action Row */}
        <div className="flex items-center gap-3 mt-6 flex-wrap">
          {!hideSaveButton && (
            <button
              className="border border-accent text-accent hover:bg-accent/10 font-mono text-xs px-4 py-2 rounded flex items-center gap-2 transition-colors"
              onClick={() => setIsModalOpen(true)}
            >
              <span className="text-sm">+</span>
              Save
            </button>
          )}
          <ExternalLinks sourceId={source_id} />
          <button
            onClick={() => playTrack(spotifyUri)}
            className="border border-terminal-border text-phosphor-dim hover:border-accent/50 hover:text-accent font-mono text-[10px] rounded px-3 py-1.5 transition-all flex items-center gap-1.5"
          >
            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
            Play
          </button>
        </div>

        {/* Saved By */}
        {posts.length > 0 && author && (
          <div className="mt-6 flex items-center gap-3">
            <img src={author.image || "/default-avatar.png"} alt={author.name || "User"} className="w-7 h-7 rounded-sm border border-terminal-border" />
            <SavedBy author={author} othersCount={othersCount} />
          </div>
        )}
      </TrackHero>

      {/* Credits */}
      <div className="bb-container pb-16">
        {(instruments?.length > 0 || production_credits?.length > 0 || song_credits?.length > 0) && (
          <div className="terminal-window mt-8">
            <div className="terminal-titlebar">credits</div>
            <div className="p-5">
              <Relations instruments={instruments} production_credits={production_credits} song_credits={song_credits} />
            </div>
          </div>
        )}
      </div>

      {isModalOpen && (
        <SaveModal content={content} setContent={setContent} submitPost={submitPost} setIsModalOpen={setIsModalOpen} />
      )}
    </>
  );
};

export default Track;
