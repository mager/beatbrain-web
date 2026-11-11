import { useEffect, useRef } from "react";
import Link from "next/link";
import {
  Cog6ToothIcon,
  ArrowRightIcon,
  ArrowUpRightIcon,
  LightBulbIcon,
} from "@heroicons/react/24/outline";
import packageInfo from "../package.json";
import { useAppContext } from "../context/AppContext";
import { isOwner } from "../lib/access";
import { useTheme } from "../context/ThemeContext";
const { version } = packageInfo;

export default function FooterCredit() {
  const { theme, toggleTheme } = useTheme();
  const {
    state: { user },
  } = useAppContext();
  const footer = useRef<HTMLElement>(null);
  useEffect(() => {
    const measure = () =>
      document.documentElement.style.setProperty(
        "--footer-height",
        `${footer.current?.getBoundingClientRect().height || 100}px`,
      );
    measure();
    const observer = new ResizeObserver(measure);
    if (footer.current) observer.observe(footer.current);
    return () => observer.disconnect();
  }, []);
  return (
    <footer className="site-footer" ref={footer}>
      <p className="footer-credit">
        Built with <span role="img" aria-label="love">💜</span> in Chicago by{" "}
        <a href="https://mager.co" target="_blank" rel="noreferrer">
          @mager
        </a>{" "}
        with help from magerbot
      </p>
      <nav className="footer-links" aria-label="Beatbrain links">
        <a
          href="https://github.com/mager/beatbrain-web"
          target="_blank"
          rel="noreferrer"
          aria-label="Beatbrain on GitHub"
          className="footer-icon"
          title="GitHub"
        >
          <svg width="19" height="19" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 .75a11.25 11.25 0 0 0-3.56 21.92c.56.1.77-.24.77-.54v-2.1c-3.13.68-3.79-1.33-3.79-1.33-.51-1.3-1.25-1.65-1.25-1.65-1.03-.7.08-.69.08-.69 1.13.08 1.72 1.16 1.72 1.16 1 1.72 2.63 1.22 3.27.93.1-.73.39-1.22.71-1.5-2.5-.28-5.13-1.25-5.13-5.56 0-1.23.44-2.23 1.16-3.02-.12-.28-.5-1.43.11-2.98 0 0 .95-.3 3.1 1.15A10.8 10.8 0 0 1 12 6.16c.96 0 1.92.13 2.82.38 2.15-1.46 3.1-1.15 3.1-1.15.61 1.55.23 2.7.11 2.98.72.79 1.16 1.79 1.16 3.02 0 4.32-2.64 5.27-5.15 5.55.4.35.76 1.03.76 2.08v3.11c0 .3.2.65.78.54A11.25 11.25 0 0 0 12 .75Z" /></svg>
        </a>
        <a
          href="https://x.com/beatbrainxyz"
          target="_blank"
          rel="noreferrer"
          aria-label="Beatbrain on X"
          className="footer-icon"
          title="X"
        >
          <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M18.9 2H22l-6.8 7.8L23.2 22h-6.3L12 14.6 5.5 22H2.3l7.8-8.9L.8 2h6.5l4.4 6.7L18.9 2Zm-1.1 18h1.7L6.3 3.9H4.5L17.8 20Z" /></svg>
        </a>
        <button type="button" className="theme-toggle" onClick={toggleTheme}
          aria-label={theme === "dark" ? "Turn the light on" : "Turn the light off"}
          title={theme === "dark" ? "Turn the light on" : "Turn the light off"}
          aria-pressed={theme === "light"}>
          <LightBulbIcon width={19} aria-hidden="true" />
        </button>
        <Link href="/about">
          About Beatbrain <ArrowRightIcon width={15} aria-hidden="true" />
        </Link>
        {user && (
          <Link href="/settings">
            <Cog6ToothIcon width={16} aria-hidden="true" /> Settings
          </Link>
        )}
        {isOwner(user) && <Link href="/admin">Admin</Link>}
        <a
          className="footer-version"
          href={`https://github.com/mager/beatbrain-web/blob/v${version}/CHANGELOG.md`}
          target="_blank"
          rel="noreferrer"
          aria-label={`v${version} — changelog on GitHub`}
        >
          v{version} <ArrowUpRightIcon width={14} aria-hidden="true" />
        </a>
      </nav>
    </footer>
  );
}
