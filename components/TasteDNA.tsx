import React from "react";

type ArtistStat = {
  name: string;
  count: number;
  pct: number; // 0-100, relative to the top artist
};

type Props = {
  artists: ArtistStat[];
};

const TasteDNA: React.FC<Props> = ({ artists }) => {
  if (artists.length === 0) return null;

  return (
    <div>
      <div className="data-label mb-4">taste dna</div>
      <div className="terminal-window">
        <div className="terminal-titlebar">top artists</div>
        <div className="p-5 space-y-3">
          {artists.map((a, i) => (
            <div key={a.name} className="flex items-center gap-4">
              <span className="font-mono text-[10px] text-phosphor-dim tabular-nums w-5 text-right">
                {String(i + 1).padStart(2, '0')}
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono text-xs text-phosphor truncate">{a.name}</span>
                  <span className="font-mono text-[10px] text-accent ml-2 flex-shrink-0">{a.count} saves</span>
                </div>
                <div className="h-1 bg-terminal-bg rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-accent to-warm rounded-full transition-all duration-500"
                    style={{ width: `${a.pct}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TasteDNA;
