import { test } from "node:test";
import assert from "node:assert/strict";
import { parseSourceHealth, sourceSummary } from "../lib/discovery-health";

test("source health keeps old dates and rejects unknown sources", () => {
 const sources = parseSourceHealth([
  {source:"apple_music_charts",updated:"2026-11-10",status:"delayed",matched:39,total:50},
  {source:"spotify_new_releases",updated:"2026-11-13",status:"current",matched:74,total:74},
  {source:"unknown",updated:"2026-11-13",status:"current"},
 ]);
 assert.equal(sources.length,5);
 assert.equal(sources.find(s=>s.source==="apple_music_charts")?.updated,"2026-11-10");
 assert.equal(sourceSummary(sources),"1 of 5 sources checked today");
 assert.equal(sources.find(s=>s.source==="billboard")?.status,"unavailable");
});

test("invalid status and dates cannot look current",()=>{
 const sources=parseSourceHealth([{source:"billboard",updated:"invalid",status:"current"}]);
 assert.equal(sources.find(s=>s.source==="billboard")?.status,"unavailable");
 assert.equal(sourceSummary(sources),"Source updates are delayed");
});
