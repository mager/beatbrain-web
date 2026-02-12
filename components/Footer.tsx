import React from "react";
import Logo from "@components/Logo";

interface FooterProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

const Footer: React.FC<FooterProps> = ({ className, ...rest }) => {
  return (
    <div
      className={`py-2 w-full h-full bg-terminal-bg/95 backdrop-blur-sm border-t border-terminal-border font-mono text-[10px] ${className}`}
      {...rest}
    >
      <div className="bb-container flex items-center justify-between">
        <div className="flex items-center gap-4 text-phosphor-dim">
          <Logo size="sm" />
        </div>
        
        <div className="flex items-center gap-4 text-phosphor-dim">
          <a 
            href="https://twitter.com/mager"
            target="_blank"
            rel="noopener noreferrer"
            className="text-phosphor-dim hover:text-accent transition-colors"
          >
            @mager
          </a>
          <span className="text-terminal-border">·</span>
          <span className="tabular-nums">{new Date().getFullYear()}</span>
        </div>
      </div>
    </div>
  );
};

export default Footer;
