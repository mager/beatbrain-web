import React, { ReactNode } from "react";
import { Fragment_Mono, Chakra_Petch } from "next/font/google";
import Header from "./Header";

export const bodyFont = Chakra_Petch({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-body",
});

export const monoFont = Fragment_Mono({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-mono",
});

type Props = {
  children: ReactNode;
};

const Layout: React.FC<Props> = (props) => (
  <div className={`${bodyFont.variable} font-sans`}>
    <Header />
    <main className="px-8">{props.children}</main>
  </div>
);

export default Layout;
