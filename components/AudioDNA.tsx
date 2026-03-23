import React from "react";
import type { Features, TrackMeta } from "@types";

type Props = {
  meta?: TrackMeta | null;
  features: Features;
};

const featureConfig = [
  { key: "energy",           label: "Energy",       color: "var(--warm)",    icon: "⚡" },
  { key: "danceability",     label: "Danceability", color: "var(--violet)",  icon: "💃" },
  { key: "happiness",        label: "Happiness",    color: "var(--accent)",  icon: "☀️" },
  { key: "acousticness",     label: "Acoustic",     color: "var(--mint)",    icon: "🎸" },
  { key: "instrumentalness", label: "Instrumental", color: "var(--cool)",    icon: "🎹" },
  { key: "liveness",         label: "Liveness",     color: "var(--rose)",    icon: "🎤" },
  { key: "speechiness",      label: "Speechiness",  color: "var(--phosphor-dim)", icon: "🗣️" },
] as const;

const keyNames = ["C", "C♯", "D", "D♯", "E", "F", "F♯", "G", "G♯", "A", "A♯", "B"];

const formatDuration = (ms: number): string => {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
};

const AudioDNA: React.FC<Props> = ({ meta, features }) => {
  const musicalKey = meta && meta.key >= 0 ? keyNames[meta.key] : null;
  const mode = meta ? (meta.mode === 1 ? "Major" : "Minor") : null;
  const bpm = meta ? Math.round(meta.tempo) : null;
  const timeSig = meta?.time_signature;
  const duration = meta?.duration_ms;

  return (
    <div className="space-y-6">
      {/* Key stats row */}
      {meta && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {musicalKey && <StatBlock label="Key" value={`${musicalKey} ${mode}`} />}
          {bpm && <StatBlock label="BPM" value={`${bpm}`} />}
          {timeSig && <StatBlock label="Time Sig" value={`${timeSig}/4`} />}
          {duration && <StatBlock label="Duration" value={formatDuration(duration)} />}
        </div>
      )}

      {/* Loudness */}
      {features.loudness !== undefined && (
        <div className="flex items-center gap-3">
          <span className="data-label w-20 flex-shrink-0">Loudness</span>
          <span className="font-mono text-sm font-semibold text-phosphor">
            {features.loudness.toFixed(1)} dB
          </span>
        </div>
      )}

      {/* Feature bars */}
      <div className="space-y-4">
        {featureConfig.map(({ key, label, color, icon }) => {
          const value = features[key as keyof Features] as number;
          if (value === undefined || value === null) return null;
          const percent = Math.round(value * 100);

          return (
            <div key={key} className="group">
              <div className="flex items-center gap-3">
                <span className="text-base w-6 flex-shrink-0">{icon}</span>
                <span className="data-label w-28 flex-shrink-0">{label}</span>
                <div className="flex-1 h-2.5 bg-black/[0.06] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700 ease-out"
                    style={{
                      width: `${percent}%`,
                      background: `linear-gradient(90deg, ${color}, ${color}99)`,
                    }}
                  />
                </div>
                <span className="font-mono text-xs font-bold text-phosphor w-10 text-right tabular-nums">
                  {percent}%
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const StatBlock = ({ label, value }: { label: string; value: string }) => (
  <div className="bg-black/[0.03] border border-terminal-border rounded-xl px-4 py-4 text-center">
    <div className="data-label mb-1.5">{label}</div>
    <div className="font-display text-xl font-bold tracking-tight text-phosphor">
      {value}
    </div>
  </div>
);

export default AudioDNA;
