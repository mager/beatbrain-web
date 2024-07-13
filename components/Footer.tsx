import React from "react";
import { LightBulbIcon } from "@heroicons/react/24/solid";
interface FooterProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

const Footer: React.FC<FooterProps> = ({ className, ...rest }) => {
  return (
    <div
      className={`footer flex bg-black text-white py-4 px-8 items-center ${className}`}
      {...rest}
    >
      <div className="pr-2">beatbrain</div>
      <LightBulbIcon className="h-6 w-6 text-white" />
      <div className="pl-2">a side project by @mager</div>
    </div>
  );
};

export default Footer;
