import Link from "next/link";
import { useRouter } from "next/router";
import { useAppContext } from "../context/AppContext";
import { PlusIcon } from "@heroicons/react/24/outline";
export default function Header() {
  const {
    state: { user },
  } = useAppContext();
  const { pathname } = useRouter();
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
        <nav aria-label="Main navigation">
          <Link href="/" aria-current={pathname === "/" ? "page" : undefined}>
            The room
          </Link>
          <Link
            href={user?.username ? `/u/${user.username}` : "/settings"}
            aria-current={pathname === "/u/[username]" ? "page" : undefined}
          >
            My feed
          </Link>
          <Link href="/settings" className="settings-link">
            Settings
          </Link>
        </nav>
        <Link className="button button-primary header-post" href="/create">
          <PlusIcon width={17} />
          <span>Post a track</span>
        </Link>
      </div>
    </header>
  );
}
