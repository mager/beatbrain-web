import React from "react";
import Box from "./Box";

interface FooterProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

const Footer: React.FC<FooterProps> = ({ className, ...rest }) => {
  return (
    <Box
      className={`flex items-center justify-between px-4 md:px-8 lg:px-12 w-full h-full bg-terminal-bg/95 backdrop-blur-sm border-t border-terminal-border font-mono text-[10px] ${className}`}
      {...rest}
    >
      <div className="flex items-center gap-4 text-phosphor-dim">
        <span className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-matrix animate-pulse" />
          <span>CONNECTED</span>
        </span>
        <span className="text-terminal-border">│</span>
        <span>SYS:BEATBRAIN v2.0</span>
      </div>
      
      <div className="flex items-center gap-4 text-phosphor-dim">
        <span>
          <a 
            href="https://twitter.com/mager"
            target="_blank"
            rel="noopener noreferrer"
            className="text-phosphor-dim hover:text-cyber transition-colors"
          >
            @mager
          </a>
        </span>
        <span className="text-terminal-border">│</span>
        <span className="tabular-nums">{new Date().getFullYear()}</span>
      </div>
    </Box>
  );
};

export default Footer;
