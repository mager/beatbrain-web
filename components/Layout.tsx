import React, { ReactNode } from "react";
import { Chakra_Petch } from "next/font/google";
import Header from "./Header";
import Footer from "./Footer";

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
    <Header />
    <main className="px-8 flex flex-col min-h-screen">{props.children}</main>
    <Footer className="fixed bottom-0 w-full" />
  </div>
);

export default Layout;
