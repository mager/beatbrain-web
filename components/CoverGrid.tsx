import React from "react";
import Link from "next/link";
import Image from "next/image";

export type CoverGridItem = {
  id: number | string;
  image?: string;
  title?: string;
  artist?: string;
  sourceId?: string;
  subtitle?: string; // optional third line (e.g. @username)
};

type Props = {
  items: CoverGridItem[];
  cols?: string; // tailwind grid-cols class override
  className?: string;
};

const CoverGrid: React.FC<Props> = ({
  items,
  cols = "grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7",
  className = "",
}) => {
  if (items.length === 0) {
    return (
      <div className="py-20 text-center font-mono">
        <p className="text-phosphor-dim text-sm">nothing here yet</p>
        <p className="text-accent text-xs mt-4 animate-blink">_</p>
      </div>
    );
  }

  return (
    <div className={`grid ${cols} gap-0 ${className}`}>
      {items.map((item, index) => (
        <Link
          key={item.id}
          href={`/ext/spotify/${item.sourceId || ""}`}
          className="group relative aspect-square overflow-hidden bg-terminal-surface opacity-0 animate-fadeUp"
          style={{
            animationDelay: `${Math.min(index * 15, 600)}ms`,
            animationFillMode: "forwards",
          }}
        >
          {item.image ? (
            <Image
              src={item.image}
              alt={`${item.artist} - ${item.title}`}
              fill
              sizes="(max-width: 640px) 33.3vw, (max-width: 768px) 25vw, (max-width: 1024px) 20vw, 14.3vw"
              className="object-cover transition-all duration-500 group-hover:scale-110 group-hover:brightness-[0.2]"
              unoptimized
            />
          ) : (
            <div className="w-full h-full bg-terminal-bg flex items-center justify-center">
              <span className="font-mono text-[10px] text-phosphor-dim">—</span>
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          <div className="absolute inset-0 flex flex-col justify-end p-2.5 sm:p-3 opacity-0 group-hover:opacity-100 transition-all duration-300 z-10">
            <p className="font-mono text-[10px] sm:text-xs text-white leading-tight line-clamp-2 drop-shadow-lg font-medium">
              {item.title}
            </p>
            <p className="font-mono text-[9px] sm:text-[10px] text-white/60 leading-tight line-clamp-1 mt-1 drop-shadow-lg">
              {item.artist}
            </p>
            {item.subtitle && (
              <p className="font-mono text-[8px] sm:text-[9px] text-accent/60 leading-tight line-clamp-1 mt-0.5">
                {item.subtitle}
              </p>
            )}
          </div>
        </Link>
      ))}
    </div>
  );
};

export default CoverGrid;
