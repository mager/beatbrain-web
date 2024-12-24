import type { ReactNode } from "react";
import React from "react";
import { Analytics } from "@vercel/analytics/react";
import { Chakra_Petch, Ms_Madi } from "next/font/google";

import Crown from "@components/Crown";
import Header from "@components/Header";
import Search from "@components/Search";
import Main from "@components/Main";
import Footer from "@components/Footer";

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

// Create Color Context

type Props = {
  children: ReactNode;
};

const Layout: React.FC<Props> = (props) => {
  return (
    <div className={`${bodyFont.variable} ${logoFont.variable} font-sans`}>
      <Crown />
      <Header />
      <Search />
      <Main>{props.children}</Main>
      <Footer className="fixed bottom-0 w-full" />
      <Analytics />
    </div>
  );
};

export default Layout;
