import type { ReactNode } from "react";
import React, { useEffect, useRef } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import { Space_Grotesk } from "next/font/google";
import { useAppContext } from "../context/AppContext";
import Header from "./Header";
const font = Space_Grotesk({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-display",
});
export default function Layout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { setTracks, setTracksLoading } = useAppContext();
  const loaded = useRef(false);
  useEffect(() => {
    if (router.pathname !== "/discover" || loaded.current) return;
    loaded.current = true;
    const controller = new AbortController();
    setTracksLoading(true);
    fetch("/api/discover", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "{}",
      signal: controller.signal,
    })
      .then(async (response) => {
        if (response.ok) {
          const data = await response.json();
          setTracks(data.tracks || [], data.updated);
        }
      })
      .catch(() => {})
      .finally(() => setTracksLoading(false));
    return () => {
      controller.abort();
      loaded.current = false;
    };
  }, [router.pathname]);
  const entry = router.pathname === "/auth/signin";
  return (
    <div className={`${font.variable} app-shell`}>
      <Head>
        <title>Beatbrain — Your music, your people</title>
        <meta
          name="description"
          content="An invite-only listening room for you and your music friends."
        />
        <meta name="robots" content="noindex,nofollow" />
        <meta name="theme-color" content="#101113" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      {!entry && <Header />}
      <main id="main-content">{children}</main>
      {!entry && (
        <footer className="site-footer">
          <span>Good music travels between friends.</span>
          <span>beatbrain</span>
        </footer>
      )}
    </div>
  );
}
