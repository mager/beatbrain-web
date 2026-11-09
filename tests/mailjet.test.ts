import assert from 'node:assert/strict';
import test from 'node:test';
import { getMailjetSettings, sendMailjetInvite, validateInviteEmailContent } from '../lib/mailjet';

const input = { inviteId: 'invite-1', email: 'friend@example.com', subject: 'Join Beatbrain', body: 'Hello friend' };
function configured() {
  process.env.MAILJET_API_KEY = 'test-key'; process.env.MAILJET_API_SECRET = 'test-secret';
  process.env.MAILJET_FROM_EMAIL = 'owner@example.com'; process.env.MAILJET_FROM_NAME = 'Beatbrain';
  process.env.BETTER_AUTH_URL = 'https://beatbrain.xyz';
}
function response(body: unknown, status = 200) { return new Response(JSON.stringify(body), { status }); }

test('Mailjet uses server sender, one recipient, Basic auth and no tracking', async () => {
  configured();
  const result = await sendMailjetInvite(input, { fetch: async (url, init) => {
    assert.equal(url, 'https://api.mailjet.com/v3.1/send');
    assert.equal(new Headers(init.headers).get('Authorization'), 'Basic ' + Buffer.from('test-key:test-secret').toString('base64'));
    assert.equal(init.redirect, 'error');
    const body = JSON.parse(init.body as string);
    assert.equal(body.SandboxMode, false);
    assert.deepEqual(body.Messages, [{ From: { Email: 'owner@example.com', Name: 'Beatbrain' }, To: [{ Email: input.email }], Subject: input.subject, TextPart: input.body, TrackOpens: 'disabled', TrackClicks: 'disabled', CustomID: 'beatbrain-invite-invite-1' }]);
    assert.ok(init.signal);
    return response({ Messages: [{ Status: 'success', To: [{ Email: input.email, MessageUUID: 'message-1', MessageID: 123 }] }] });
  }});
  assert.deepEqual(result, { status: 'SENT', messageId: 'message-1' });
});

test('Mailjet per-message rejection permits retry; uncertain results do not', async () => {
  configured();
  for (const [status, data, want] of [
    [200, { Messages: [{ Status: 'error', Errors: [{ StatusCode: 400 }] }] }, 'FAILED'],
    [401, {}, 'FAILED'], [429, {}, 'FAILED'], [408, {}, 'UNKNOWN'], [500, {}, 'UNKNOWN'],
    [200, { Messages: [{ Status: 'error', Errors: [{ StatusCode: 500 }] }] }, 'UNKNOWN'],
    [200, { Messages: [{ Status: 'success', To: [] }] }, 'UNKNOWN'],
    [200, { Messages: [{ Status: 'success', To: [{ Email: 'other@example.com', MessageID: 123 }] }] }, 'UNKNOWN'],
    [200, {}, 'UNKNOWN'],
  ] as const) {
    const result = await sendMailjetInvite(input, { fetch: async () => response(data, status) });
    assert.equal(result.status, want);
  }
  assert.equal((await sendMailjetInvite(input, { fetch: async () => { throw new Error('network'); } })).status, 'UNKNOWN');
  assert.equal((await sendMailjetInvite(input, { fetch: async () => new Response('not-json') })).status, 'UNKNOWN');
});

test('Sandbox validation never claims message delivery and missing config never fetches', async () => {
  configured();
  assert.equal((await sendMailjetInvite(input, { sandbox: true, fetch: async (_url, init) => {
    assert.equal(JSON.parse(init.body as string).SandboxMode, true);
    return response({ Messages: [{ Status: 'success', To: [{ Email: input.email }] }] });
  }})).status, 'VALIDATED');
  delete process.env.MAILJET_API_SECRET;
  assert.equal(getMailjetSettings().ready, false);
  assert.equal((await sendMailjetInvite(input, { fetch: async () => { throw new Error('must not fetch'); } })).status, 'UNAVAILABLE');
  assert.equal(JSON.stringify(getMailjetSettings()).includes('test-key'), false);
});

test('email payload requires a short subject and exact canonical link on its own line', () => {
  const url = 'https://beatbrain.xyz/auth/signin?invite=token&email=friend%40example.com';
  assert.deepEqual(validateInviteEmailContent({ subject: ' Join ', body: 'Hello\n' + url + '\nWelcome' }, url), { subject: 'Join', body: 'Hello\n' + url + '\nWelcome' });
  for (const value of [{ subject: '', body: url }, { subject: 'x'.repeat(201), body: url }, { subject: 'Hello\r\nBcc: evil', body: url }, { subject: 'Hello', body: 'x'.repeat(12001) }, { subject: 'Hello', body: url + 'evil' }, { subject: 'Hello', body: 'https://evil.test/' }]) assert.equal(validateInviteEmailContent(value, url), null);
});
