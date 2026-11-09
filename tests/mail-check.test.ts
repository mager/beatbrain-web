import assert from 'node:assert/strict';
import test from 'node:test';
import { auth } from '../lib/auth';
import handler from '../pages/api/admin/mail-check';

function response() { return { code: 200, body: undefined as any, headers: {} as any, setHeader(k: string, v: unknown) { this.headers[k] = v; }, status(n: number) { this.code = n; return this; }, json(value: unknown) { this.body = value; return this; } } as any; }

test('mail setup check is owner-only and always uses sandbox without client message data', async (t) => {
  const originalSession = auth.api.getSession, originalFetch = global.fetch;
  const env = { ...process.env };
  t.after(() => { auth.api.getSession = originalSession; global.fetch = originalFetch; for (const key of ['MAILJET_API_KEY', 'MAILJET_API_SECRET', 'MAILJET_FROM_EMAIL', 'MAILJET_FROM_NAME', 'BETTER_AUTH_URL']) { if (env[key] === undefined) delete process.env[key]; else process.env[key] = env[key]; } });
  process.env.MAILJET_API_KEY = 'check-key'; process.env.MAILJET_API_SECRET = 'check-secret'; process.env.MAILJET_FROM_EMAIL = 'hello@beatbrain.xyz'; process.env.MAILJET_FROM_NAME = 'Beatbrain'; process.env.BETTER_AUTH_URL = 'https://beatbrain.xyz';
  let session: any = { user: { id: '4' } }, calls = 0;
  auth.api.getSession = (async (args: any) => { assert.equal(args.query.disableCookieCache, true); return session; }) as any;
  const request = (overrides = {}) => ({ method: 'POST', headers: { origin: 'https://beatbrain.xyz' }, body: { email: 'attacker@example.com', subject: 'Injected', body: 'Injected', SandboxMode: false }, ...overrides } as any);
  global.fetch = async (_url, init) => {
    calls++;
    const data = JSON.parse(init.body as string);
    assert.equal(data.SandboxMode, true);
    assert.deepEqual(data.Messages[0].To, [{ Email: 'hello@beatbrain.xyz' }]);
    assert.equal(data.Messages[0].Subject, 'Beatbrain email setup check');
    assert.equal(data.Messages[0].TextPart, 'This request validates the Beatbrain sender settings. No email is sent.');
    assert.equal(data.Messages[0].TrackClicks, 'disabled');
    assert.equal(data.Messages[0].TrackOpens, 'disabled');
    assert.ok(init.signal);
    return new Response(JSON.stringify({ Messages: [{ Status: 'success', To: [{ Email: 'hello@beatbrain.xyz' }] }] }));
  };
  for (const [actor, origin, status] of [[null, 'https://beatbrain.xyz', 401], [{ user: { id: '8', username: 'mager' } }, 'https://beatbrain.xyz', 403], [{ user: { id: '4' } }, undefined, 403], [{ user: { id: '4' } }, 'https://evil.test', 403]] as const) {
    session = actor; const res = response(); await handler(request({ headers: { origin } }), res); assert.equal(res.code, status); assert.equal(calls, 0); assert.equal(res.headers['Cache-Control'], 'private, no-store, max-age=0');
  }
  session = { user: { id: '4' } };
  const wrongMethod = response(); await handler(request({ method: 'GET' }), wrongMethod); assert.equal(wrongMethod.code, 405); assert.equal(calls, 0);
  const accepted = response(); await handler(request(), accepted); assert.equal(accepted.code, 200); assert.deepEqual(accepted.body, { ok: true, message: 'Mailjet accepted the sender settings. No email was sent.' }); assert.equal(calls, 1);
  for (const providerStatus of [400, 500]) {
    global.fetch = async () => { calls++; return new Response('{}', { status: providerStatus }); };
    const res = response(); await handler(request(), res); assert.equal(res.code, 502); assert.equal(res.body.ok, false); assert.equal(JSON.stringify(res.body).includes('check-secret'), false);
  }
  global.fetch = async () => { calls++; throw new Error('check-secret'); };
  const unknown = response(); await handler(request(), unknown); assert.equal(unknown.code, 502); assert.equal(JSON.stringify(unknown.body).includes('check-secret'), false);
  delete process.env.MAILJET_API_SECRET;
  const before = calls, unavailable = response(); await handler(request(), unavailable); assert.equal(unavailable.code, 503); assert.equal(calls, before);
});
