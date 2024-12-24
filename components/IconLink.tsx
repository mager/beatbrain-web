import React from "react";
import Link from "next/link";

interface IconLinkProps {
  href: string;
  icon: React.ReactNode;
  active: boolean;
  onClick?: React.MouseEventHandler<HTMLAnchorElement>;
}

const IconLink: React.FC<IconLinkProps> = ({ href, icon, active, onClick }) => (
  <Link href={href} legacyBehavior>
    <a
      className="text-black hover:text-green-500 transition-all duration-200"
      data-active={active}
      onClick={onClick}
    >
      {icon}
    </a>
  </Link>
);

export default IconLink;
