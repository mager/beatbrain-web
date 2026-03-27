import React from 'react';
import Image from 'next/image';

interface PodcastCardProps {
  id: string;
  name: string;
  description?: string | null;
  imageURL?: string | null;
  externalURL: string;
  index: number;
}

const PodcastCard: React.FC<PodcastCardProps> = ({
  name,
  description,
  imageURL,
  externalURL,
  index,
}) => {
  return (
    <a
      href={externalURL}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative flex flex-col overflow-hidden rounded-xl border border-terminal-border bg-terminal-surface transition-all duration-500 ease-out hover:border-accent/40 hover:shadow-[0_8px_40px_rgba(255,51,102,0.08)] hover:-translate-y-1 opacity-0 animate-fadeUp"
      style={{
        animationDelay: `${Math.min(index * 40, 600)}ms`,
        animationFillMode: 'forwards',
      }}
    >
      {/* Cover Art */}
      <div className="relative aspect-square overflow-hidden bg-terminal-bg">
        {imageURL ? (
          <Image
            src={imageURL}
            alt={name}
            fill
            className="object-cover transition-all duration-700 ease-out group-hover:scale-[1.06]"
            unoptimized
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-terminal-border/30 to-terminal-border/10">
            <span className="font-mono text-3xl text-phosphor-dim/40">🎧</span>
          </div>
        )}

        {/* Gradient overlay — always subtle, stronger on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        {/* Play CTA — slides up on hover */}
        <div className="absolute inset-x-0 bottom-0 flex items-center justify-center p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out z-10">
          <div className="flex items-center gap-2 rounded-full bg-white/95 backdrop-blur-sm px-4 py-2 text-phosphor font-display text-xs font-semibold shadow-lg">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="text-accent"
            >
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
            Listen
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="10"
              height="10"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-phosphor-dim"
            >
              <path d="M7 17L17 7M17 7H7M17 7V17" />
            </svg>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-2.5 sm:p-3.5">
        <h3 className="font-display text-xs sm:text-sm text-phosphor font-semibold line-clamp-2 transition-colors duration-300 group-hover:text-accent leading-snug">
          {name}
        </h3>
        {description && (
          <p className="hidden sm:block font-mono text-[10px] text-phosphor-dim/70 line-clamp-2 mt-1.5 leading-relaxed">
            {description}
          </p>
        )}
      </div>

      {/* Bottom accent line — grows on hover */}
      <div className="h-[2px] bg-accent scale-x-0 group-hover:scale-x-100 transition-transform duration-500 ease-out origin-left" />
    </a>
  );
};

export default PodcastCard;
