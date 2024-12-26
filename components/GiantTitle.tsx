import React from "react";

type Props = {
  children: React.ReactNode;
  title?: string;
};

const GiantTitle: React.FC<Props> = ({ children, title = "" }) => {
  return (
    <h1
      title={title}
      className="text-5xl md:text-6xl lg:text-7xl font-bold mb-2 break-words"
    >
      {children}
    </h1>
  );
};

export default GiantTitle;
