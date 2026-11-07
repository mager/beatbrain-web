import type { ReactNode } from "react";

import { useRouter } from "next/router";
import Head from "next/head";
import { Archivo, Space_Grotesk } from "next/font/google";
import FooterCredit from "./FooterCredit";
import Header from "./Header";
const font = Space_Grotesk({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-display",
});
const heading = Archivo({
  weight: "900",
  style: "italic",
  subsets: ["latin"],
  variable: "--font-heading",
  display: "swap",
});
export default function Layout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const entry = router.pathname === "/auth/signin";
  return (
    <div className={`${font.variable} ${heading.variable} app-shell`}>
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
          <FooterCredit />
        </footer>
      )}
    </div>
  );
}
