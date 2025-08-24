import type { ReactNode } from "react";
import React, { useEffect } from "react";
import { useRouter } from "next/router";
import { Analytics } from "@vercel/analytics/react";
import { Chakra_Petch, Ms_Madi } from "next/font/google";
import { useSession } from "next-auth/react";
import SpotifyPlayer, { State as SpotifyPlayerCallback } from 'react-spotify-web-playback';
import { useAppContext } from "../context/AppContext";
import type { Track } from "@types";

import Header from "@components/Header";
import Search from "@components/Search";
import Main from "@components/Main";
import Footer from "@components/Footer";
import Marquee from "@components/Marquee";

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
const FOOTER_HEIGHT_PX = 60;

type Props = {
  children: ReactNode;
};

// Extend the Session type to include accessToken
interface ExtendedSession {
  accessToken?: string;
}

const Layout: React.FC<Props> = ({ children }) => {
  const router = useRouter();
  const hideSearch = ["/create", "/settings"].includes(router.pathname);
  const { data: session } = useSession();
  const { state: appState, setPlayerIsPlaying, setTracks, setTracksLoading } = useAppContext();
  const { currentTrackUri, isPlaying, tracks, tracksLoading } = appState;
  const spotifyToken = (session as ExtendedSession)?.accessToken;

  useEffect(() => {
    if (tracksLoading || (tracks && tracks.length > 0)) return;
    setTracksLoading(true);
    const fetchTracks = async () => {
      try {
        console.log("Fetching discover tracks...");
        const res = await fetch(`/api/discover`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ mode: "new" }),
        });
        if (!res.ok) return;
        const resp = await res.json();
        setTracks(resp.tracks);
      } catch (err) {
        // handle error
      } finally {
        setTracksLoading(false);
      }
    };
    fetchTracks();
  }, [setTracks, setTracksLoading, tracks, tracksLoading]);

  // Star field generation effect
  useEffect(() => {
    const generateStars = (containerId: string, count: number, size: number) => {
      const container = document.getElementById(containerId);
      if (!container) return;

      // Clear existing stars
      container.innerHTML = '';

      for (let i = 0; i < count; i++) {
        const star = document.createElement('div');
        star.style.position = 'absolute';
        star.style.width = `${size}px`;
        star.style.height = `${size}px`;
        star.style.backgroundColor = 'white';
        star.style.borderRadius = '50%';
        star.style.left = `${Math.random() * 100}%`;
        star.style.top = `${Math.random() * 100}%`;
        star.style.opacity = '0.8';
        star.style.boxShadow = `0 0 ${size * 2}px ${size}px rgba(255, 255, 255, 0.3)`;
        
        // Add twinkling animation delay
        star.style.setProperty('--i', i.toString());
        
        container.appendChild(star);
      }
    };

    // Generate stars for each layer
    generateStars('stars1', 700, 1);  // Small, distant stars
    generateStars('stars2', 200, 2);  // Medium stars
    generateStars('stars3', 100, 3);  // Large, close stars

    // Add scroll event listener for parallax effect
    const handleScroll = () => {
      const scrolled = window.pageYOffset;
      const stars1 = document.getElementById('stars1');
      const stars2 = document.getElementById('stars2');
      const stars3 = document.getElementById('stars3');

      if (stars1) stars1.style.transform = `translateZ(-300px) translateY(${scrolled * 0.1}px)`;
      if (stars2) stars2.style.transform = `translateZ(-150px) translateY(${scrolled * 0.2}px)`;
      if (stars3) stars3.style.transform = `translateZ(-50px) translateY(${scrolled * 0.3}px)`;
    };

    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Function to calculate dynamic padding based on player visibility
  const calculatePaddingBottom = () => {
    let totalHeight = FOOTER_HEIGHT_PX;
    // if (currentTrackUri) {
    //   totalHeight += PLAYER_HEIGHT_PX;
    // }
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
      {/* Star Field Background */}
      <div id="star-container">
        <div id="stars1"></div>
        <div id="stars2"></div>
        <div id="stars3"></div>
      </div>
      
      <Header />
      {!hideSearch && <Search />}
      <Marquee tracks={tracks} speed={200} className="mb-6" />
      <Main>{children}</Main>
      <Analytics />

      {/* Fixed Container for Player and Footer */}
      <div className="fixed bottom-0 left-0 w-full z-50 pointer-events-none">
        {/* Spotify Player Section - Temporarily Hidden */}
        {/* {currentTrackUri && session && (
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
                    trackArtistColor: '#a0a0a0',
                    trackNameColor: '#ffffff',
                    height: 48,
                    sliderHeight: 2,
                    sliderTrackBorderRadius: 1,
                    sliderHandleBorderRadius: 1,
                    activeColor: '#1db954',
                    errorColor: '#ff4444',
                    loaderSize: 16,
                  }}
                  layout="compact"
                  magnifySliderOnHover={false}
                  showSaveIcon={false}
                  inlineVolume={false}
                  persistDeviceSelection={false}
                  hideAttribution={true}
                  hideCoverArt={true}
                />
              )}
            </div>
          </div>
        )} */}
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