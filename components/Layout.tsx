import type { ReactNode } from "react";
import React, { useState, useEffect, createContext, useContext } from "react";
import { Chakra_Petch } from "next/font/google";

import Crown from "@components/Crown";
import Header from "@components/Header";
import Search from "@components/Search";
import Main from "@components/Main";
import Footer from "@components/Footer";
import { hexColorMap, getRandomColor } from "@util";

export const bodyFont = Chakra_Petch({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-body",
});

// Create Color Context
const ColorContext = createContext<string>("");

// Custom hook for accessing color
export const useColor = () => {
  return useContext(ColorContext);
};

// Custom hook for accessing hex color
export const useHexColor = () => {
  const tailwindClass = useContext(ColorContext);
  return hexColorMap[tailwindClass];
};

type Props = {
  children: ReactNode;
};

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

  return (
    <ColorContext.Provider value={color}>
      {" "}
      {/* Provide color value */}
      <div className={`${bodyFont.variable} font-sans`}>
        <Crown />
        <Header />
        <Search />
        <Main>{props.children}</Main>
        <Footer className="fixed bottom-0 w-full" />
      </div>
    </ColorContext.Provider>
  );
};

export default Layout;
