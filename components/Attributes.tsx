import React from "react";
import Subtitle from "@components/Subtitle";
import Meta from "@components/Meta";

const TrackAttributes = ({ features }: { features: any }) => {
  return (
    <div className="py-4 pb-12">
      <Subtitle>Attributes</Subtitle>
      <div className="flex flex-col space-y-4">
        {Object.entries(features).map(([featureName, featureValue]) => {
          const value = featureValue as number;
          // Skip negative values
          if (value < 0) {
            return null;
          }

          // Calculate bar width and indicator position based on value
          const barWidth = `${(value * 100).toFixed(0)}%`;
          const indicatorPosition = `${(value * 100).toFixed(0)}%`;

          // Get color based on percentage
          const barColor = getPercentageColor(value);

          return (
            <div key={featureName} className="flex flex-col items-center">
              <div className="relative w-full h-4 bg-gray-300 rounded-full overflow-hidden">
                <div
                  style={{ width: barWidth }}
                  className={`h-full ${barColor}`}
                ></div>
                <div
                  style={{ left: indicatorPosition }}
                  className="absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-white border border-gray-400"
                ></div>
                {/* White indicator with gray border */}
              </div>
              <div className="flex items-center mt-2">
                <Meta>{featureName}</Meta>
                <span className="ml-2 text-sm text-gray-500">{barWidth}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const getPercentageColor = (value: number) => {
  if (value >= 0.75) return "bg-red-500";
  if (value >= 0.5) return "bg-orange-500";
  if (value >= 0.25) return "bg-yellow-500";
  return "bg-blue-500";
};

export default TrackAttributes;
