import React from "react";
import { LightBulbIcon } from "@heroicons/react/24/solid";
import Box from "./Box";
interface FooterProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

const Footer: React.FC<FooterProps> = ({ className, ...rest }) => {
  return (
    <Box
      className={`footer flex bg-black text-white px-4 items-center fixed bottom-0 w-full ${className}`}
      {...rest}
    >
      <div className="pr-2">beatbrain</div>
      <LightBulbIcon className="h-6 w-6 text-white" />
      <div className="pl-2">a side project by @mager</div>
    </Box>
  );
};

export default Footer;
