import { useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowRightIcon, ArrowUpRightIcon } from "@heroicons/react/24/outline";
import packageInfo from "../package.json";
const { version } = packageInfo;

export default function FooterCredit() {
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
        Built with love in Chicago by{" "}
        <a href="https://mager.co" target="_blank" rel="noreferrer">
          mager
        </a>{" "}
        with agents.
      </p>
      <nav className="footer-links" aria-label="Beatbrain links">
        <a href="https://github.com/mager/beatbrain-web" target="_blank" rel="noreferrer">
          GitHub <ArrowUpRightIcon width={14} aria-hidden="true" />
        </a>
        <a href="https://x.com/beatbrainxyz" target="_blank" rel="noreferrer" aria-label="Beatbrain on X">
          X <ArrowUpRightIcon width={14} aria-hidden="true" />
        </a>
        <Link href="/about">
          About Beatbrain <ArrowRightIcon width={15} aria-hidden="true" />
        </Link>
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
