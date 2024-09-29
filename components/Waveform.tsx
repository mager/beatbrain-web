import React from "react";

const Waveform = ({ duration, segments, strokeColor }) => {
  const maxLoudness = Math.max(...segments.map((seg) => seg.loudness_max));
  const minLoudness = Math.min(...segments.map((seg) => seg.loudness_max));

  const waveformHeight = 100;

  const points = segments.map((segment) => {
    const x = (segment.start / duration) * 100;
    const y =
      ((segment.loudness_max - minLoudness) / (maxLoudness - minLoudness)) *
      waveformHeight;
    return `${x},${waveformHeight - y}`;
  });

  const pathData = `M${points.join(" L")}`;

  return (
    <div className="w-full h-24 lg:h-48 overflow-hidden relative my-4">
      <svg
        className="w-full h-full absolute top-0 left-0"
        viewBox={`0 0 100 ${waveformHeight}`}
        preserveAspectRatio="none"
      >
        <path d={pathData} stroke={strokeColor} fill="none" strokeWidth="1" />
      </svg>
    </div>
  );
};

export default Waveform;
