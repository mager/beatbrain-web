import React from "react";

const Waveform = ({ duration, segments }) => {
  const maxLoudness = Math.max(...segments.map((seg) => seg.loudness_max));
  const minLoudness = Math.min(...segments.map((seg) => seg.loudness_max));
  let color = localStorage.getItem("randomColor");
  if (!color) {
    color = "black";
  }

  const waveformHeight = 100; // You can adjust this value

  const points = segments.flatMap((segment) => {
    const heightStart =
      ((segment.loudness_start - minLoudness) / (maxLoudness - minLoudness)) *
      waveformHeight;
    const heightEnd =
      ((segment.loudness_end - minLoudness) / (maxLoudness - minLoudness)) *
      waveformHeight;

    return [
      `${segment.start},${waveformHeight / 2 - heightStart / 2}`, // Center vertically
      `${segment.start + segment.duration},${
        waveformHeight / 2 - heightEnd / 2
      }`, // Center vertically
    ];
  });

  const pathData = `M${points.join(" L")}`;

  return (
    <div className="w-full h-48 overflow-hidden relative my-4">
      {" "}
      {/* Increased height */}
      <svg
        className="w-full h-full absolute top-0 left-0"
        viewBox={`0 0 ${duration} ${waveformHeight}`} // Updated viewBox
        preserveAspectRatio="none"
      >
        <path d={pathData} fill={color} className="opacity-75" />
      </svg>
    </div>
  );
};

export default Waveform;
