import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import { ArrowUpRightIcon, MagnifyingGlassIcon, MusicalNoteIcon } from "@heroicons/react/24/outline";
import type { Creator, CreatorCatalogEntry } from "../../lib/types";
import { catalogHref, catalogRoles, displayCreditRole, filterCatalog, isMusicBrainzID, roleLabels, withRecordingMetadata, type CatalogRole, type RecordingMetadata, type RelatedArtist } from "../../lib/creator-catalog";
import styles from "./creator.module.css";

const pageSize = 24;
const kinds = [{value:"recording",label:"Songs"},{value:"release",label:"Releases"},{value:"work",label:"Compositions"},{value:"all",label:"Everything"}];
const loadError = "Creator credits could not be loaded. Please try again.";

export default function CreatorPage() {
  const router = useRouter();
  const id = typeof router.query.mbid === "string" ? router.query.mbid : "";
  const [state,setState] = useState<{id:string;creator?:Creator;error?:string}>({id:""});
  const [retry,setRetry] = useState(0);
  useEffect(()=>{
    if (!router.isReady) return;
    if (!isMusicBrainzID(id)) {setState({id,error:"This creator link is not valid."});return;}
    const controller = new AbortController();
    setState({id});
    (async()=>{
      try {
        const response = await fetch(`/api/creator?mbid=${id}`,{signal:controller.signal});
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || loadError);
        if (!controller.signal.aborted) setState({id,creator:data});
      } catch(e) {
        if (!controller.signal.aborted) setState({id,error:e instanceof Error ? e.message : loadError});
      }
    })();
    return ()=>controller.abort();
  },[id,router.isReady,retry]);
  if (state.id !== id || !state.creator) return <div className={`room-container ${styles.page}`}>
    <Head><title>Creator credits — Beatbrain</title></Head>
    <Link href="/discover" className={styles.back}>Explore music</Link>
    {state.id === id && state.error ? <section className={styles.state} role="alert"><h1>Credits are unavailable.</h1><p>{state.error}</p><button className="button button-secondary" onClick={()=>setRetry(n=>n+1)}>Try again</button></section>
      : <section className={styles.state} role="status"><h1>Opening the credits…</h1><p>Finding the people and music connected to this creator.</p></section>}
  </div>;
  return <CreatorCatalog key={state.creator.id} creator={state.creator} />;
}

function Cover({entry,metadata}: {entry:CreatorCatalogEntry;metadata?:RecordingMetadata}) {
  const image = metadata?.image || (entry.kind === "release" ? `https://coverartarchive.org/release/${entry.id}/front-250` : "");
  const [failed,setFailed] = useState("");
  return <span className={styles.cover}>{image && failed !== image
    ? <img src={image} width={88} height={88} alt={`${metadata?.album || entry.title} cover`} loading="lazy" onError={()=>setFailed(image)} />
    : <MusicalNoteIcon width={26} aria-hidden="true" />}</span>;
}

function CreatorCatalog({creator}: {creator:Creator}) {
  const router = useRouter();
  const initialRole = typeof router.query.role === "string" && catalogRoles.includes(router.query.role as CatalogRole) ? router.query.role as CatalogRole : "all";
  const [role,setRole] = useState<CatalogRole>(initialRole);
  const [kind,setKind] = useState("recording");
  const [query,setQuery] = useState("");
  const [sort,setSort] = useState("title");
  const [limit,setLimit] = useState(pageSize);
  const [metadata,setMetadata] = useState<Record<string,RecordingMetadata>>({});
  const [metadataError,setMetadataError] = useState(false);
  const [metadataRetry,setMetadataRetry] = useState(0);
  const [related,setRelated] = useState<RelatedArtist[] | null>(null);
  const [relatedError,setRelatedError] = useState(false);
  const [relatedRetry,setRelatedRetry] = useState(0);
  useEffect(()=>{setRole(initialRole);setLimit(pageSize);},[initialRole]);
  const entries = useMemo(()=>withRecordingMetadata(creator.catalog || [],metadata),[creator.catalog,metadata]);
  const results = useMemo(()=>filterCatalog(entries,{kind,role,q:query,sort}),[entries,kind,role,query,sort]);
  const visible = results.slice(0,limit);
  const visibleIDs = visible.filter(e=>e.kind === "recording").map(e=>e.id).join(",");
  useEffect(()=>{
    const ids = visibleIDs.split(",").filter(id=>id && !metadata[id]).slice(0,pageSize);
    if (!ids.length) return;
    const controller = new AbortController();
    setMetadataError(false);
    (async()=>{
      try {
        const response = await fetch(`/api/creator/discovery?recordings=${ids.join(",")}`,{signal:controller.signal});
        const data = await response.json();
        if (!response.ok) throw new Error("Metadata unavailable");
        if (!controller.signal.aborted) setMetadata(previous=>({...previous,...Object.fromEntries(ids.map(id=>[id,data.metadata?.[id] || {artists:[]}]))}));
      } catch {if(!controller.signal.aborted) setMetadataError(true);}
    })();
    return ()=>controller.abort();
  },[visibleIDs,metadata,metadataRetry]);
  useEffect(()=>{
    const controller=new AbortController();setRelatedError(false);
    (async()=>{
      try {
        const response=await fetch(`/api/creator/discovery?mbid=${creator.id}`,{signal:controller.signal});
        const data=await response.json();if(!response.ok)throw new Error("Discovery unavailable");
        if(!controller.signal.aborted)setRelated(data.artists);
      }catch{if(!controller.signal.aborted)setRelatedError(true);}
    })();
    return ()=>controller.abort();
  },[creator.id,relatedRetry]);
  function changeRole(value:CatalogRole) {
    setRole(value);setLimit(pageSize);
    const next={...router.query};if(value === "all")delete next.role;else next.role=value;
    void router.replace({pathname:router.pathname,query:next},undefined,{shallow:true,scroll:false});
  }
  function reset(){setQuery("");setKind("recording");setSort("title");changeRole("all");}
  const counts = Object.fromEntries(kinds.map(k=>[k.value,entries.filter(e=>e.kind === k.value).length]));
  const roles = catalogRoles.filter(r=>r === "all" || entries.some(e=>filterCatalog([e],{kind:"all",role:r,q:"",sort:"title"}).length));
  const source = `https://musicbrainz.org/artist/${creator.id}/relationships`;
  const connections = creator.connections || [];
  return <div className={`room-container ${styles.page}`}>
    <Head><title>{creator.name} — Credits — Beatbrain</title></Head>
    <Link href="/discover" className={styles.back}>Explore music</Link>
    <header className={styles.intro}>
      <h1>{creator.name}</h1>
      <p className={styles.identity}>{[creator.type,creator.begin_area || creator.area,creator.country].filter(Boolean).join(" · ")}</p>
      {creator.disambiguation && <p className={styles.description}>{creator.disambiguation}</p>}
      <p className={styles.summary}>Find your next track in the credits.</p>
      <p className={styles.counts}>{counts.recording.toLocaleString()} recordings <span>·</span> {counts.release.toLocaleString()} releases <span>·</span> {counts.work.toLocaleString()} compositions</p>
      {!!connections.length && <details className={styles.mobileConnections}><summary>{creator.type === "Person" ? "Explore group credits" : "Explore member credits"} ({connections.length})</summary><ul>{connections.map((connection,i)=><li key={`${connection.id}:${i}`}><Link href={`/creator/${connection.id}${role !== "all" ? `?role=${role}` : ""}`}>{connection.name}<ArrowUpRightIcon width={16} aria-hidden="true" /></Link></li>)}</ul></details>}
    </header>
    <div className={styles.layout}>
      <section className={styles.catalog} aria-labelledby="catalog-heading">
        <h2 id="catalog-heading">Explore the credits</h2>
        <div className={styles.kinds} role="group" aria-label="Credit type">
          {kinds.map(k=><button key={k.value} type="button" aria-pressed={kind === k.value} onClick={()=>{setKind(k.value);setLimit(pageSize);}}>{k.label}</button>)}
        </div>
        <div className={styles.roles} role="group" aria-label="Creator role">
          {roles.map(value=><button key={value} type="button" aria-pressed={role === value} onClick={()=>changeRole(value)}>{roleLabels[value]}</button>)}
        </div>
        <div className={styles.controls}>
          <div className={styles.search}><MagnifyingGlassIcon width={20} aria-hidden="true" /><label className="sr-only" htmlFor="catalog-search">Search this catalog</label><input id="catalog-search" type="search" value={query} maxLength={150} placeholder="Search songs, artists or credits" onChange={e=>{setQuery(e.target.value);setLimit(pageSize);}} /></div>
          <div className={styles.sort}><label htmlFor="catalog-sort">Sort</label><select id="catalog-sort" value={sort} onChange={e=>{setSort(e.target.value);setLimit(pageSize);}}><option value="title">Title A–Z</option><option value="artist">Artist A–Z</option></select></div>
        </div>
        <p className={styles.resultCount} role="status" aria-live="polite">{results.length.toLocaleString()} {results.length === 1 ? "result" : "results"}{role !== "all" ? ` · ${roleLabels[role]}` : ""}</p>
        {kind === "release" && <p className={styles.scopeNote}>These credits apply to a release. The source may not identify individual songs.</p>}
        {kind === "work" && <p className={styles.scopeNote}>Compositions describe the written music. Open a source to explore its recordings.</p>}
        {metadataError && <div className={styles.detailError} role="status">Some covers and release details are unavailable. <button type="button" onClick={()=>setMetadataRetry(n=>n+1)}>Retry details</button></div>}
        {visible.length ? <ul className={styles.list} aria-label="Creator credits">{visible.map(entry=>{
          const extra=entry.kind === "recording" ? metadata[entry.id] : undefined;const artists=entry.artists;
          const year=(entry.date || extra?.date || "").slice(0,4);const external=entry.kind !== "recording";
          return <li key={`${entry.kind}:${entry.id}`} className={styles.row}>
            <Link href={catalogHref(entry)} className={styles.artLink} aria-label={`Open ${entry.title}`} {...(external?{target:"_blank",rel:"noopener noreferrer"}:{})}><Cover entry={entry} metadata={extra} /></Link>
            <div className={styles.trackInfo}>
              <Link href={catalogHref(entry)} className={styles.trackTitle} {...(external?{target:"_blank",rel:"noopener noreferrer"}:{})}>{entry.title}{external && <ArrowUpRightIcon width={15} aria-label="opens source" />}</Link>
              {!!artists.length && <p className={styles.artists}>{artists.map((artist,i)=><span key={`${artist.id || artist.name}:${i}`}>{i>0 && ", "}{isMusicBrainzID(artist.id) ? <Link href={`/creator/${artist.id}`}>{artist.name}</Link> : artist.name}</span>)}</p>}
              {entry.disambiguation && <p className={styles.version}>{entry.disambiguation}</p>}
              <p className={styles.creditRoles}>{entry.roles.map(displayCreditRole).join(" · ")}</p>
            </div>
            <span className={styles.year}>{year || <span className="sr-only">Release date unknown</span>}</span>
          </li>;
        })}</ul> : <div className={styles.empty}><h3>{entries.length ? "No matching credits." : "No credits in this source yet."}</h3><p>{entries.length ? "Try another role, credit type or search." : "Explore the group connections or open a source below."}</p>{entries.length>0 && <button className="button button-secondary" onClick={reset}>Reset filters</button>}</div>}
        {results.length>limit && <div className={styles.more}><button className="button button-secondary" onClick={()=>setLimit(n=>n+pageSize)}>Show more credits</button><span>{visible.length} of {results.length}</span></div>}
        <p className={styles.sourceNote}>Known credits from <a href={source} target="_blank" rel="noopener noreferrer">MusicBrainz</a>. Coverage can be incomplete. Covers and release details via <a href="https://listenbrainz.org" target="_blank" rel="noopener noreferrer">ListenBrainz</a> and <a href="https://coverartarchive.org" target="_blank" rel="noopener noreferrer">Cover Art Archive</a>.</p>
      </section>
      <aside className={styles.aside} aria-label="Keep exploring">
        {!!connections.length && <section><h2>{creator.type === "Person" ? "Also part of" : "The people behind it"}</h2><p className={styles.asideNote}>Each group keeps its own credits.</p><ul className={styles.connections}>{connections.map((connection,i)=><li key={`${connection.id}:${i}`}><Link href={`/creator/${connection.id}`}><span><strong>{connection.name}</strong><small>{connection.relation}{connection.begin || connection.end ? ` · ${connection.begin || "?"}–${connection.end || (connection.ended ? "?" : "present")}` : connection.ended ? " · past membership" : ""}</small></span><ArrowUpRightIcon width={18} aria-hidden="true" /></Link></li>)}</ul></section>}
        <section><h2>Keep exploring</h2><p className={styles.asideNote}>Artist suggestions from ListenBrainz.</p>
          {relatedError ? <div className={styles.detailError} role="status"><p>Artist suggestions could not be loaded.</p><button onClick={()=>setRelatedRetry(n=>n+1)}>Try suggestions again</button></div>
          : related === null ? <p className={styles.asideNote} role="status">Finding more artists…</p>
          : related.length ? <ul className={styles.connections}>{related.map(artist=><li key={artist.id}><Link href={`/creator/${artist.id}`}><strong>{artist.name}</strong><ArrowUpRightIcon width={18} aria-hidden="true" /></Link><Link className={styles.sampleLink} href={`/song/${artist.recordingId}`}>Explore a recording</Link></li>)}</ul>
          : <p className={styles.asideNote}>No artist suggestions in this source yet.</p>}
        </section>
        {!!creator.genres?.length && <section><h2>Musical styles</h2><p className={styles.genres}>{creator.genres.join(" · ")}</p></section>}
        <section><h2>Go deeper</h2><a className={styles.sourceLink} href={source} target="_blank" rel="noopener noreferrer">MusicBrainz credits <ArrowUpRightIcon width={16} /></a>
          <details className={styles.sources}><summary>More sources and artist links</summary><ul>{creator.links?.filter(link=>/^https?:\/\//.test(link.url)).map(link=><li key={link.url}><a href={link.url} target="_blank" rel="noopener noreferrer">{link.type}<ArrowUpRightIcon width={15} /></a></li>)}</ul></details>
        </section>
      </aside>
    </div>
  </div>;
}
