import React, { useContext, useState, useEffect } from "react";
import { AppContext } from "../context/AppContext";
import Link from "next/link";
import { useRouter } from "next/router";
import AuthMenu from "@components/AuthMenu";
import Logo from "@components/Logo";

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
        ? 'bg-terminal-bg/95 backdrop-blur-md border-b border-terminal-border/60 shadow-sm'
        : 'bg-transparent'
    }`}>
      <nav className="bb-container flex items-center justify-between py-3">
        {/* Logo */}
        <Logo size="md" />

        {/* Nav Links */}
        <div className="flex items-center gap-6">
          <Link
            href="/discover"
            className={`font-display text-sm font-semibold tracking-tight transition-colors duration-300 ${
              router.pathname === '/discover'
                ? 'text-accent'
                : 'text-phosphor-dim hover:text-phosphor'
            }`}
          >
            Discover
          </Link>
          <Link
            href="/feed"
            className={`font-display text-sm font-semibold tracking-tight transition-colors duration-300 ${
              router.pathname === '/feed'
                ? 'text-accent'
                : 'text-phosphor-dim hover:text-phosphor'
            }`}
          >
            Feed
          </Link>
          <Link
            href="/podcasts"
            className={`font-display text-sm font-semibold tracking-tight transition-colors duration-300 ${
              router.pathname === '/podcasts'
                ? 'text-accent'
                : 'text-phosphor-dim hover:text-phosphor'
            }`}
          >
            Podcasts
          </Link>

          {!user ? (
            <Link
              href="/auth/signin"
              className="flex items-center gap-1.5 px-5 py-2 bg-accent text-white font-display text-sm font-semibold transition-all duration-300 rounded-full hover:bg-accent/90 hover:shadow-glow-accent"
            >
              Sign in
            </Link>
          ) : (
            <div className="flex items-center gap-4">
              {username && (
                <Link
                  href={`/u/${username}`}
                  className={`font-display text-sm font-semibold tracking-tight transition-colors duration-300 ${
                    router.pathname === '/u/[username]'
                      ? 'text-cool'
                      : 'text-phosphor-dim hover:text-phosphor'
                  }`}
                >
                  {username}
                </Link>
              )}
              <AuthMenu iconColor="var(--phosphor-dim)" />
            </div>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Header;
