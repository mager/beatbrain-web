import assert from 'node:assert/strict';
import test from 'node:test';
import { claimInvite, hashInviteToken, normalizeInviteEmail, newInvite } from '../lib/invites';

test('email normalization rejects malformed addresses', () => {
  assert.equal(normalizeInviteEmail(' Friend@Example.com '), 'friend@example.com');
  for (const email of ['', 'a@', '@example.com', 'a b@example.com', null, 2]) assert.equal(normalizeInviteEmail(email), null);
});

test('invites contain a random secret and store only its hash', () => {
  const first = newInvite('friend@example.com', '4', new Date('2026-11-07T00:00:00Z'));
  const second = newInvite('friend@example.com', '4');
  assert.match(first.token, /^[A-Za-z0-9_-]{43}$/);
  assert.notEqual(first.token, second.token);
  assert.equal(first.data.tokenHash, hashInviteToken(first.token));
  assert.equal(first.data.expiresAt.toISOString(), '2026-11-14T00:00:00.000Z');
  assert.equal('token' in first.data, false);
});

test('claim uses one conditional update with email, expiry and unused checks', async () => {
  let used = false;
  const token = 'A'.repeat(43);
  const now = new Date('2026-11-07T00:00:00Z');
  const store = { updateMany: async (args: any) => {
    assert.equal(args.where.tokenHash, hashInviteToken(token));
    assert.equal(args.where.email, 'friend@example.com');
    assert.equal(args.where.usedAt, null);
    assert.equal(args.where.expiresAt.gt, now);
    assert.equal(args.data.usedAt, now);
    if (used) return { count: 0 };
    used = true;
    return { count: 1 };
  }};
  const claims = await Promise.all([claimInvite(token, 'Friend@Example.com', store, now), claimInvite(token, 'Friend@Example.com', store, now)]);
  assert.deepEqual(claims, [true, false]);
});

test('missing and malformed tokens cannot claim an invitation', async () => {
  const store = { updateMany: async () => { throw new Error('Must not query malformed tokens'); } };
  for (const token of [undefined, '', 'bad', 'A'.repeat(10000)]) assert.equal(await claimInvite(token, 'friend@example.com', store), false);
});
