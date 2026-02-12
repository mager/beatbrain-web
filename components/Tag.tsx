import React from "react";

type Props = {
  name: string;
  children: React.ReactNode;
};

const Tag: React.FC<Props> = ({ children, name }) => (
  <div
    key={name}
    className="inline-block bg-terminal-surface border border-terminal-border rounded-sm px-2.5 py-1 font-mono text-[10px] text-phosphor hover:border-accent/50 hover:text-accent transition-all mr-1.5 mb-2"
  >
    {children}
  </div>
);

export default Tag;
