import React from "react";
import Link from "next/link";

type Props = {
  size?: "sm" | "md" | "lg";
  linked?: boolean;
  className?: string;
};

/**
 * BeatBrain logo — one word, two colors, with a brainwave pulse mark.
 *
 * The "pulse" is a tiny inline SVG that looks like a heartbeat/brainwave
 * sitting between "beat" and "brain", replacing the gap with energy.
 */
const Logo: React.FC<Props> = ({ size = "md", linked = true, className = "" }) => {
  const sizes = {
    sm: { text: "text-sm", pulse: 12, pulseH: 10 },
    md: { text: "text-lg", pulse: 16, pulseH: 14 },
    lg: { text: "text-3xl", pulse: 24, pulseH: 20 },
  };

  const s = sizes[size];

  const logoContent = (
    <span className={`font-display ${s.text} inline-flex items-baseline tracking-tight ${className}`}>
      <span className="text-accent">beat</span>
      <svg
        width={s.pulse}
        height={s.pulseH}
        viewBox="0 0 24 20"
        fill="none"
        className="mx-[1px] self-center flex-shrink-0"
        aria-hidden="true"
      >
        <path
          d="M0 10h4l3-8 4 16 3-12 3 8h7"
          stroke="var(--warm)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span className="text-white">brain</span>
    </span>
  );

  if (!linked) return logoContent;

  return (
    <Link href="/" className="group">
      {logoContent}
    </Link>
  );
};

export default Logo;
