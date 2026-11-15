import assert from "node:assert/strict";
import test from "node:test";
import { EventEmitter } from "node:events";
import { auth } from "../lib/auth";
import handler from "../pages/api/artist";
import { parseArtistPayload } from "../lib/artist";

const id = "2RdwBSPQiwcmiDo9kixcl8";
const payload = () => ({
  artist: { id, name: "Pharrell Williams", image: null, url: `https://open.spotify.com/artist/${id}`, genres: [] },
  tracks: [{ id: "60nZcImufyMA1MKQY3dcCH", name: "Happy", artist: "Pharrell Williams", thumb: null }],
  albums: [], next_offset: 10, unavailable: [],
});
function response() { return Object.assign(new EventEmitter(), { code: 200, body: undefined as any, headers: {} as any,
  setHeader(k: string, v: unknown) { this.headers[k] = v; return this; },
  status(n: number) { this.code = n; return this; }, json(v: unknown) { this.body = v; return this; } }) as any; }
const request = (query: unknown = { spotifyId: id }, method = "GET") => Object.assign(new EventEmitter(), { method, headers: {}, query }) as any;

test("artist data rejects wrong identities and unsafe links", () => {
  assert.equal(parseArtistPayload({ ...payload(), artist: { ...payload().artist, id: "0KuF7reCTOZwV7YJnHQqgr" } }, id), null);
  assert.equal(parseArtistPayload({ ...payload(), next_offset: 0 }, id), null);
  assert.equal(parseArtistPayload({ ...payload(), next_offset: 1000 }, id), null);
  const data = payload();
  data.artist.url = "javascript:alert(1)";
  data.artist.image = "https://untrusted.example/image" as any;
  const safe = parseArtistPayload(data, id)!;
  assert.equal(safe.artist.url, `https://open.spotify.com/artist/${id}`);
  assert.equal(safe.artist.image, null);
  assert.equal(parseArtistPayload({ ...payload(), unavailable: ["tracks"], tracks: [] }, id)?.unavailable[0], "tracks");
});

test("artist API requires membership and returns stable errors", async t => {
  const session = auth.api.getSession, fetcher = global.fetch;
  t.after(() => { auth.api.getSession = session; global.fetch = fetcher; });
  let actor: any = null, calls = 0;
  auth.api.getSession = (async () => actor) as any;
  global.fetch = async () => { calls++; return Response.json(payload()); };
  const guest = response(); await handler(request(), guest);
  assert.equal(guest.code, 401); assert.equal(calls, 0); assert.match(guest.headers["Cache-Control"], /private.*no-store/);
  actor = { user: { id: "member" } };
  for (const query of [{}, { spotifyId: [id] }, { spotifyId: "bad" }, { spotifyId: id, offset: "-1" }, { spotifyId: id, offset: "1000" }, { spotifyId: id, offset: "1.5" }]) {
    const res = response(); await handler(request(query), res); assert.equal(res.code, 400);
  }
  const post = response(); await handler(request({ spotifyId: id }, "POST"), post); assert.equal(post.code, 405);
  assert.equal(calls, 0);
  global.fetch = async (url, init) => {
    assert.equal(new URL(String(url)).pathname, "/artist");
    assert.equal(new URL(String(url)).searchParams.get("spotifyId"), id);
    assert.equal(init?.cache, "no-store"); assert.ok(init?.signal);
    return Response.json(payload());
  };
  const ok = response(); await handler(request(), ok); assert.equal(ok.code, 200); assert.deepEqual(ok.body, payload());
  for (const status of [429, 500, 503]) {
    global.fetch = async () => Response.json({ error: "secret upstream detail" }, { status });
    const res = response(); await handler(request(), res); assert.equal(res.code, 502); assert.doesNotMatch(res.body.error, /secret/);
  }
  global.fetch = async () => Response.json({}, { status: 404 });
  const missing = response(); await handler(request(), missing); assert.equal(missing.code, 404);
  global.fetch = async () => Response.json({ ...payload(), artist: { ...payload().artist, id: "0KuF7reCTOZwV7YJnHQqgr" } });
  const wrong = response(); await handler(request(), wrong); assert.equal(wrong.code, 502);
  global.fetch = async () => { throw Error("network failed"); };
  const failed = response(); await handler(request(), failed); assert.equal(failed.code, 502);
  for (const event of ["aborted", "close"]) {
    const req = request(), res = response(); let signal: AbortSignal;
    global.fetch = async (_url, init) => {
      signal = init!.signal!;
      return new Promise((_resolve, reject) => signal.addEventListener("abort", () => reject(signal.reason), { once: true }));
    };
    const pending = handler(req, res);
    await new Promise(resolve => setImmediate(resolve));
    (event === "aborted" ? req : res).emit(event);
    assert.equal(signal!.aborted, true, `${event} must cancel the backend request`);
    await pending;
    assert.equal(res.body, undefined, "A disconnected client does not receive an error write");
    assert.equal(req.listenerCount("aborted"), 0); assert.equal(res.listenerCount("close"), 0);
  }
});
