import React from "react";

type Props = {
  children: React.ReactNode;
};

const GiantTitle: React.FC<Props> = ({ children }) => {
  return (
    <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-2">
      {children}
    </h1>
  );
};

export default GiantTitle;
