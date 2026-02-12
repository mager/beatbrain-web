import React from "react";

type Props = {
  children: React.ReactNode;
};

const Title: React.FC<Props> = ({ children }) => {
  return <h1 className="font-display text-3xl md:text-4xl text-white tracking-tight font-bold">{children}</h1>;
};

export default Title;
