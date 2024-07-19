import React from "react";

type Props = {
  children: React.ReactNode;
};

const Username: React.FC<Props> = ({ children }) => {
  return (
    <h1 className="text-4xl lg:text-5xl font-bold mb-2 break-words">
      {children}
    </h1>
  );
};

export default Username;
