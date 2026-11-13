import { discoverySources, sourceSummary, type SourceHealth } from "../lib/discovery-health";

export default function DiscoverySources({sources,loading,error}:{sources:SourceHealth[];loading:boolean;error:boolean}) {
 return <details className="discovery-sources">
  <summary>{loading?"Checking music sources…":error?"Music source status unavailable":sourceSummary(sources)}</summary>
  <p>Each source updates separately. Saved tracks stay available when an update is delayed.</p>
  <ul className="discovery-source-status">
   {discoverySources.map(source=>{
    const health=sources.find(item=>item.source===source.source);
    const date=health?.updated?new Date(`${health.updated}T00:00:00Z`).toLocaleDateString("en-US",{month:"short",day:"numeric",timeZone:"UTC"}):"";
    return <li key={source.source}>
     <a href={source.href} target="_blank" rel="noreferrer">{source.name}</a>
     <span>{loading?"Checking…":error?"Status unavailable":date?<>Checked {date}{health?.status!=="current"?" · Update delayed":""}</>:"No recent update"}</span>
    </li>;
   })}
  </ul>
  <p>Track matching and metadata: Spotify and <a href="https://musicbrainz.org" target="_blank" rel="noreferrer">MusicBrainz</a>.</p>
 </details>;
}
