import React from "react";
import Box from "@components/Box";
import Subtitle from "@components/Subtitle";
import Meta from "@components/Meta";

const TrackAttributes = ({ features }: { features: any }) => {
  return (
    <Box>
      <Subtitle>Attributes</Subtitle>
      <div className="flex flex-col space-y-2">
        {Object.entries(features).map(([featureName, featureValue]) => {
          const value = featureValue as number;
          // Skip negative values
          if (value < 0) {
            return null;
          }

          // Calculate bar width and indicator position based on value
          const barWidth = `${(value * 100).toFixed(0)}%`;

          return (
            <div key={featureName} className="flex flex-col items-center">
              <div className="relative w-full h-2 bg-gray-300 rounded-full overflow-hidden">
                <div
                  style={{ width: barWidth }}
                  className="h-full bg-gray-600"
                ></div>
              </div>
              <div className="flex justify-between w-full mt-1">
                <Meta>{featureName}</Meta>
                <span className="text-sm text-gray-500">{barWidth}</span>
              </div>
            </div>
          );
        })}
      </div>
    </Box>
  );
};

export default TrackAttributes;
