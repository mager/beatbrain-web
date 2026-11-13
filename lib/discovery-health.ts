export const discoverySources = [
 {source:"spotify_new_releases",name:"Spotify new releases",href:"https://open.spotify.com/"},
 {source:"apple_music_charts",name:"Apple Music · US Top 50",href:"https://rss.marketingtools.apple.com/api/v2/us/music/most-played/50/songs.json"},
 {source:"hnhh",name:"HotNewHipHop",href:"https://www.hotnewhiphop.com/top100"},
 {source:"pitchfork_bnm",name:"Pitchfork",href:"https://pitchfork.com/reviews/best/tracks/"},
 {source:"billboard",name:"Billboard Hot 100",href:"https://www.billboard.com/charts/hot-100/"},
] as const;
export type SourceHealth = {
 source:string; updated:string; status:"current"|"delayed"|"unavailable";
 matched:number; total:number;
};
export function parseSourceHealth(value:unknown):SourceHealth[]{
 const rows=Array.isArray(value)?value:[];
 return discoverySources.map(({source})=>{
  const row=rows.find(row=>row && typeof row==="object" && row.source===source);
  const validDate=typeof row?.updated==="string" && /^\d{4}-\d{2}-\d{2}$/.test(row.updated) && Number.isFinite(Date.parse(row.updated)) && new Date(row.updated).toISOString().slice(0,10)===row.updated;
  const status=validDate && (row?.status==="current" || row?.status==="delayed")?row.status:"unavailable";
  return {source,updated:validDate?row.updated:"",status,matched:Number.isSafeInteger(row?.matched)&&row.matched>=0?row.matched:0,total:Number.isSafeInteger(row?.total)&&row.total>=0?row.total:0};
 });
}
export function sourceSummary(sources:SourceHealth[]):string{
 const current=sources.filter(source=>source.status==="current").length;
 return current?`${current} of ${sources.length} sources checked today`:"Source updates are delayed";
}
