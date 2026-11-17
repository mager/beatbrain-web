import assert from "node:assert/strict";
import test from "node:test";
import { auth } from "../lib/auth";
import handler from "../pages/api/creator";

const mbid = "149f91ef-1287-46da-9a8e-87fee02f1471";
const creator = { id: mbid, name: "Test artist", type: "Person", genres: [], links: [], credits: [] };
const request = (query: unknown = { mbid }, method = "GET") => ({ method, headers: {}, query }) as any;
function response() {
  return {
    code: 200, body: undefined as any, headers: {} as Record<string, unknown>,
    setHeader(name: string, value: unknown) { this.headers[name] = value; return this; },
    status(code: number) { this.code = code; return this; },
    json(body: unknown) { this.body = body; return this; },
  } as any;
}

test("creator API protects access and ends failed requests with stable JSON", async (t) => {
  const session = auth.api.getSession;
  const fetcher = global.fetch;
  t.after(() => { auth.api.getSession = session; global.fetch = fetcher; });
  let actor: any = { user: { id: "member" } };
  auth.api.getSession = (async () => actor) as any;

  await t.test("guests cannot fetch creator data", async () => {
    actor = null;
    let calls = 0;
    global.fetch = async () => { calls++; return Response.json({ creator }); };
    const res = response();
    await handler(request(), res);
    assert.equal(res.code, 401);
    assert.ok(res.body.error);
    assert.equal(calls, 0);
    assert.match(res.headers["Cache-Control"], /private.*no-store/);
    actor = { user: { id: "member" } };
  });

  await t.test("invalid methods and artist IDs never reach the service", async () => {
    let calls = 0;
    global.fetch = async () => { calls++; return Response.json({ creator }); };
    const post = response();
    await handler(request({ mbid }, "POST"), post);
    assert.equal(post.code, 405);
    assert.equal(post.headers.Allow, "GET");
    for (const query of [{}, { mbid: [mbid, mbid] }, { mbid: "invalid&other=value" }]) {
      const res = response();
      await handler(request(query), res);
      assert.equal(res.code, 400);
      assert.ok(res.body.error);
    }
    assert.equal(calls, 0);
  });

  for (const status of [500, 503, 429]) {
    await t.test(`service status ${status} is a retryable error, not empty success`, async () => {
      global.fetch = async () => Response.json({ error: "private upstream detail" }, { status });
      const res = response();
      await handler(request(), res);
      assert.equal(res.code, 502);
      assert.equal(typeof res.body.error, "string");
      assert.doesNotMatch(res.body.error, /private upstream detail/);
      assert.match(res.headers["Cache-Control"], /private.*no-store/);
    });
  }

  await t.test("missing artists remain distinct from service failures", async () => {
    global.fetch = async () => Response.json({ error: "not found" }, { status: 404 });
    const res = response();
    await handler(request(), res);
    assert.equal(res.code, 404);
    assert.ok(res.body.error);
  });

  await t.test("network failures are returned as JSON", async () => {
    global.fetch = async () => { throw new TypeError("fetch failed: sensitive service details"); };
    const res = response();
    await handler(request(), res);
    assert.equal(res.code, 502);
    assert.equal(typeof res.body.error, "string");
    assert.doesNotMatch(res.body.error, /sensitive/);
  });

  await t.test("invalid service bodies cannot be returned as success", async () => {
    for (const body of ["not JSON", "null", "{}", '{"creator":null}', '{"creator":{}}']) {
      global.fetch = async () => new Response(body);
      const res = response();
      await handler(request(), res);
      assert.equal(res.code, 502);
      assert.equal(typeof res.body.error, "string");
    }
  });

  await t.test("slow service requests abort within the route deadline", { timeout: 10000 }, async () => {
    // The pending fetch exits only when the route aborts it.
    global.fetch = async (_url, init) => new Promise<Response>((_resolve, reject) => {
      assert.ok(init?.signal);
      init.signal.addEventListener("abort", () => reject(init.signal.reason), { once: true });
    });
    const res = response();
    const started = Date.now();
    const keepAlive = setTimeout(() => {}, 9500);
    try { await handler(request(), res); }
    finally { clearTimeout(keepAlive); }
    assert.equal(res.code, 504);
    assert.ok(Date.now() - started < 9500);
    assert.ok(res.body.error);
  });

  await t.test("valid creator data is returned without a public cache", async () => {
    global.fetch = async (url, init) => {
      assert.equal(new URL(String(url)).searchParams.get("mbid"), mbid);
      assert.equal(init?.cache, "no-store");
      return Response.json({ creator });
    };
    const res = response();
    await handler(request(), res);
    assert.equal(res.code, 200);
    assert.deepEqual(res.body, creator);
    assert.match(res.headers["Cache-Control"], /private.*no-store/);
  });
});
