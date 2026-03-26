import React, { useState } from "react";
import { GetServerSideProps } from "next";
import { authClient } from "../../lib/auth-client";
import prisma from "../../lib/prisma";
import { useAppContext } from "../../context/AppContext";

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
  const { mbid } = context.params;
  if (!mbid || typeof mbid !== "string") {
    return { notFound: true };
  }

  // Check if mbid is actually a Spotify ID (passed directly from feed/discover)
  const isSpotifyId = mbid.length === 22 && !mbid.includes("-");

  let track;
  let sourceId: string | null = null;

  if (isSpotifyId) {
    // Fast path: hit v2 directly
    const resp = await fetch(`${SERVER_HOST}/v2/track?spotifyId=${mbid}`);
    if (!resp.ok) {
      console.error(`v2 track fetch failed: ${resp.status}`);
      return { notFound: true };
    }
    const body = await resp.json();
    if (!body.track) return { notFound: true };
    track = adaptTrack(body);
    sourceId = mbid;
  } else {
    // MBID path: resolve source_id first, then hit v2
    const mbResp = await fetch(`${SERVER_HOST}/track?mbid=${mbid}`);
    if (!mbResp.ok) {
      console.error(`MB track fetch failed: ${mbResp.status}`);
      return { notFound: true };
    }
    const mbBody = await mbResp.json();
    if (!mbBody.track) return { notFound: true };

    sourceId = mbBody.track.source_id || null;

    if (sourceId) {
      // Upgrade to v2 for full features + cache
      try {
        const v2Resp = await fetch(`${SERVER_HOST}/v2/track?spotifyId=${sourceId}`);
        if (v2Resp.ok) {
          const v2Body = await v2Resp.json();
          if (v2Body.track) {
            track = adaptTrack(v2Body);
          }
        }
      } catch (err) {
        console.warn("v2 upgrade failed, falling back to mbid data", err);
      }
    }

    // Final fallback: use the MB response as-is
    if (!track) {
      track = adaptTrack(mbBody);
    }
  }

  let posts: { author: { name: string; image: string } }[] = [];
  if (sourceId) {
    posts = await prisma.post.findMany({
      where: { track: { sourceId } },
      select: { author: true },
    });
  }

  return { props: { track, posts, sourceId } };
};

type Props = {
  track: TrackV3;
  posts: { author: { name: string; image: string } }[];
  sourceId: string | null;
};

const Song: React.FC<Props> = ({ track, posts, sourceId }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [content, setContent] = useState("");
  const { data: session } = authClient.useSession();
  const { state: appState } = useAppContext();
  const { user } = appState;

  const author = posts[0]?.author;
  const othersCount = posts.length > 0 ? posts.length - 1 : 0;
  const hideSaveButton =
    !session || !sourceId || posts.some((post) => post.author.name === user?.name);

  const hasFeatures = !!track.features;
  const hasAnalysis = !!track.analysis?.segments?.length;
  const hasCredits =
    (track.instruments?.length > 0) ||
    (track.production_credits?.length > 0) ||
    (track.song_credits?.length > 0);
  const hasReleases = track.releases?.length > 0;

  const submitPost = async () => {
    if (!sourceId) return;
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
              className="border border-white/30 text-white hover:bg-white/15 font-mono text-xs px-4 py-2 rounded-lg flex items-center gap-2 transition-all"
              onClick={() => setIsModalOpen(true)}
            >
              <span className="text-sm">+</span>
              Save
            </button>
          )}
          <ExternalLinks links={track.links} />
        </div>

        {/* Popularity bar */}
        {track.popularity !== null && track.popularity !== undefined && (
          <div className="mt-4 flex items-center gap-3">
            <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-white/45 flex-shrink-0">Popularity</span>
            <div className="flex-1 max-w-[180px] h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-accent to-warm"
                style={{ width: `${track.popularity}%` }}
              />
            </div>
            <span className="font-mono text-xs text-white/50 tabular-nums font-semibold">
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
              className="w-7 h-7 rounded-lg border border-white/20"
            />
            <SavedBy author={author} othersCount={othersCount} />
          </div>
        )}
      </TrackHero>

      <div className="bb-container pb-16 space-y-8">
        {/* Audio DNA — the star of the show */}
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

        {/* Credits — liner notes style */}
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

export default Song;
