import React, { useState, useEffect } from "react"; // Removed useContext if not used elsewhere here
import { GetServerSideProps } from "next";
import Image from "next/image";
// import { formatDistanceToNowStrict } from "date-fns"; // Not used? Remove if unnecessary
import { PrismaClient } from "@prisma/client";
import { useSession } from "next-auth/react";
import { useAppContext } from "../../../context/AppContext"; // --- Import useAppContext ---

// Removed Layout import, as _app.tsx handles it
// import Layout from "@components/Layout";
import GiantTitle from "@components/GiantTitle";
import SavedBy from "@components/SavedBy";
import Subtitle from "@components/Subtitle";
import Relations from "@components/Relations";
import ExternalLinks from "@components/ExternalLinks";
import Meta from "@components/Meta";
import Genres from "@components/Genres";
import type { GetTrackResponse, Track as TrackType } from "@types"; // Renamed Track type to avoid conflict
import { SERVER_HOST } from "@util"; // Removed getSpotifyTrackURL if unused
import SaveModal from "@components/SaveModal";

const prisma = new PrismaClient();

// getServerSideProps remains the same
export const getServerSideProps: GetServerSideProps = async (context) => {
  const { sourceId } = context.params;
  if (!sourceId || typeof sourceId !== 'string') {
    return { notFound: true }; // Handle cases where sourceId is missing or invalid
  }
  const resp = await fetch(
    `${SERVER_HOST}/track?source=SPOTIFY&sourceId=${sourceId}`
  );

  if (!resp.ok) {
    // Handle fetch error, maybe return notFound or an error prop
    console.error(`Failed to fetch track: ${resp.status} ${resp.statusText}`);
    return { notFound: true };
  }

  const response: GetTrackResponse = await resp.json();

  if (!response.track) {
    // Handle case where track is not found by the API
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

// Define the Props type for the component
type Props = {
  track: TrackType; // Use the renamed Track type
  posts: {
    author: {
      name: string;
      image: string;
    };
  }[];
};

// The main Track page component
const Track: React.FC<Props> = ({ track, posts }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [content, setContent] = useState("");
  const { data: session } = useSession(); // Get session data (might not be needed directly here now)

  // --- Use AppContext to get user state and playTrack function ---
  const { state: appState, playTrack } = useAppContext();
  const { user } = appState; // Get user from global context state
  const username = user?.name; // Get username from the context user object
  // --- End Use AppContext ---

  // Helper function to format the release date
  const formatReleaseDate = (dateString: string): string => {
    try {
        const dateObj = new Date(dateString);
        // Check if date is valid
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

  // Destructure track properties for easier access
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

  // Determine who saved the track for the SavedBy component
  const author = posts[0]?.author;
  const othersCount = posts.length > 0 ? posts.length - 1 : 0;

  // Check if the currently logged-in user (from context) has already saved this track
  const hideSaveButton = posts.some((post) => post.author.name === username);

  // Function to handle submitting a post (saving the track)
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
        // Optionally, refetch posts or update UI to show the new save
        setIsModalOpen(false);
        setContent(""); // Clear content after successful save
    } catch (error) {
        console.error("Error submitting post:", error);
        // Handle error (e.g., show a message to the user)
    }
  };

  // Construct the Spotify URI for playback
  const spotifyUri = `spotify:track:${source_id}`;

  // --- Effect to trigger playback via context ---
  useEffect(() => {
    // Check if a valid URI exists before attempting to play
    if (spotifyUri && spotifyUri !== 'spotify:track:undefined') {
      playTrack(spotifyUri); // Call the context function to update global state
    }
    // Dependency array: run when the spotifyUri changes
    // Do not add playTrack here if its definition is stable (from useContext)
  }, [spotifyUri]);
  // --- End Effect ---

  // Remove direct localStorage access:
  // useEffect(() => {
  //   if (typeof window !== "undefined") {
  //     localStorage.setItem("currentTrackUri", spotifyUri);
  //   }
  // }, [spotifyUri]); <-- REMOVE THIS BLOCK

  // Return the JSX for the page content
  // Note: No <Layout> wrapper here, _app.tsx handles it
  return (
    <>
      <div className="py-2 pb-8 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* Left/Main Column */}
        <div className="col-span-1 xl:col-span-3">
          <GiantTitle title={isrc}>{name}</GiantTitle>
          <Subtitle>{artist}</Subtitle>
          <Meta>{formatReleaseDate(release_date)}</Meta>
          <Genres genres={genres} />

          {/* Mobile-only section for image/links/relations */}
          <div className="md:hidden border-b-4 border-gray-300 mb-4 pb-4">
            <div className="mb-4 border-4 border-black">
              <Image
                src={image || '/placeholder-image.png'} // Provide a fallback image
                alt={name || 'Track artwork'}
                width={300}
                height={300}
                className="object-cover w-full"
                unoptimized
                priority // Consider adding priority if it's LCP
              />
            </div>
            <ExternalLinks sourceId={source_id} />
            <Relations
              instruments={instruments}
              production_credits={production_credits}
              song_credits={song_credits}
            />
          </div>

          {/* SavedBy Section */}
          {posts && posts.length > 0 && (
            <div className="my-4 py-4 flex items-center">
              <img
                src={posts[0].author.image || '/default-avatar.png'} // Fallback avatar
                alt={posts[0].author.name || 'User'}
                className="w-8 h-8 rounded-full mr-2 border border-gray-300" // Added border
              />
              <SavedBy author={author} othersCount={othersCount} />
            </div>
          )}

          {/* Save Button */}
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

        {/* Right Column (Desktop) */}
        <div className="col-span-1 xl:col-span-1 hidden md:block">
          <div className="mb-4 border-4 border-black sticky top-24"> {/* Added sticky positioning */}
            <Image
              src={image || '/placeholder-image.png'} // Provide a fallback image
              alt={name || 'Track artwork'}
              width={300}
              height={300}
              className="object-cover w-full"
              unoptimized
            />
          </div>
          {/* These might also benefit from sticky positioning depending on content length */}
          <div className="sticky top-[348px]"> {/* Adjust top value based on image height + spacing */}
             <ExternalLinks sourceId={source_id} />
             <Relations
                instruments={instruments}
                production_credits={production_credits}
                song_credits={song_credits}
             />
          </div>
        </div>
      </div>

      {/* Save Modal */}
      {isModalOpen && (
        <SaveModal
          content={content}
          setContent={setContent}
          submitPost={submitPost}
          setIsModalOpen={setIsModalOpen}
        />
      )}

      {/* Remove Spotify Player from here */}
      {/* <div className="mt-4"> ... </div> */}
    </>
  );
};

export default Track;