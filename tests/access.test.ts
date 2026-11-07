import assert from 'node:assert/strict';
import test from 'node:test';
import { isPublicPath, isSameOrigin, safeReturnPath, isOwner } from '../lib/access';

test('only sign-in, supported auth endpoints and static assets allow guests', () => {
  for (const path of ['/auth/signin', '/api/auth/sign-in/email', '/api/auth/sign-up/email', '/api/auth/get-session', '/api/auth/sign-in/social', '/api/auth/callback/spotify', '/_next/static/chunks/app.js', '/favicon.ico']) assert.equal(isPublicPath(path), true, path);
  for (const path of ['/', '/u/mager', '/api/feed', '/api/invites', '/api/auth/update-user', '/api/auth/callback/google', '/_next/image-private', '/_next/data/build/index.json', '/auth/signin/extra']) assert.equal(isPublicPath(path), false, path);
});

test('return paths cannot redirect to another origin', () => {
  for (const path of ['https://evil.test', '//evil.test', '/\\evil.test', '', ['/feed'], '/%2f%2fevil.test']) assert.equal(safeReturnPath(path), '/');
  assert.equal(safeReturnPath('/u/mager?tab=posts'), '/u/mager?tab=posts');
});

test('mutations require the configured app origin', () => {
  assert.equal(isSameOrigin('https://beatbrain.xyz', 'https://beatbrain.xyz'), true);
  for (const origin of [undefined, 'null', 'https://evil.test', 'https://beatbrain.xyz.evil.test', 'https://beatbrain.xyz/path']) assert.equal(isSameOrigin(origin, 'https://beatbrain.xyz'), false);
});

test('owner rights follow the existing user ID, not an editable username', () => {
  assert.equal(isOwner({ id: '4', username: 'new-name' }), true);
  assert.equal(isOwner({ id: 'other', username: 'mager' }), false);
  assert.equal(isOwner(null), false);
});
