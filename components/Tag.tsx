import React from "react";

type Props = {
  key: string;
  children: React.ReactNode;
};

const Tag: React.FC<Props> = ({ children, key }) => {
  return (
    <div
      key={key}
      className="inline-block px-3 py-1 rounded-full text-sm xl:text-md font-medium bg-gray-100 text-gray-600 mr-2"
    >
      {children}
    </div>
  );
};

export default Tag;
