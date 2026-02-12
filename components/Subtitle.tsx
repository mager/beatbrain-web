import React from "react";

type Props = {
  children: React.ReactNode;
};

const Subtitle: React.FC<Props> = ({ children }) => {
  return (
    <h2 className="font-display text-hero text-phosphor tracking-tight mb-2">
      {children}
    </h2>
  );
};

export default Subtitle;
