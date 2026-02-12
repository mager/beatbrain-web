import React from "react";

type Props = {
  children: React.ReactNode;
};

const Meta: React.FC<Props> = ({ children }) => {
  return (
    <h5 className="font-mono text-xs text-phosphor-dim uppercase tracking-wider mb-4">
      {children}
    </h5>
  );
};

export default Meta;
