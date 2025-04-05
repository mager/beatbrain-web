import React from "react";
import { LightBulbIcon } from "@heroicons/react/24/solid";
import Box from "./Box"; // Assuming Box is just a div or similar

interface FooterProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

const Footer: React.FC<FooterProps> = ({ className, ...rest }) => {
  return (
    // Ensure Box doesn't add conflicting styles (like position)
    // Removed bg-black here, it's now on the parent container in Layout
    // Added h-full to try and fill the allocated space, adjust px-6 py-3/4 as needed for vertical centering
    <Box
      className={`footer flex text-white px-6 items-center w-full h-full ${className}`}
      {...rest}
    >
      <div className="pr-2 text-bold">beatbrain</div>
      <LightBulbIcon className="h-4 w-4 text-white" />
      <div className="pl-2 text-xs sm:text-sm">a weekend project by @mager</div> {/* Slightly smaller text */}
    </Box>
  );
};

export default Footer;