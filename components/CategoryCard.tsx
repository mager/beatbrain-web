import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface CategoryCardProps {
  name: string;
  count: number;
  previewImage: string | null;
  index: number;
}

// Category-specific accent colors (cycling through a curated palette)
const ACCENT_COLORS = [
  'from-emerald-500/20 to-teal-500/5',
  'from-violet-500/20 to-purple-500/5',
  'from-amber-500/20 to-orange-500/5',
  'from-cyan-500/20 to-blue-500/5',
  'from-rose-500/20 to-pink-500/5',
  'from-lime-500/20 to-green-500/5',
  'from-fuchsia-500/20 to-purple-500/5',
  'from-sky-500/20 to-indigo-500/5',
];

const CategoryCard: React.FC<CategoryCardProps> = ({
  name,
  count,
  previewImage,
  index,
}) => {
  const accentClass = ACCENT_COLORS[index % ACCENT_COLORS.length];
  const slug = name.toLowerCase().replace(/\s+/g, '-');

  return (
    <Link
      href={`/categories/${slug}?category=${encodeURIComponent(name)}`}
      className="group relative block overflow-hidden rounded-lg border border-terminal-border bg-terminal-surface transition-all duration-300 hover:border-accent/50 hover:shadow-lg hover:shadow-accent/5"
    >
      {/* Gradient background */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${accentClass} opacity-0 transition-opacity duration-300 group-hover:opacity-100`}
      />

      <div className="relative flex items-center gap-4 p-4">
        {/* Preview Image */}
        <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-md bg-terminal-bg">
          {previewImage ? (
            <Image
              src={previewImage}
              alt={name}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-110"
              unoptimized
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-terminal-border/20">
              <span className="font-mono text-xs text-phosphor-dim">🎧</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3 className="font-display text-sm text-white truncate transition-colors duration-300 group-hover:text-accent">
            {name}
          </h3>
          <p className="font-mono text-[11px] text-phosphor-dim mt-1">
            <span className="text-accent font-semibold">{count}</span>
            <span className="ml-1">podcasts</span>
          </p>
        </div>

        {/* Arrow */}
        <div className="text-phosphor-dim transition-all duration-300 group-hover:translate-x-1 group-hover:text-accent">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M5 12h14" />
            <path d="m12 5 7 7-7 7" />
          </svg>
        </div>
      </div>

      {/* Bottom accent line */}
      <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-accent/50 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
    </Link>
  );
};

export default CategoryCard;
