import React, { ReactNode } from "react";
import { Chakra_Petch } from "next/font/google";
import Crown from "@components/Crown";
import Header from "@components/Header";
import Footer from "@components/Footer";

export const bodyFont = Chakra_Petch({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-body",
});

type Props = {
  children: ReactNode;
};

const Layout: React.FC<Props> = (props) => (
  <div className={`${bodyFont.variable} font-sans`}>
    <Crown />
    <Header />
    <main className="px-8 flex flex-col min-h-screen">{props.children}</main>
    <Footer className="fixed bottom-0 w-full" />
  </div>
);

export default Layout;
