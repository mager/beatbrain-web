import { test } from "node:test";
import assert from "node:assert/strict";
import { rankRoom, rankForYou, type DiscoveryPost } from "../lib/discovery";

const now = Date.UTC(2026, 10, 8);
const id = (n: number) => String(n).padStart(22, "0");
function post(
  n: number,
  authorId = "a",
  days = 0,
  artist = `Artist ${n}`,
): DiscoveryPost {
  return {
    authorId,
    createdAt: new Date(now - days * 86400000),
    track: {
      source: "SPOTIFY",
      sourceId: id(n),
      title: `Track ${n}`,
      artist,
      image: "",
    },
  };
}
const world = (n: number, artist = `Artist ${n}`) => ({
  source_id: id(n),
  name: `Track ${n}`,
  artist,
  image: "",
});

test("room counts members once per track, not repeated posts", () => {
  const posts = [
    ...Array.from({ length: 100 }, () => post(1)),
    post(2, "b"),
    post(2, "c"),
  ];
  const result = rankRoom(posts, now);
  assert.equal(result[0].source_id, id(2));
  assert.equal(result[0].members, 2);
  assert.equal(result[1].members, 1);
});
test("fresh posts rise and equal scores have stable order", () => {
  assert.deepEqual(
    rankRoom([post(1, "a", 60), post(2)], now).map((t) => t.source_id),
    [id(2), id(1)],
  );
  assert.deepEqual(
    rankRoom([post(2), post(1)], now),
    rankRoom([post(1), post(2)], now),
  );
});
test("room caps each artist after ranking, not before", () => {
  const result = rankRoom(
    [
      post(1, "a", 30, "Artist"),
      post(2, "a", 10, "Artist"),
      post(3, "a", 0, "Artist"),
      post(4),
    ],
    now,
  );
  assert.deepEqual(
    result.filter((t) => t.artist === "Artist").map((t) => t.source_id),
    [id(3), id(2)],
  );
});
test("invalid and unattributed legacy records cannot enter discovery", () => {
  const badID = post(1);
  badID.track.sourceId = "broken";
  const badDate = post(2);
  badDate.createdAt = new Date("invalid");
  const noAuthor = post(3);
  noAuthor.authorId = null;
  const otherSource = post(4);
  otherSource.track.source = "MIXCLOUD";
  const future = post(5);
  future.createdAt = new Date(now + 86400000);
  assert.deepEqual(
    rankRoom([badID, badDate, noAuthor, otherSource, future], now),
    [],
  );
});
test("personal artist taste ranks unseen tracks and removes posted tracks", () => {
  const own = [post(1, "me", 200, "Radiohead")];
  const result = rankForYou(
    [post(1, "me", 200, "Radiohead")],
    own,
    [world(2), world(3, "Radiohead"), world(1, "Radiohead")],
    now,
  );
  assert.equal(result.hasTaste, true);
  assert.equal(result.tracks[0].source_id, id(3));
  assert.match(result.tracks[0].reason, /Radiohead/);
  assert.ok(!result.tracks.some((t) => t.source_id === id(1)));
});
test("shared artists introduce tracks from members with similar taste", () => {
  const own = [post(1, "me", 0, "Radiohead")];
  const result = rankForYou(
    [
      post(1, "me", 0, "Radiohead"),
      post(1, "friend", 0, "Radiohead"),
      post(2, "friend"),
      post(3, "other"),
    ],
    own,
    [],
    now,
  );
  assert.equal(result.tracks[0].source_id, id(2));
  assert.equal(result.tracks[0].reason, "Shared taste in the room");
});
test("personal results leave room for worldwide exploration", () => {
  const own = [
    post(1, "me", 0, "A"),
    post(2, "me", 0, "B"),
    post(3, "me", 0, "C"),
  ];
  const result = rankForYou(
    [
      post(10, "friend", 0, "A"),
      post(11, "friend", 0, "B"),
      post(12, "friend", 0, "C"),
      post(13, "friend", 0, "C"),
    ],
    own,
    [world(20)],
    now,
  );
  assert.equal(result.tracks[3].source_id, id(20));
  assert.equal(
    new Set(result.tracks.map((t) => t.source_id)).size,
    result.tracks.length,
  );
});
test("new members and an empty room have honest usable fallbacks", () => {
  const result = rankForYou([], [], [world(1)], now);
  assert.equal(result.hasTaste, false);
  assert.equal(result.tracks[0].reason, "Worldwide pick");
  assert.deepEqual(rankRoom([], now), []);
  assert.deepEqual(rankForYou([], [], [], now), {
    tracks: [],
    hasTaste: false,
  });
});
