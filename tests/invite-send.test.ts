import assert from 'node:assert/strict';
import test from 'node:test';
import { auth } from '../lib/auth';
import prisma from '../lib/prisma';
import { hashInviteToken } from '../lib/invites';
import handler, { config } from '../pages/api/invites/[id]/send';

const token = 'A'.repeat(43);
const url = 'https://beatbrain.xyz/auth/signin?invite=' + token + '&email=friend%40example.com';
function request(overrides = {}) { return { method: 'POST', headers: { origin: 'https://beatbrain.xyz' }, query: { id: 'invite-1' }, body: { token, subject: 'Join Beatbrain', body: 'Welcome\n' + url }, ...overrides } as any; }
function response() { return { statusCode: 200, body: undefined as any, headers: {} as any, setHeader(k: string, v: unknown) { this.headers[k] = v; }, status(n: number) { this.statusCode = n; return this; }, json(body: unknown) { this.body = body; return this; } } as any; }

test('invite email API validates owner, token and race-safe delivery', async (t) => {
  const getSession = auth.api.getSession, find = prisma.invite.findUnique, update = prisma.invite.updateMany, originalFetch = global.fetch;
  const env = { ...process.env };
  t.after(() => { auth.api.getSession = getSession; prisma.invite.findUnique = find; prisma.invite.updateMany = update; global.fetch = originalFetch; for (const key of ['MAILJET_API_KEY', 'MAILJET_API_SECRET', 'MAILJET_FROM_EMAIL', 'MAILJET_FROM_NAME', 'BETTER_AUTH_URL']) { if (env[key] === undefined) delete process.env[key]; else process.env[key] = env[key]; } });
  let row: any, actor: any, calls: number, finishFail: boolean, result: () => Promise<Response>;
  function reset() {
    row = { id: 'invite-1', email: 'friend@example.com', tokenHash: hashInviteToken(token), usedAt: null, expiresAt: new Date(Date.now() + 60000), emailStatus: 'UNSENT', emailSentAt: null, emailAttemptedAt: null, emailMessageId: null };
    actor = { user: { id: '4' } }; calls = 0; finishFail = false;
    process.env.MAILJET_API_KEY = 'test-key'; process.env.MAILJET_API_SECRET = 'test-secret'; process.env.MAILJET_FROM_EMAIL = 'owner@example.com'; process.env.BETTER_AUTH_URL = 'https://beatbrain.xyz';
    result = async () => new Response(JSON.stringify({ Messages: [{ Status: 'success', To: [{ Email: row.email, MessageUUID: 'message-1' }] }] }));
  }
  auth.api.getSession = (async (args: any) => { assert.equal(args.query.disableCookieCache, true); return actor; }) as any;
  prisma.invite.findUnique = (async () => row ? { ...row } : null) as any;
  prisma.invite.updateMany = (async ({ where, data }: any) => {
    if (finishFail && data.emailStatus !== 'SENDING') throw new Error('database write unavailable');
    if (!row || where.id !== row.id || (where.emailStatus?.in && !where.emailStatus.in.includes(row.emailStatus)) || (typeof where.emailStatus === 'string' && where.emailStatus !== row.emailStatus) || (where.usedAt === null && row.usedAt !== null) || (where.expiresAt && row.expiresAt <= where.expiresAt.gt)) return { count: 0 };
    Object.assign(row, data); return { count: 1 };
  }) as any;
  global.fetch = async () => { calls++; return result(); };

  await t.test('guest and other member cannot see or send owner mail', async () => {
    for (const method of ['GET', 'POST']) for (const [session, status] of [[null, 401], [{ user: { id: '8', username: 'mager' } }, 403]] as const) {
      reset(); actor = session; const res = response(); await handler(request({ method }), res); assert.equal(res.statusCode, status); assert.equal(calls, 0); assert.equal(res.headers['Cache-Control'], 'private, no-store, max-age=0');
    }
  });
  await t.test('origin, token, expiry, used invite and payload guards stop sends', async () => {
    const cases: [() => void, any, number][] = [
      [() => {}, { headers: {} }, 403], [() => {}, { body: { token: 'B'.repeat(43), subject: 'Join', body: url } }, 400],
      [() => { row.expiresAt = new Date(0); }, {}, 409], [() => { row.usedAt = new Date(); }, {}, 409],
      [() => {}, { body: { token, subject: 'Join', body: 'https://evil.test' } }, 400],
      [() => {}, { body: { token, subject: 'Join', body: url, to: 'other@example.com' } }, 400],
    ];
    for (const [change, req, status] of cases) { reset(); change(); const res = response(); await handler(request(req), res); assert.equal(res.statusCode, status); assert.equal(calls, 0); assert.equal(row.emailStatus, 'UNSENT'); }
    assert.equal(config.api.bodyParser.sizeLimit, '16kb');
  });
  await t.test('missing configuration does not claim the invite', async () => { reset(); delete process.env.MAILJET_API_SECRET; const res = response(); await handler(request(), res); assert.equal(res.statusCode, 503); assert.equal(row.emailStatus, 'UNSENT'); assert.equal(calls, 0); });
  await t.test('concurrent and repeated sends make one provider call', async () => {
    reset(); const responses = [response(), response()]; await Promise.all(responses.map(res => handler(request(), res))); assert.equal(calls, 1); assert.equal(row.emailStatus, 'SENT'); assert.ok(row.emailSentAt); assert.equal(row.emailMessageId, 'message-1');
    const repeat = response(); await handler(request(), repeat); assert.equal(repeat.statusCode, 200); assert.equal(repeat.body.invite.emailStatus, 'SENT'); assert.equal(calls, 1);
  });
  await t.test('provider rejection permits retry but uncertain result blocks it', async () => {
    reset(); result = async () => new Response('{}', { status: 400 }); let res = response(); await handler(request(), res); assert.equal(row.emailStatus, 'FAILED'); await handler(request(), response()); assert.equal(calls, 2);
    reset(); result = async () => { throw new Error('timeout'); }; res = response(); await handler(request(), res); assert.equal(row.emailStatus, 'UNKNOWN'); await handler(request(), response()); assert.equal(calls, 1);
  });
  await t.test('SENDING survives a crash and accepted mail with failed DB write never resends', async () => {
    reset(); row.emailStatus = 'SENDING'; const pending = response(); await handler(request(), pending); assert.equal(pending.statusCode, 409); assert.equal(calls, 0);
    reset(); finishFail = true; const res = response(); await handler(request(), res); assert.equal(calls, 1); assert.equal(res.body.invite.emailStatus, 'UNKNOWN'); assert.equal(row.emailStatus, 'SENDING'); await handler(request(), response()); assert.equal(calls, 1);
  });
  await t.test('status only returns delivery fields and never the invite token hash', async () => {
    reset(); const res = response(); await handler(request({ method: 'GET' }), res); assert.equal(res.statusCode, 200); assert.equal(res.body.invite.emailStatus, 'UNSENT'); assert.equal(JSON.stringify(res.body).includes(row.tokenHash), false); assert.equal(calls, 0);
  });
});
