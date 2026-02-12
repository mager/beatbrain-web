import React from "react";

type Props = {
  children: React.ReactNode;
  title?: string;
};

const GiantTitle: React.FC<Props> = ({ children, title = "" }) => {
  return (
    <h1
      title={title}
      className={`font-display text-white text-massive font-bold mb-2 break-words tracking-tight ${
        title ? "hover:text-glow-accent" : ""
      }`}
    >
      {children}
    </h1>
  );
};

export default GiantTitle;
