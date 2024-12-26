import React from "react";
import Link from "next/link";

interface IconLinkProps {
  href: string;
  icon: React.ReactNode;
  active: boolean;
  onClick?: React.MouseEventHandler<HTMLAnchorElement>;
  className?: string;
}

const IconLink: React.FC<IconLinkProps> = ({
  href,
  icon,
  active,
  onClick,
  className,
}) => (
  <Link href={href} legacyBehavior>
    <a
      className={`text-black hover:text-green-500 transition-all duration-200 ${className}`}
      data-active={active}
      onClick={onClick}
    >
      {icon}
    </a>
  </Link>
);

export default IconLink;
