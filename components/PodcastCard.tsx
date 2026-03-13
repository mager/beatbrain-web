import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface PodcastCardProps {
  id: number;
  title: string;
  description: string | null;
  coverArtUrl: string | null;
  spotifyUri: string;
  index: number;
}

const PodcastCard: React.FC<PodcastCardProps> = ({
  title,
  description,
  coverArtUrl,
  spotifyUri,
  index,
}) => {
  // Extract Spotify show ID from URI
  const spotifyId = spotifyUri.split(':').pop() || '';
  const spotifyUrl = `https://open.spotify.com/show/${spotifyId}`;

  return (
    <a
      href={spotifyUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative flex flex-col overflow-hidden rounded-lg border border-terminal-border bg-terminal-surface transition-all duration-300 hover:border-accent/50 hover:shadow-lg hover:shadow-accent/5 opacity-0 animate-fadeUp"
      style={{
        animationDelay: `${Math.min(index * 30, 500)}ms`,
        animationFillMode: 'forwards',
      }}
    >
      {/* Cover Art */}
      <div className="relative aspect-square overflow-hidden bg-terminal-bg">
        {coverArtUrl ? (
          <Image
            src={coverArtUrl}
            alt={title}
            fill
            className="object-cover transition-all duration-300 group-hover:scale-105 group-hover:brightness-[0.85]"
            unoptimized
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-terminal-border/20">
            <span className="font-mono text-2xl text-phosphor-dim">🎧</span>
          </div>
        )}

        {/* Play overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <div className="flex items-center gap-2 rounded-full bg-accent px-4 py-2 text-black font-mono text-xs font-semibold">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
            Listen on Spotify
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-3">
        <h3 className="font-display text-sm text-white line-clamp-2 transition-colors duration-300 group-hover:text-accent min-h-[2.5rem]">
          {title}
        </h3>
        {description && (
          <p className="font-mono text-[10px] text-phosphor-dim line-clamp-2 mt-2 leading-relaxed">
            {description}
          </p>
        )}
      </div>

      {/* Bottom border accent */}
      <div className="h-[2px] bg-gradient-to-r from-transparent via-accent/30 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
    </a>
  );
};

export default PodcastCard;
