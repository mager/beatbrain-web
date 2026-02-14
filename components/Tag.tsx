import React from "react";

type Props = {
  name: string;
  children: React.ReactNode;
};

const Tag: React.FC<Props> = ({ children, name }) => (
  <div
    key={name}
    className="inline-block bg-white/[0.04] border border-terminal-border rounded-full px-3.5 py-1.5 font-mono text-[11px] text-phosphor hover:border-cool/40 hover:text-cool hover:bg-cool/[0.06] transition-all mr-2 mb-2 cursor-default"
  >
    {children}
  </div>
);

export default Tag;
