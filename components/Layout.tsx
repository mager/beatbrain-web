import type { ReactNode } from "react";
import React from "react";
import { useRouter } from "next/router";
import { Analytics } from "@vercel/analytics/react";
import { Chakra_Petch, Ms_Madi } from "next/font/google";
import { useSession } from "next-auth/react";
import SpotifyPlayer, { State as SpotifyPlayerCallback } from 'react-spotify-web-playback';
import { useAppContext } from "../context/AppContext";

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

      <div className="fixed bottom-0 left-0 w-full z-50 pointer-events-none">
        {currentTrackUri && session && (
          <div 
            className="absolute bottom-5 left-3 pointer-events-auto w-[90vw] max-w-[320px] min-w-[180px] h-[80px] sm:w-[300px] sm:h-[90px]"
            style={{}}
          >
            <div className="bg-black/95 border-4 border-green-400 rounded-2xl shadow-2xl overflow-hidden flex items-center justify-center p-3 w-full h-full">
              {!spotifyToken ? (
                <div className="flex items-center justify-center h-full w-full">
                  <div className="flex items-center space-x-3 text-gray-400">
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-green-500 border-t-transparent"></div>
                    <span className="text-sm font-medium">Connecting to Spotify...</span>
                  </div>
                </div>
              ) : (
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
                    height: 120,
                    sliderHeight: 4,
                    sliderTrackBorderRadius: 2,
                    sliderHandleBorderRadius: 2,
                    activeColor: '#1db954',
                    errorColor: '#ff4444',
                    loaderSize: 20,
                  }}
                  layout="responsive"
                  magnifySliderOnHover={true}
                  showSaveIcon={false}
                  inlineVolume={false}
                  persistDeviceSelection={false}
                />
              )}
            </div>
          </div>
        )}
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