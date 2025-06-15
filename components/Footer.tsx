import React, { useState, useEffect } from "react";
import { LightBulbIcon } from "@heroicons/react/24/solid";
import Box from "./Box";

interface FooterProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

const Footer: React.FC<FooterProps> = ({ className, ...rest }) => {
  const [isAtBottom, setIsAtBottom] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      setIsAtBottom(documentHeight - scrollPosition < 100); // 100px threshold
    };

    window.addEventListener('scroll', handleScroll);
    // Check initial position
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <Box
      className={`footer flex text-white px-3 items-center w-full h-full bg-black ${isAtBottom ? 'bg-opacity-100' : 'bg-opacity-50'} backdrop-blur-md border-t-2 border-white transition-all duration-200 ${className}`}
      {...rest}
    >
      <div className="pr-2 text-bold">beatbrain</div>
      <LightBulbIcon className="h-4 w-4 text-white" />
      <div className="pl-2 text-xs sm:text-sm">a weekend project by @mager</div>
    </Box>
  );
};

export default Footer;