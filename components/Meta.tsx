import React from "react";

type Props = {
  children: React.ReactNode;
};

const Meta: React.FC<Props> = ({ children }) => {
  return (
    <h5 className="text-md md:text-lg font-bold text-gray-400 mb-4">
      {children}
    </h5>
  );
};

export default Meta;
