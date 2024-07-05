import React from "react";

type Props = {
  children: React.ReactNode;
};

const Big: React.FC<Props> = ({ children }) => {
  return <h2 className="text-5xl font-bold">{children}</h2>;
};

export default Big;
