import React, { useMemo } from "react";
import type { Segment } from "@types";

type Props = {
  segments: Segment[];
  duration: number; // total duration in seconds
};

const LoudnessMap: React.FC<Props> = ({ segments, duration }) => {
  const barCount = 120;

  const bars = useMemo(() => {
    if (!segments || segments.length === 0) return [];

    // Bucket segments into evenly-spaced bars
    const bucketDuration = duration / barCount;
    const buckets: number[] = new Array(barCount).fill(-60);

    for (const seg of segments) {
      const bucketIndex = Math.min(
        Math.floor(seg.start / bucketDuration),
        barCount - 1
      );
      // Use the loudest value in each bucket
      if (seg.loudness_max > buckets[bucketIndex]) {
        buckets[bucketIndex] = seg.loudness_max;
      }
    }

    // Normalize to 0-1 range
    const maxLoud = Math.max(...buckets);
    const minLoud = Math.min(...buckets);
    const range = maxLoud - minLoud || 1;

    return buckets.map((loud) => (loud - minLoud) / range);
  }, [segments, duration]);

  if (bars.length === 0) return null;

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="space-y-2">
      {/* Waveform visualization */}
      <div className="flex items-end gap-[1px] h-16">
        {bars.map((value, i) => {
          const height = Math.max(2, value * 100);
          // Color gradient from cool (quiet) to warm (loud)
          const hue = 220 - value * 180; // 220 (blue) → 40 (orange)
          const saturation = 60 + value * 30;
          const lightness = 40 + value * 25;

          return (
            <div
              key={i}
              className="flex-1 rounded-t-sm transition-all duration-200"
              style={{
                height: `${height}%`,
                backgroundColor: `hsl(${hue}, ${saturation}%, ${lightness}%)`,
                opacity: 0.7 + value * 0.3,
              }}
            />
          );
        })}
      </div>

      {/* Time markers */}
      <div className="flex justify-between font-mono text-[10px] text-phosphor-dim/50">
        <span>0:00</span>
        <span>{formatTime(duration / 4)}</span>
        <span>{formatTime(duration / 2)}</span>
        <span>{formatTime((duration * 3) / 4)}</span>
        <span>{formatTime(duration)}</span>
      </div>
    </div>
  );
};

export default LoudnessMap;
