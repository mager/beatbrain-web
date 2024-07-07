import React from "react";

type Props = {
  children: React.ReactNode;
};

const Subtitle: React.FC<Props> = ({ children }) => {
  return <h2 className="text-2xl xl:text-3xl font-bold">{children}</h2>;
};

export default Subtitle;
