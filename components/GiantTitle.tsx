import React from "react";

type Props = {
  children: React.ReactNode;
};

const GiantTitle: React.FC<Props> = ({ children }) => {
  return (
    <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-2">
      {children}
    </h1>
  );
};

export default GiantTitle;
