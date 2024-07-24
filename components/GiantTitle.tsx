import React from "react";

type Props = {
  children: React.ReactNode;
};

const GiantTitle: React.FC<Props> = ({ children }) => {
  return (
    <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-2 break-words">
      {children}
    </h1>
  );
};

export default GiantTitle;
