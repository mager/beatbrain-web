import React, { useContext, useState, useEffect } from "react";
import { AppContext } from "../context/AppContext";
import Link from "next/link";
import { useRouter } from "next/router";
import AuthMenu from "@components/AuthMenu";

const Header: React.FC = () => {
  const context = useContext(AppContext);
  const { state } = context;
  const router = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const user = state?.user;
  const username = user?.username;

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled 
        ? 'bg-terminal-bg/95 backdrop-blur-sm border-b border-terminal-border' 
        : 'bg-transparent'
    }`}>
      <nav className="flex items-center justify-between px-4 md:px-8 lg:px-12 py-3">
        {/* Logo */}
        <Link href="/" className="group flex items-center gap-1.5">
          <span className="font-display text-base text-accent tracking-wide">
            beatbrain
          </span>
          <span className="text-accent/50 animate-blink font-mono text-sm">_</span>
        </Link>

        {/* Nav Links */}
        <div className="flex items-center gap-6">
          <Link 
            href="/feed"
            className={`font-mono text-xs transition-colors duration-300 ${
              router.pathname === '/feed' 
                ? 'text-accent' 
                : 'text-phosphor-dim hover:text-phosphor'
            }`}
          >
            feed
          </Link>

          {!user ? (
            <Link 
              href="/api/auth/signin"
              className="flex items-center gap-1.5 px-4 py-2 border border-terminal-border hover:border-accent/50 text-phosphor-dim hover:text-accent font-mono text-xs transition-all duration-300 rounded"
            >
              login
            </Link>
          ) : (
            <div className="flex items-center gap-4">
              {username && (
                <Link
                  href={`/u/${username}`}
                  className={`font-mono text-xs transition-colors duration-300 ${
                    router.pathname === '/u/[username]' 
                      ? 'text-cool' 
                      : 'text-phosphor-dim hover:text-phosphor'
                  }`}
                >
                  {username}
                </Link>
              )}
              <AuthMenu iconColor="var(--phosphor)" />
            </div>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Header;
