import assert from "node:assert/strict";
import test from "node:test";
import { adaptTrack } from "../lib/adapters/track";
import { trackSourceLinks } from "../lib/track-details";
test("track adapter preserves failed and completed metadata lookups", () => {
  for (const status of ["unavailable", "matched", "unmatched"]) {
    const track = adaptTrack({
      track: { name: "Yoda", artist: "Tech N9ne", metadata_status: status },
    } as any);
    assert.equal((track as any).metadata_status, status);
  }
  assert.equal(
    (adaptTrack({ track: { name: "Legacy" } } as any) as any).metadata_status,
    null,
  );
});
test("reviewed credits retain a clear source link", () => {
  const links = trackSourceLinks({
    links: [
      {
        type: "apple_music",
        url: "https://music.apple.com/us/song/yoda/1813191831",
      },
    ],
  });
  assert.equal(links[0].label, "Apple Music credits");
});
test("catalog metadata survives the frontend boundary", () => {
  const input = {
    name: "Save My Love",
    artist: "Kygo",
    artists: [
      { id: "a", name: "Kygo", url: "https://open.spotify.com/artist/a" },
      { id: "b", name: "Khalid", url: "https://open.spotify.com/artist/b" },
    ],
    explicit: true,
    track_number: 2,
    disc_number: 1,
    credits_status: "available",
    album: {
      name: "Save My Love",
      label: "Label",
      total_tracks: 3,
      copyrights: ["2026 Label"],
    },
  };
  const actual = adaptTrack({ track: input } as any);
  for (const field of [
    "artists",
    "explicit",
    "track_number",
    "disc_number",
    "credits_status",
    "album",
  ])
    assert.deepEqual((actual as any)[field], (input as any)[field]);
});
