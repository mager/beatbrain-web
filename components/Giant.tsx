import React from "react";

type Props = {
  children: React.ReactNode;
};

const Giant: React.FC<Props> = ({ children }) => {
  return <h1 className="text-6xl font-bold">{children}</h1>;
};

export default Giant;
