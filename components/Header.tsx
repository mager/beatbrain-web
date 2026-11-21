import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useAppContext } from "../context/AppContext";
import { Bars3Icon, PlusIcon } from "@heroicons/react/24/outline";
import GlobalSearch from "./GlobalSearch";
export default function Header() {
  const {
    state: { user },
  } = useAppContext();
  const { pathname, asPath } = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const navigation = useRef<HTMLDivElement>(null);
  const toggle = useRef<HTMLButtonElement>(null);
  const links = [
    { href: "/", label: "Discover", active: ["/", "/discover"].includes(pathname) },
    { href: "/feed", label: "Feed", active: pathname === "/feed" },
    { href: "/humans", label: "Humans", active: pathname === "/humans" },
    { href: user?.username ? `/u/${user.username}` : "/settings", label: "Profile", active: asPath === `/u/${user?.username}` },
  ];
  useEffect(() => { setMenuOpen(false); }, [asPath]);
  useEffect(() => {
    if (!menuOpen) return;
    function dismiss(event: PointerEvent) {
      if (!navigation.current?.contains(event.target as Node)) setMenuOpen(false);
    }
    document.addEventListener("pointerdown", dismiss);
    return () => document.removeEventListener("pointerdown", dismiss);
  }, [menuOpen]);
  return (
    <header className="site-header">
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <div className="header-inner">
        <Link href="/" className="wordmark" aria-label="Beatbrain home">
          beatbrain
          <span className="brand-signal" aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
        </Link>
        <div className="header-navigation" ref={navigation}
          onBlur={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget)) setMenuOpen(false);
          }}
          onKeyDown={(event) => {
            if (menuOpen && event.key === "Escape") {
              setMenuOpen(false);
              toggle.current?.focus();
            }
          }}>
          <button type="button" className="header-menu-toggle" ref={toggle}
            aria-label="Main navigation" aria-expanded={menuOpen} aria-controls="main-navigation"
            onClick={() => setMenuOpen(!menuOpen)}>
            <Bars3Icon width={20} aria-hidden="true" />
            {links.find((link) => link.active)?.label ?? "Menu"}
          </button>
          <nav id="main-navigation" aria-label="Main navigation" data-open={menuOpen}>
            {links.map((link) => (
              <Link key={link.href} href={link.href} aria-current={link.active ? "page" : undefined}
                onClick={() => setMenuOpen(false)}>{link.label}</Link>
            ))}
          </nav>
        </div>
        <GlobalSearch />
        <Link className={`button button-primary header-post${pathname === "/humans" ? " humans-header-post" : ""}`} href="/create" aria-label="Post a track">
          <PlusIcon width={17} />
          <span>Post a track</span>
        </Link>
      </div>
    </header>
  );
}
