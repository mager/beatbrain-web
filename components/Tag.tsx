import React from "react";

type Props = {
  name: string;
  children: React.ReactNode;
  light?: boolean;
};

const Tag: React.FC<Props> = ({ children, name, light = false }) => (
  <div
    key={name}
    className={`inline-block rounded-full px-3.5 py-1 font-mono text-[11px] transition-all mr-2 mb-2 cursor-default border ${
      light
        ? "bg-white/10 border-white/20 text-white/75 hover:bg-white/20 hover:text-white"
        : "bg-white/[0.04] border-terminal-border text-phosphor hover:border-cool/40 hover:text-cool hover:bg-cool/[0.06]"
    }`}
  >
    {children}
  </div>
);

export default Tag;
