import React, { useState, useEffect } from "react";
import type { ReactNode } from "react";
import { Chakra_Petch } from "next/font/google";
import Crown from "@components/Crown";
import Header from "@components/Header";
import Search from "@components/Search";
import Footer from "@components/Footer";

export const bodyFont = Chakra_Petch({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-body",
});

type Props = {
  children: ReactNode;
};
const colors = [
  "bg-red-500",
  "bg-pink-500",
  "bg-purple-500",
  "bg-indigo-500",
  "bg-blue-500",
  "bg-teal-500",
  "bg-cyan-500",
  "bg-green-500",
  "bg-lime-500",
  "bg-yellow-500",
  "bg-amber-500",
  "bg-orange-500",
  "bg-gray-500",
  "bg-blue-gray-500",
];
const getRandomColor = () => colors[Math.floor(Math.random() * colors.length)];

const Layout: React.FC<Props> = (props) => {
  const [color, setColor] = useState("");

  useEffect(() => {
    const handleBeforeUnload = () => {
      localStorage.removeItem("randomColor");
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    const storedColor = localStorage.getItem("randomColor");
    if (storedColor) {
      setColor(storedColor);
    } else {
      const randomColor = getRandomColor();
      localStorage.setItem("randomColor", randomColor);
      setColor(randomColor);
    }

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  // Should we add back min-h-screen to main?
  return (
    <div className={`${bodyFont.variable} font-sans`}>
      <Crown />
      <Header color={color} />
      <Search />
      <main className="px-8 flex flex-col">{props.children}</main>
      <Footer className="fixed bottom-0 w-full" />
    </div>
  );
};

export default Layout;
