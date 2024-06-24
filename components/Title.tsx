import React from "react";

type Props = {
  children: React.ReactNode;
};

const Title: React.FC<Props> = ({ children }) => {
  return <h1 className="text-4xl font-bold">{children}</h1>;
};

export default Title;
