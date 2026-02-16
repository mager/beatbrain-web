import React, { useState } from "react";
import { GetServerSideProps } from "next";
import { authClient } from "../../../lib/auth-client";
import prisma from "../../../lib/prisma";
import { useAppContext } from "../../../context/AppContext";

import TrackHero from "@components/TrackHero";
import AudioDNA from "@components/AudioDNA";
import LoudnessMap from "@components/LoudnessMap";
import Credits from "@components/Credits";
import ExternalLinks from "@components/ExternalLinks";
import SavedBy from "@components/SavedBy";
import Releases from "@components/Releases";
import SaveModal from "@components/SaveModal";
import type { TrackV3 } from "@types";
import { SERVER_HOST } from "@util";
import { adaptTrack } from "@adapters/track";

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { sourceId } = context.params;
  if (!sourceId || typeof sourceId !== "string") {
    return { notFound: true };
  }

  // Use the Spotify-first endpoint directly
  const resp = await fetch(`${SERVER_HOST}/track?spotifyId=${sourceId}`);
  if (!resp.ok) {
    console.error(`Failed to fetch track: ${resp.status} ${resp.statusText}`);
    return { notFound: true };
  }

  const respBody = await resp.json();
  if (!respBody.track) {
    return { notFound: true };
  }

  const track = adaptTrack(respBody);

  const posts = await prisma.post.findMany({
    where: { track: { sourceId } },
    select: { author: true },
  });

  return { props: { track, posts, sourceId } };
};

type Props = {
  track: TrackV3;
  posts: { author: { name: string; image: string } }[];
  sourceId: string;
};

const SpotifyTrack: React.FC<Props> = ({ track, posts, sourceId }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [content, setContent] = useState("");
  const { data: session } = authClient.useSession();
  const { state: appState, playTrack } = useAppContext();
  const { user } = appState;

  const spotifyUri = `spotify:track:${sourceId}`;
  const author = posts[0]?.author;
  const othersCount = posts.length > 0 ? posts.length - 1 : 0;
  const hideSaveButton =
    !session || posts.some((post) => post.author.name === user?.name);

  const hasFeatures = !!track.features;
  const hasAnalysis = !!track.analysis?.segments?.length;
  const hasCredits =
    (track.instruments?.length > 0) ||
    (track.production_credits?.length > 0) ||
    (track.song_credits?.length > 0);
  const hasReleases = track.releases?.length > 0;

  const submitPost = async () => {
    const body = {
      content,
      track: {
        source: "SPOTIFY",
        sourceId,
        artist: track.artist,
        title: track.name,
        image: track.image,
      },
    };
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
        name={track.name}
        artist={track.artist}
        image={track.image}
        isrc={track.isrc}
        releaseDate={track.release_date}
        genres={track.genres || []}
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
          <ExternalLinks links={track.links} sourceId={sourceId} />
          <button
            onClick={() => playTrack(spotifyUri)}
            className="border border-terminal-border text-phosphor-dim hover:border-accent/50 hover:text-accent font-mono text-[10px] rounded px-3 py-1.5 transition-all flex items-center gap-1.5"
          >
            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z" />
            </svg>
            Play
          </button>
        </div>

        {/* Popularity bar */}
        {track.popularity !== null && track.popularity !== undefined && (
          <div className="mt-4 flex items-center gap-3">
            <span className="data-label flex-shrink-0">Popularity</span>
            <div className="flex-1 max-w-[200px] h-1.5 bg-white/[0.04] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-accent to-warm"
                style={{ width: `${track.popularity}%` }}
              />
            </div>
            <span className="font-mono text-xs text-phosphor-dim tabular-nums">
              {track.popularity}
            </span>
          </div>
        )}

        {/* Saved By */}
        {posts.length > 0 && author && (
          <div className="mt-4 flex items-center gap-3">
            <img
              src={author.image || "/default-avatar.png"}
              alt={author.name || "User"}
              className="w-7 h-7 rounded-sm border border-terminal-border"
            />
            <SavedBy author={author} othersCount={othersCount} />
          </div>
        )}
      </TrackHero>

      <div className="bb-container pb-16 space-y-8">
        {/* Audio DNA */}
        {hasFeatures && (
          <div className="terminal-window">
            <div className="terminal-titlebar">audio dna</div>
            <div className="p-5 md:p-6">
              <AudioDNA meta={track.meta} features={track.features} />
            </div>
          </div>
        )}

        {/* Loudness Map */}
        {hasAnalysis && (
          <div className="terminal-window">
            <div className="terminal-titlebar">loudness map</div>
            <div className="p-5 md:p-6">
              <LoudnessMap
                segments={track.analysis.segments}
                duration={track.analysis.duration}
              />
            </div>
          </div>
        )}

        {/* Credits */}
        {hasCredits && (
          <div className="terminal-window">
            <div className="terminal-titlebar">credits</div>
            <div className="p-5 md:p-6">
              <Credits
                instruments={track.instruments || []}
                production_credits={track.production_credits || []}
                song_credits={track.song_credits || []}
              />
            </div>
          </div>
        )}

        {/* Releases */}
        {hasReleases && (
          <div className="terminal-window">
            <div className="terminal-titlebar">releases</div>
            <div className="p-5">
              <Releases releases={track.releases} />
            </div>
          </div>
        )}
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

export default SpotifyTrack;
