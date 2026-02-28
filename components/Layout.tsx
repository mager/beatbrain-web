import type { ReactNode } from "react";
import React, { useEffect } from "react";
import { useRouter } from "next/router";
import { Analytics } from "@vercel/analytics/react";
import { JetBrains_Mono, Space_Grotesk } from "next/font/google";
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

// Display: Space Grotesk — geometric, bold, made for headlines
const displayFont = Space_Grotesk({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-display",
});

// Define constants for layout calculation
const FOOTER_HEIGHT_PX = 36;

type Props = {
  children: ReactNode;
};

const Layout: React.FC<Props> = ({ children }) => {
  const router = useRouter();
  const hideSearch = ["/create", "/settings"].includes(router.pathname);
  const { state: appState, setTracks, setTracksLoading } = useAppContext();
  const { tracks, tracksLoading } = appState;

  useEffect(() => {
    if (tracksLoading || (tracks && tracks.length > 0)) return;
    setTracksLoading(true);
    const fetchTracks = async () => {
      try {
        const res = await fetch(`/api/discover`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({}),
        });
        if (!res.ok) return;
        const resp = await res.json();
        setTracks(resp.tracks, resp.updated || null);
      } catch (err) {
        // handle error
      } finally {
        setTracksLoading(false);
      }
    };
    fetchTracks();
  }, [setTracks, setTracksLoading, tracks, tracksLoading]);

  const calculatePaddingBottom = () => {
    return `${FOOTER_HEIGHT_PX}px`;
  };

  return (
    <div
      className={`${bodyFont.variable} ${displayFont.variable} font-mono relative`}
      style={{ paddingBottom: calculatePaddingBottom() }}
    >
      <Header />
      {!hideSearch && <Search />}
      <Marquee tracks={tracks} speed={50} className="mb-6" />
      <Main>{children}</Main>
      <Analytics />

      {/* Fixed Container for Footer */}
      <div className="fixed bottom-0 left-0 w-full z-50 pointer-events-none">
        <div
          className="transition-all duration-300 ease-in-out"
          style={{ height: `${FOOTER_HEIGHT_PX}px` }}
        >
          <Footer className="border-t border-terminal-border" />
        </div>
      </div>
    </div>
  );
};

export default Layout;
