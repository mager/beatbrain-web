import assert from 'node:assert/strict';
import test from 'node:test';
import { auth } from '../lib/auth';

const user = { id: 'not-created', name: 'Test', username: 'test_member', email: 'test@example.com', emailVerified: false, createdAt: new Date(), updatedAt: new Date() };
const beforeCreate = auth.options.databaseHooks!.user!.create!.before!;

test('OAuth and context-free user creation cannot bypass invitation checks', async () => {
  for (const context of [null, { path: '/callback/spotify', headers: new Headers({ 'x-invite-token': 'A'.repeat(43) }) }]) {
    await assert.rejects(() => Promise.resolve(beforeCreate(user, context as any)), (error: any) => error.statusCode === 403);
  }
});

test('email registration without an invite is rejected before user creation', async () => {
  await assert.rejects(() => Promise.resolve(beforeCreate(user, { path: '/sign-up/email', headers: new Headers() } as any)), (error: any) => error.statusCode === 403);
});

test('registration requires a valid username before claiming an invite', async () => {
  await assert.rejects(() => Promise.resolve(beforeCreate({ ...user, username: '' }, { path: '/sign-up/email', headers: new Headers() } as any)), (error: any) => error.statusCode === 400);
});
