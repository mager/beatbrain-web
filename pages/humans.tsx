import type { GetServerSideProps } from "next";
import Head from "next/head";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowUpRightIcon, MagnifyingGlassIcon, MusicalNoteIcon, XMarkIcon } from "@heroicons/react/24/outline";
import MemberAvatar from "../components/MemberAvatar";
import { getSession } from "../lib/auth-api";
import { PRIVATE_CACHE_CONTROL } from "../lib/access";
import { getHumans, parseHumansQuery } from "../lib/humans";
import type { Human, HumansQuery, HumansResult } from "../lib/humans-types";
import styles from "./humans.module.css";

type Props = { initial: HumansResult; initialQuery: HumansQuery; initialError: string | null };
const empty: HumansResult = { members: [], total: 0, hasMore: false };
const loadError = "Members could not be loaded. Please try again.";

export const getServerSideProps: GetServerSideProps<Props> = async ({ req, res, query }) => {
  res.setHeader("Cache-Control", PRIVATE_CACHE_CONTROL);
  const session = await getSession(req);
  if (!session) return { redirect: { destination: "/auth/signin?callbackUrl=%2Fhumans", permanent: false } };
  const initialQuery = parseHumansQuery({ sort: "posts", ...query, page: "0" }) || { q: "", filter: "everyone", sort: "posts", page: 0 };
  try {
    return { props: { initial: await getHumans(session.user.id, initialQuery), initialQuery, initialError: null } };
  } catch {
    return { props: { initial: empty, initialQuery, initialError: loadError } };
  }
};

function Cover({ post, className, priority }: { post: Human["posts"][number]; className: string; priority: boolean }) {
  const [failed, setFailed] = useState(false);
  return <span className={className}>
    {post.track.image && !failed ? <img src={post.track.image} alt={`${post.track.title} — ${post.track.artist}`} width={400} height={400} loading={priority ? "eager" : "lazy"} onError={() => setFailed(true)} />
      : <span className={styles.coverFallback}><MusicalNoteIcon width={32} /><span>{post.track.title}</span></span>}
  </span>;
}

function Member({ member, priority }: { member: Human; priority: boolean }) {
  const latest = member.posts[0];
  return <li className={styles.member}>
    <Link href={`/u/${encodeURIComponent(member.username)}`} className={styles.profileLink}>
      <div className={styles.identity}>
        <MemberAvatar image={member.image} name={member.name} className={styles.avatar} />
        <div className={styles.name}><h2>{member.name}</h2><p>@{member.username}</p></div>
        <ArrowUpRightIcon className={styles.profileArrow} width={23} />
      </div>
      <div className={`${styles.sleeves} ${member.posts.length === 1 ? styles.singleSleeve : ""}`}>
        {latest ? member.posts.map((post, i) => <Cover key={post.id} post={post} className={`${styles.cover} ${styles[`cover${i}`]}`} priority={priority && i === 0} />)
          : <div className={styles.emptySleeve}><MemberAvatar image={member.image} name={member.name} className={styles.portrait} /></div>}
        <span className={styles.sleeveCaption}>{latest ? "Recent selections" : "No tracks posted yet"}<ArrowUpRightIcon width={16} /></span>
      </div>
      <div className={styles.memberMeta}>
        <span>{member.postCount.toLocaleString()} {member.postCount === 1 ? "post" : "posts"}</span>
        {member.isSelf ? <span className={styles.relationship}>You</span> : member.following ? <span className={styles.relationship}>Following</span> : <span>Joined {new Date(member.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric", timeZone: "UTC" })}</span>}
      </div>
      {latest && <p className={styles.latest}><span>Last shared</span><strong>{latest.track.title}</strong><span>{latest.track.artist}</span></p>}
    </Link>
  </li>;
}

const filters = [{ value: "everyone", label: "Everyone" }, { value: "following", label: "Following" }, { value: "recent", label: "Posted in 30 days" }] as const;

export default function Humans({ initial, initialQuery, initialError }: Props) {
  const [query, setQuery] = useState(initialQuery);
  const [result, setResult] = useState(initial);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(initialError);
  const [retry, setRetry] = useState(0);
  const first = useRef(true);
  const search = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (first.current) { first.current = false; return; }
    const controller = new AbortController();
    setLoading(true); setError(null);
    if (query.page === 0) setResult(empty);
    const timeout = window.setTimeout(async () => {
      try {
        const params = new URLSearchParams({ q: query.q, filter: query.filter, sort: query.sort, page: String(query.page) });
        const response = await fetch(`/api/humans?${params}`, { signal: controller.signal });
        if (!response.ok) throw new Error(response.status === 401 ? "Your session ended. Sign in to explore members." : loadError);
        const data: HumansResult = await response.json();
        if (controller.signal.aborted) return;
        setResult(previous => ({ ...data, members: query.page === 0 ? data.members : Array.from(new Map([...previous.members, ...data.members].map(member => [member.id, member])).values()) }));
      } catch (e) {
        if (!controller.signal.aborted) setError(e instanceof Error ? e.message : loadError);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, query.q ? 250 : 0);
    return () => { window.clearTimeout(timeout); controller.abort(); };
  }, [query, retry]);

  function change(values: Partial<HumansQuery>) {
    setQuery(current => ({ ...current, ...values, page: 0 }));
  }
  function reset() {
    change({ q: "", filter: "everyone" });
    search.current?.focus();
  }
  return <div className={`room-container ${styles.page}`}>
    <Head><title>Humans — Beatbrain</title></Head>
    <section className={styles.intro} aria-labelledby="humans-title">
      <h1 id="humans-title">Humans<span>.</span></h1>
      <p className={styles.introCopy}>Good music comes from people.<br /><span>Find yours. See what they’re sharing.</span></p>
      <p className={styles.mobileIntro}>Meet the people behind the music.</p>
    </section>
    <section className={styles.tools} aria-label="Find members">
      <div className={styles.search}>
        <MagnifyingGlassIcon width={22} aria-hidden="true" />
        <label className="sr-only" htmlFor="human-search">Search members by name, handle, or artist</label>
        <input id="human-search" ref={search} type="search" value={query.q} maxLength={100} placeholder="Search names, handles or artists" onChange={event => change({ q: event.target.value })} />
        {query.q && <button type="button" onClick={() => { change({ q: "" }); search.current?.focus(); }} aria-label="Clear member search"><XMarkIcon width={20} /></button>}
      </div>
      <div className={styles.browseControls}>
        <div className={styles.filters} role="group" aria-label="Filter members">
          {filters.map(filter => <button key={filter.value} type="button" aria-pressed={query.filter === filter.value} onClick={() => change({ filter: filter.value })}>{filter.label}</button>)}
        </div>
        <div className={styles.sort}><label htmlFor="human-sort">Sort by</label><select id="human-sort" value={query.sort} onChange={event => change({ sort: event.target.value as HumansQuery["sort"] })}><option value="newest">Newest members</option><option value="name">Name A–Z</option><option value="posts">Most posts</option></select></div>
      </div>
    </section>
    <div className={styles.resultsHeading}>
      <p role="status" aria-live="polite">{loading ? "Finding your people…" : error ? "Search paused" : `${result.total.toLocaleString()} ${result.total === 1 ? "human" : "humans"}${query.q.trim() ? ` matching “${query.q.trim()}”` : " in the room"}`}</p>
      <span>Different people. Shared frequencies.</span>
    </div>
    {error && <div className={styles.error} role="alert"><p>{error}</p><button className="button button-secondary" onClick={() => setRetry(value => value + 1)}>Try again</button>{error.startsWith("Your session") && <Link href="/auth/signin?callbackUrl=%2Fhumans">Sign in</Link>}</div>}
    <div aria-busy={loading}>
      {result.members.length > 0 && <ul className={styles.grid} aria-label="Members">{result.members.map((member, i) => <Member key={member.id} member={member} priority={i < 3} />)}</ul>}
      {loading && !result.members.length && <div className={styles.loading} aria-hidden="true"><span /><span /><span /></div>}
      {!loading && !error && !result.members.length && <div className={styles.empty}>
        <h2>{query.q ? "No humans found." : query.filter === "following" ? "Your people are out there." : query.filter === "recent" ? "A quiet month in the room." : "The room is quiet."}</h2>
        <p>{query.q ? "Try another name, handle, or artist." : query.filter === "following" ? "Visit a profile and follow someone to find them here." : "Explore everyone and find someone new."}</p>
        <button className="button button-secondary" onClick={reset}>{query.q ? "Clear search and filters" : "Explore everyone"}</button>
      </div>}
    </div>
    {result.hasMore && !error && <div className={styles.more}><button className="button button-secondary" disabled={loading} onClick={() => setQuery(current => ({ ...current, page: current.page + 1 }))}>{loading ? "Loading members…" : "Meet more humans"}</button></div>}
  </div>;
}
