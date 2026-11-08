export type DiscoveryTrack = {
  source_id: string;
  name: string;
  artist: string;
  image: string;
  reason?: string;
  members?: number;
};
export type DiscoveryPost = {
  authorId: string | null;
  createdAt: Date;
  track: {
    source: string;
    sourceId: string;
    title: string;
    artist: string;
    image: string;
  };
};
const day = 86400000;
const artistKey = (name: string) =>
  name.trim().toLowerCase().replace(/\s+/g, " ");
const validTrack = (track: DiscoveryTrack) =>
  /^[a-zA-Z0-9]{22}$/.test(track.source_id) &&
  !!track.name.trim() &&
  !!track.artist.trim();
const asTrack = (post: DiscoveryPost): DiscoveryTrack => ({
  source_id: post.track.sourceId,
  name: post.track.title,
  artist: post.track.artist,
  image: post.track.image,
});
const validPost = (post: DiscoveryPost, now: number) =>
  !!post.authorId &&
  post.track.source === "SPOTIFY" &&
  Number.isFinite(post.createdAt.getTime()) &&
  post.createdAt.getTime() <= now &&
  validTrack(asTrack(post));
type Candidate = {
  track: DiscoveryTrack;
  score: number;
  latest: number;
  members: Map<string, number>;
};

function community(posts: DiscoveryPost[], now: number) {
  const candidates = new Map<string, Candidate>();
  for (const post of posts) {
    if (!validPost(post, now)) continue;
    const track = asTrack(post),
      time = post.createdAt.getTime();
    let candidate = candidates.get(track.source_id);
    if (!candidate) {
      candidate = { track, score: 0, latest: time, members: new Map() };
      candidates.set(track.source_id, candidate);
    }
    candidate.latest = Math.max(candidate.latest, time);
    candidate.members.set(
      post.authorId!,
      Math.max(candidate.members.get(post.authorId!) ?? 0, time),
    );
  }
  for (const candidate of Array.from(candidates.values())) {
    candidate.score = Array.from(candidate.members.values()).reduce(
      (sum, time) => sum + 2 ** (-(now - time) / (14 * day)),
      0,
    );
    candidate.track.members = candidate.members.size;
    candidate.track.reason = `${candidate.members.size} ${candidate.members.size === 1 ? "member" : "members"} posted`;
  }
  return candidates;
}

function compare(a: Candidate, b: Candidate) {
  return (
    b.score - a.score ||
    b.latest - a.latest ||
    a.track.source_id.localeCompare(b.track.source_id)
  );
}

function selectDiverse(ranked: Candidate[], explore: Candidate[] = []) {
  const selected: DiscoveryTrack[] = [],
    seen = new Set<string>(),
    artists = new Map<string, number>();
  const available = (c: Candidate) =>
    !seen.has(c.track.source_id) &&
    (artists.get(artistKey(c.track.artist)) ?? 0) < 2;
  while (selected.length < 60) {
    const pick =
      (selected.length % 4 === 3 ? explore.find(available) : undefined) ??
      ranked.find(available);
    if (!pick) break;
    selected.push(pick.track);
    seen.add(pick.track.source_id);
    const artist = artistKey(pick.track.artist);
    artists.set(artist, (artists.get(artist) ?? 0) + 1);
  }
  return selected;
}

export function rankRoom(
  posts: DiscoveryPost[],
  now: number,
): DiscoveryTrack[] {
  return selectDiverse(
    Array.from(community(posts, now).values()).sort(compare),
  );
}
export function rankForYou(
  posts: DiscoveryPost[],
  own: DiscoveryPost[],
  worldwide: DiscoveryTrack[],
  now: number,
) {
  const history = own.filter((p) => validPost(p, now));
  const seen = new Set(history.map((p) => p.track.sourceId));
  const taste = new Map<string, number>();
  for (const post of history) {
    const artist = artistKey(post.track.artist);
    // A repeated track cannot overwhelm taste; old artists still give a starting signal.
    taste.set(
      artist,
      Math.max(
        taste.get(artist) ?? 0,
        Math.max(0.1, 2 ** (-(now - post.createdAt.getTime()) / (60 * day))),
      ),
    );
  }
  const memberArtists = new Map<string, Set<string>>();
  for (const post of posts) {
    if (!validPost(post, now) || post.authorId === history[0]?.authorId)
      continue;
    const artists = memberArtists.get(post.authorId!) ?? new Set<string>();
    artists.add(artistKey(post.track.artist));
    memberArtists.set(post.authorId!, artists);
  }
  const similarity = new Map<string, number>();
  for (const [member, artists] of Array.from(memberArtists)) {
    const shared = Array.from(artists).filter((artist) =>
      taste.has(artist),
    ).length;
    similarity.set(
      member,
      shared / Math.max(1, taste.size + artists.size - shared),
    );
  }
  const candidates = community(posts, now);
  const maxCommunity = Math.max(
    1,
    ...Array.from(candidates.values()).map((c) => c.score),
  );
  const worldIDs = new Set<string>();
  for (const track of worldwide) {
    if (!validTrack(track)) continue;
    worldIDs.add(track.source_id);
    if (!candidates.has(track.source_id)) {
      candidates.set(track.source_id, {
        track: {
          source_id: track.source_id,
          name: track.name,
          artist: track.artist,
          image: track.image,
          reason: "Worldwide pick",
        },
        score: 0,
        latest: 0,
        members: new Map(),
      });
    }
  }
  for (const [id, candidate] of Array.from(candidates)) {
    if (seen.has(id)) {
      candidates.delete(id);
      continue;
    }
    const affinity = taste.get(artistKey(candidate.track.artist)) ?? 0;
    const neighbors = Math.max(
      0,
      ...Array.from(candidate.members.keys()).map(
        (member) => similarity.get(member) ?? 0,
      ),
    );
    candidate.score =
      candidate.score / maxCommunity +
      affinity * 4 +
      neighbors * 3 +
      (worldIDs.has(id) ? 0.15 : 0);
    if (affinity)
      candidate.track.reason = `Because you post ${candidate.track.artist}`;
    else if (neighbors) candidate.track.reason = "Shared taste in the room";
  }
  const ranked = Array.from(candidates.values()).sort(compare);
  const explore = worldwide
    .map((track) => candidates.get(track.source_id))
    .filter(
      (c): c is Candidate => !!c && !taste.has(artistKey(c.track.artist)),
    );
  return {
    tracks: selectDiverse(ranked, explore),
    hasTaste: history.length > 0,
  };
}
