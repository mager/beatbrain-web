import type { ReactNode } from "react";
import React from "react"; // Removed useState, useEffect as they are now in context or not needed here
import { useRouter } from "next/router";
import { Analytics } from "@vercel/analytics/react";
import { Chakra_Petch, Ms_Madi } from "next/font/google";
import { useSession } from "next-auth/react";
import SpotifyPlayer, { SpotifyPlayerCallbackState } from 'react-spotify-web-playback';
import { useAppContext } from "../context/AppContext"; // --- Import useAppContext ---

import Header from "@components/Header";
import Search from "@components/Search";
import Main from "@components/Main";
import Footer from "@components/Footer";

// Define or import your fonts
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

// Define constants for layout calculation
const PLAYER_HEIGHT_PX = 80; // Adjust if your player style changes height
const FOOTER_HEIGHT_PX = 48; // Adjust based on your Footer component's height

type Props = {
  children: ReactNode; // The page component rendered by _app.tsx
};

const Layout: React.FC<Props> = ({ children }) => {
  const router = useRouter();
  const hideSearch = ["/create"].includes(router.pathname); // Example logic to hide search
  const { data: session } = useSession(); // Get session data for the token

  // --- Use AppContext for player state ---
  const { state: appState, setPlayerIsPlaying } = useAppContext();
  const { currentTrackUri, isPlaying } = appState;
  // --- End Use AppContext ---

  // Type assertion for the token - consider creating a Session type for next-auth
  // @ts-ignore
  const spotifyToken = session?.accessToken as string | undefined;

  // Function to calculate dynamic padding based on player visibility
  const calculatePaddingBottom = () => {
    let totalHeight = FOOTER_HEIGHT_PX;
    // Use currentTrackUri from context to decide if player is visible
    if (currentTrackUri) {
      totalHeight += PLAYER_HEIGHT_PX;
    }
    return `${totalHeight}px`;
  };

  // Callback function passed to SpotifyPlayer
  // Updates the global isPlaying state in AppContext
  const handlePlayerCallback = (state: SpotifyPlayerCallbackState) => {
    setPlayerIsPlaying(state.isPlaying);
    // You could add more logic here based on other state properties
    // e.g., console.log('Player Error:', state.error);
  };

  return (
    // Main application wrapper div
    <div
      className={`${bodyFont.variable} ${logoFont.variable} font-sans relative`}
      style={{ paddingBottom: calculatePaddingBottom() }} // Apply dynamic padding
    >
      {/* Static layout components */}
      <Header />
      {!hideSearch && <Search />}

      {/* Main content area where the page component is rendered */}
      <Main>{children}</Main>

      <Analytics />

      {/* --- Combined Fixed Container for Player and Footer --- */}
      <div className="fixed bottom-0 left-0 w-full bg-black text-white z-50 shadow-lg flex flex-col">
        {/* Spotify Player Section - Conditionally Rendered */}
        {/* Render only if there's a track URI in the context state */}
        {currentTrackUri && (
          <div className="w-full" style={{ height: `${PLAYER_HEIGHT_PX}px` }}>
            {spotifyToken ? (
              <SpotifyPlayer
                token={spotifyToken}
                uris={[currentTrackUri]} // Use URI from context
                play={isPlaying} // Use isPlaying state from context
                callback={handlePlayerCallback} // Update context state on player changes
                styles={{ // Customize player appearance
                  bgColor: 'transparent', // Makes it blend with the black container
                  color: '#ffffff',
                  loaderColor: '#1db954', // Spotify green for loader
                  sliderColor: '#1db954', // Spotify green for slider progress
                  sliderHandleColor: '#ffffff', // White handle on slider
                  trackArtistColor: '#a0a0a0', // Lighter grey for artist name
                  trackNameColor: '#ffffff', // White for track name
                  height: PLAYER_HEIGHT_PX, // Ensure consistent height
                }}
                // autoPlay // Uncomment if you want tracks to play automatically when URI changes
                // other props like name, volume, etc. can be added here
              />
            ) : (
              // Show a loading/auth message if token isn't ready yet
              <div className="flex items-center justify-center h-full text-gray-400 text-sm">
                Authenticating Player...
              </div>
            )}
          </div>
        )}

        {/* Footer Section - Always Rendered */}
        <div style={{ height: `${FOOTER_HEIGHT_PX}px` }}>
          <Footer className="border-t border-gray-700"/> {/* Added top border for separation */}
        </div>
      </div>
      {/* --- End Combined Fixed Container --- */}
    </div>
  );
};

export default Layout;