import type { ReactNode } from "react";
import React, { useState, useEffect, useRef } from "react"; // Import useState, useEffect, useRef
import { useRouter } from "next/router";
import { Analytics } from "@vercel/analytics/react";
import { Chakra_Petch, Ms_Madi } from "next/font/google";
import { useSession } from "next-auth/react";
import SpotifyPlayer, { SpotifyPlayerCallbackState } from 'react-spotify-web-playback'; // Import type

import Header from "@components/Header";
import Search from "@components/Search";
import Main from "@components/Main";
import Footer from "@components/Footer"; // Ensure Footer is imported

export const bodyFont = Chakra_Petch({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-body",
});

export const logoFont = Ms_Madi({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-logo",
});

const PLAYER_HEIGHT_PX = 80; // Define player height for consistency
const FOOTER_HEIGHT_PX = 48; // Estimate or measure your footer height (adjust if needed)

type Props = {
  children: ReactNode;
};

const Layout: React.FC<Props> = (props) => {
  const router = useRouter();
  const hideSearch = ["/create"].includes(router.pathname);
  const { data: session } = useSession();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentUri, setCurrentUri] = useState<string>("");

  // Refs to measure elements if needed (optional for fixed height approach)
  // const playerContainerRef = useRef<HTMLDivElement>(null);
  // const footerContainerRef = useRef<HTMLDivElement>(null);

  // @ts-ignore - Consider defining a Session type with accessToken
  const spotifyToken = session?.accessToken as string | undefined;

  useEffect(() => {
    // Get URI from localStorage on initial client load
    if (typeof window !== "undefined") {
      const storedUri = localStorage.getItem("currentTrackUri") || "";
      setCurrentUri(storedUri);
    }

    // Listen for changes to the URI in localStorage (basic approach)
    const handleStorageChange = () => {
      if (typeof window !== "undefined") {
        const updatedUri = localStorage.getItem("currentTrackUri") || "";
        // Only update if it actually changed to avoid unnecessary re-renders
        if (updatedUri !== currentUri) {
            setCurrentUri(updatedUri);
            // Reset isPlaying to false when track changes, let player autoPlay handle it if desired
            setIsPlaying(false);
        }
      }
    };
    window.addEventListener('storage', handleStorageChange);

    // Cleanup listener
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [currentUri]); // Re-run if currentUri changes internally

  // Calculate the dynamic padding needed at the bottom of the main content
  const calculatePaddingBottom = () => {
    let totalHeight = FOOTER_HEIGHT_PX; // Footer is always there
    if (currentUri) {
      totalHeight += PLAYER_HEIGHT_PX; // Add player height if URI exists
    }
    return `${totalHeight}px`;
  };

  // Sync local isPlaying state with the player's actual state
  const handlePlayerCallback = (state: SpotifyPlayerCallbackState) => {
    setIsPlaying(state.isPlaying);
    // You can add more logic here based on state changes (e.g., errors, track end)
    // console.log(state);
  };

  return (
    // Main wrapper - Apply dynamic padding bottom
    <div
      className={`${bodyFont.variable} ${logoFont.variable} font-sans relative`}
      style={{ paddingBottom: calculatePaddingBottom() }} // Dynamic padding
    >
      <Header />
      {!hideSearch && <Search />}
      <Main>{props.children}</Main>
      {/* Footer is now moved into the fixed container below */}
      <Analytics />

      {/* --- Combined Fixed Container for Player and Footer --- */}
      <div className="fixed bottom-0 left-0 w-full bg-black text-white z-50 shadow-lg flex flex-col">
        {/* Spotify Player Section - Render only if URI exists */}
        {currentUri && (
          <div className="w-full" style={{ height: `${PLAYER_HEIGHT_PX}px` }}> {/* Container with fixed height */}
            {spotifyToken ? (
              <SpotifyPlayer
                token={spotifyToken}
                uris={[currentUri]}
                // autoPlay // Optionally autoPlay new tracks
                play={isPlaying} // Controlled by local state, synced via callback
                callback={handlePlayerCallback} // Sync state
                styles={{
                  bgColor: 'transparent', // Transparent background to blend
                  color: '#fff',
                  loaderColor: '#1db954', // Spotify green
                  sliderColor: '#1db954',
                  sliderHandleColor: '#fff',
                  trackArtistColor: '#aaa', // Lighter grey for artist
                  trackNameColor: '#fff',
                  height: PLAYER_HEIGHT_PX, // Ensure player takes the allocated height
                }}
              />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400"> {/* Centered loading */}
                Loading Spotify Player...
              </div>
            )}
          </div>
        )}

        {/* Footer Section - Always Rendered */}
        <div style={{ height: `${FOOTER_HEIGHT_PX}px` }}> {/* Container to help control footer height */}
          <Footer className="border-t border-gray-700"/> {/* Pass specific styles if needed, add border */}
        </div>
      </div>
      {/* --- End Combined Fixed Container --- */}
    </div>
  );
};

export default Layout;