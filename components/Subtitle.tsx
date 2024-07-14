import React from "react";

type Props = {
  children: React.ReactNode;
};

const Subtitle: React.FC<Props> = ({ children }) => {
  return <h2 className="text-3xl xl:text-4xl font-italic mb-2">{children}</h2>;
};

export default Subtitle;
