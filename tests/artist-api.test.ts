import assert from "node:assert/strict";
import test from "node:test";
import { EventEmitter } from "node:events";
import { auth } from "../lib/auth";
import handler from "../pages/api/artist";
import { parseArtistPayload } from "../lib/artist";

const id = "2RdwBSPQiwcmiDo9kixcl8";
const payload = () => ({
  artist: { id, name: "Pharrell Williams", image: null, url: `https://open.spotify.com/artist/${id}`, genres: [] },
  tracks: [{ id: "60nZcImufyMA1MKQY3dcCH", name: "Happy", artist: "Pharrell Williams", thumb: null, album_id: "0lrmy4pJINsFzycJvttX2W", album_name: "G I R L", release_date: "2014-03-03" }],
  albums: [], next_offset: null, next_cursor: "1.0", next_release_offset: 24,
  release_total: 770, scanned_releases: 1, unavailable: [],
});
function response() { return Object.assign(new EventEmitter(), { code: 200, body: undefined as any, headers: {} as any,
  setHeader(k: string, v: unknown) { this.headers[k] = v; return this; },
  status(n: number) { this.code = n; return this; }, json(v: unknown) { this.body = v; return this; } }) as any; }
const request = (query: unknown = { spotifyId: id }, method = "GET") => Object.assign(new EventEmitter(), { method, headers: {}, query }) as any;

test("artist data rejects wrong identities and unsafe links", () => {
  assert.equal(parseArtistPayload({ ...payload(), artist: { ...payload().artist, id: "0KuF7reCTOZwV7YJnHQqgr" } }, id), null);
  assert.equal(parseArtistPayload({ ...payload(), next_cursor: "0.0" }, id), null);
  assert.equal(parseArtistPayload({ ...payload(), next_cursor: "1000001.0" }, id), null);
  const data = payload();
  data.artist.url = "javascript:alert(1)";
  data.artist.image = "https://untrusted.example/image" as any;
  const safe = parseArtistPayload(data, id)!;
  assert.equal(safe.artist.url, `https://open.spotify.com/artist/${id}`);
  assert.equal(safe.artist.image, null);
  assert.equal(parseArtistPayload({ ...payload(), unavailable: ["tracks"], tracks: [] }, id)?.unavailable[0], "tracks");
});

test("catalog pages preserve full batches, release groups, and safe continuation", () => {
  const data = payload();
  data.tracks = Array.from({length:24}, (_, i) => ({...data.tracks[0], id:String(i).padStart(22,"0")}));
  data.albums = [{id:"0lrmy4pJINsFzycJvttX2W",name:"G I R L",image:null,url:"javascript:bad",album_type:"album",album_group:"appears_on",release_date:"2014"}] as any;
  const parsed = parseArtistPayload(data,id)!;
  assert.equal(parsed.tracks.length,24); assert.equal(parsed.albums[0].album_group,"appears_on");
  assert.equal(parsed.albums[0].url,"https://open.spotify.com/album/0lrmy4pJINsFzycJvttX2W");
  assert.equal(parsed.release_total,770);
  for (const next_cursor of ["7.49","7.50","6.99","07.51","7.51.extra","-1.0"])
    assert.equal(parseArtistPayload({...data,next_cursor},id,{section:"songs",cursor:"7.50"}),null);
  assert.ok(parseArtistPayload({...data,next_cursor:"7.74"},id,{section:"songs",cursor:"7.50"}));
  assert.ok(parseArtistPayload({...data,next_cursor:"7.50",unavailable:["tracks"]},id,{section:"songs",cursor:"7.50"}));
  assert.equal(parseArtistPayload({...data,next_release_offset:24},id,{section:"releases",offset:24}),null);
  assert.ok(parseArtistPayload({...data,next_release_offset:48},id,{section:"releases",offset:24}));
  assert.ok(parseArtistPayload({...data,tracks:[],albums:[],next_cursor:null,next_release_offset:24,release_total:0,scanned_releases:0,unavailable:["albums"]},id,{section:"releases",offset:24}),"a source failure retains its retry offset when the total is unknown");
  assert.equal(parseArtistPayload({...data,scanned_releases:771},id),null);
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
  for (const query of [{}, { spotifyId: [id] }, { spotifyId: "bad" }, { spotifyId: id, offset: "-1" }, { spotifyId: id, offset: "1000001" }, { spotifyId: id, offset: "1.5" }, {spotifyId:id,section:"unknown"}, {spotifyId:id,section:"songs",cursor:["1.0","2.0"]}, {spotifyId:id,section:"songs",cursor:"1.-1"}, {spotifyId:id,offset:"24"}, {spotifyId:id,section:"releases",cursor:"1.0"}]) {
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
  for (const query of [{spotifyId:id,section:"songs",cursor:"7.50"},{spotifyId:id,section:"releases",offset:"1000"}]) {
    global.fetch = async url => {
      const params = new URL(String(url)).searchParams;
      assert.equal(params.get("section"),query.section);
      if(query.cursor) assert.equal(params.get("cursor"),query.cursor);
      if(query.offset) assert.equal(params.get("offset"),query.offset);
      return Response.json({...payload(),next_cursor:"7.74",next_release_offset:1024,release_total:1500});
    };
    const res=response(); await handler(request(query),res); assert.equal(res.code,200);
  }
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
      return new Promise<Response>((_resolve, reject) => signal.addEventListener("abort", () => reject(signal.reason), { once: true }));
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
