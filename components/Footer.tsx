import React from "react";
import { LightBulbIcon } from "@heroicons/react/24/solid";
import Box from "./Box";

interface FooterProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

const Footer: React.FC<FooterProps> = ({ className, ...rest }) => {
  return (
    <Box
      className={`footer flex text-white px-4 items-center w-full h-full ${className}`}
      {...rest}
    >
      <div className="pr-2 text-bold">beatbrain</div>
      <LightBulbIcon className="h-4 w-4 text-white" />
      <div className="pl-2 text-xs sm:text-sm">a weekend project by @mager</div>
    </Box>
  );
};

export default Footer;