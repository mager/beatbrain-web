import assert from "node:assert/strict";
import test from "node:test";
import {
  trackFacts,
  formatReleaseDate,
  trackSourceLinks,
} from "../lib/track-details";
test("basic duration never becomes an invented musical key", () => {
  assert.deepEqual(
    trackFacts({
      duration_ms: 211000,
      key: -1,
      mode: -1,
      tempo: 0,
      time_signature: 0,
    }),
    [{ label: "Length", value: "3:31" }],
  );
  assert.deepEqual(trackFacts(null), []);
});
test("real music facts retain zero key and reject invalid values", () => {
  assert.deepEqual(
    trackFacts({
      duration_ms: 60000,
      key: 0,
      mode: 1,
      tempo: 123.4,
      time_signature: 4,
    }),
    [
      { label: "Length", value: "1:00" },
      { label: "Key", value: "C major" },
      { label: "Tempo", value: "123 BPM" },
      { label: "Time", value: "4/4" },
    ],
  );
  assert.deepEqual(
    trackFacts({
      duration_ms: NaN,
      key: 20,
      mode: 0,
      tempo: -1,
      time_signature: 0,
    }),
    [],
  );
});
test("release dates preserve source precision", () => {
  assert.equal(formatReleaseDate("1997"), "1997");
  assert.equal(formatReleaseDate("1997-06"), "June 1997");
  assert.equal(formatReleaseDate("1997-06-16"), "June 16, 1997");
  assert.equal(formatReleaseDate("garbage"), "");
});
test("source links reject unsafe URLs and preserve valid references", () => {
  const links = trackSourceLinks({
    id: "b40bca50-273f-488f-811c-a37857916c3f",
    links: [
      { type: "bad", url: "javascript:alert(1)" },
      { type: "genius", url: "https://genius.com/example" },
      { type: "spotify", url: "https://open.spotify.com/track/x" },
    ],
  });
  assert.deepEqual(
    links.map((l) => l.label),
    ["MusicBrainz", "Genius"],
  );
  assert.ok(links.every((l) => l.url.startsWith("https://")));
});
