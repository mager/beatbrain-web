import type { ReactNode } from "react";
import React, { useEffect } from "react";
import { useRouter } from "next/router";
import { Analytics } from "@vercel/analytics/react";
import { JetBrains_Mono, IBM_Plex_Mono } from "next/font/google";
import { useSession } from "next-auth/react";
import SpotifyPlayer, { State as SpotifyPlayerCallback } from 'react-spotify-web-playback';
import { useAppContext } from "../context/AppContext";
import type { Track } from "@types";

import Header from "@components/Header";
import Search from "@components/Search";
import Main from "@components/Main";
import Footer from "@components/Footer";
import Marquee from "@components/Marquee";

// Body: JetBrains Mono — clean developer monospace
const bodyFont = JetBrains_Mono({
  weight: ["300", "400", "500", "600", "700", "800"],
  subsets: ["latin"],
  variable: "--font-body",
});

// Display: IBM Plex Mono — slightly different character for headings
const displayFont = IBM_Plex_Mono({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-display",
});

// Define constants for layout calculation
const PLAYER_HEIGHT_PX = 80;
const FOOTER_HEIGHT_PX = 36;

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

  const calculatePaddingBottom = () => {
    let totalHeight = FOOTER_HEIGHT_PX;
    return `${totalHeight}px`;
  };

  const handlePlayerCallback = (state: SpotifyPlayerCallback) => {
    setPlayerIsPlaying(state.isPlaying);
  };

  return (
    <div
      className={`${bodyFont.variable} ${displayFont.variable} font-mono relative`}
      style={{ paddingBottom: calculatePaddingBottom() }}
    >
      <Header />
      {!hideSearch && <Search />}
      <Marquee tracks={tracks} speed={250} className="mb-6" />
      <Main>{children}</Main>
      <Analytics />

      {/* Fixed Container for Player and Footer */}
      <div className="fixed bottom-0 left-0 w-full z-50 pointer-events-none">
        <div 
          className="transition-all duration-300 ease-in-out"
          style={{ height: `${FOOTER_HEIGHT_PX}px` }}
        >
          <Footer className="border-t border-terminal-border"/>
        </div>
      </div>
    </div>
  );
};

export default Layout;
