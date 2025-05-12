import type { ReactNode } from "react";
import React from "react";
import { useRouter } from "next/router";
import { Analytics } from "@vercel/analytics/react";
import { Chakra_Petch, Ms_Madi } from "next/font/google";
import { useSession } from "next-auth/react";
import SpotifyPlayer, { State as SpotifyPlayerCallback } from 'react-spotify-web-playback';
import { useAppContext } from "../context/AppContext";
import { PlayIcon } from "@heroicons/react/24/solid";

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
const PLAYER_HEIGHT_PX = 80;
const FOOTER_HEIGHT_PX = 48;

type Props = {
  children: ReactNode;
};

// Extend the Session type to include accessToken
interface ExtendedSession {
  accessToken?: string;
}

const Layout: React.FC<Props> = ({ children }) => {
  const router = useRouter();
  const hideSearch = ["/create"].includes(router.pathname);
  const { data: session } = useSession();
  const { state: appState, setPlayerIsPlaying } = useAppContext();
  const { currentTrackUri, isPlaying } = appState;
  const spotifyToken = (session as ExtendedSession)?.accessToken;

  // Function to calculate dynamic padding based on player visibility
  const calculatePaddingBottom = () => {
    let totalHeight = FOOTER_HEIGHT_PX;
    if (currentTrackUri) {
      totalHeight += PLAYER_HEIGHT_PX;
    }
    return `${totalHeight}px`;
  };

  // Callback function passed to SpotifyPlayer
  const handlePlayerCallback = (state: SpotifyPlayerCallback) => {
    setPlayerIsPlaying(state.isPlaying);
  };

  return (
    <div
      className={`${bodyFont.variable} ${logoFont.variable} font-sans relative`}
      style={{ paddingBottom: calculatePaddingBottom() }}
    >
      <Header />
      {!hideSearch && <Search />}
      <Main>{children}</Main>
      <Analytics />

      {/* Fixed Container for Player and Footer */}
      <div className="fixed bottom-0 left-0 w-full bg-black text-white z-50 shadow-lg flex flex-col transition-all duration-300 ease-in-out">
        {/* Spotify Player Section */}
        {currentTrackUri && (
          <div 
            className="w-full transform transition-all duration-300 ease-in-out"
            style={{ height: `${PLAYER_HEIGHT_PX}px` }}
          >
            {spotifyToken ? (
              <SpotifyPlayer
                token={spotifyToken}
                key={currentTrackUri}
                uris={[currentTrackUri]}
                play={isPlaying}
                callback={handlePlayerCallback}
                styles={{
                  bgColor: 'transparent',
                  color: '#ffffff',
                  loaderColor: '#1db954',
                  sliderColor: '#1db954',
                  sliderHandleColor: '#ffffff',
                  trackArtistColor: '#a0a0a0',
                  trackNameColor: '#ffffff',
                  height: PLAYER_HEIGHT_PX,
                  sliderHeight: 4,
                  sliderTrackBorderRadius: 2,
                  sliderHandleBorderRadius: 2,
                  activeColor: '#1db954',
                  errorColor: '#ff4444',
                  loaderSize: 24,
                }}
                layout="responsive"
                magnifySliderOnHover={true}
                showSaveIcon={true}
                inlineVolume={true}
                persistDeviceSelection={true}
              />
            ) : (
              <div className="flex items-center justify-center h-full bg-black/90 backdrop-blur-sm">
                <div className="flex items-center space-x-3 text-gray-400">
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-green-500 border-t-transparent"></div>
                  <span className="text-sm font-medium">Connecting to Spotify...</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Footer Section */}
        <div 
          className="transition-all duration-300 ease-in-out"
          style={{ height: `${FOOTER_HEIGHT_PX}px` }}
        >
          <Footer className="border-t border-gray-700"/>
        </div>
      </div>
    </div>
  );
};

export default Layout;