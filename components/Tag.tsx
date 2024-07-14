import React from "react";

type Props = {
  name: string;
  children: React.ReactNode;
};

const Tag: React.FC<Props> = ({ children, name }) => {
  return (
    <div
      key={name}
      className="inline-block px-3 py-1 rounded-full text-sm xl:text-md font-medium bg-gray-100 text-gray-600 mr-2"
    >
      {children}
    </div>
  );
};

export default Tag;
