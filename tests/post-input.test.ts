import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parsePostInput } from '../lib/post-input';
const valid = { content: '  on repeat  ', track: { source: 'SPOTIFY', sourceId: '70LcF31zb1H0PyJoS1Sx1r', title: 'Creep', artist: 'Radiohead', image: 'https://i.scdn.co/image/abc123' } };
test('post input keeps a valid track and trims the note', () => { assert.equal(parsePostInput(valid).content, 'on repeat'); });
test('post input rejects missing tracks, invalid IDs, long notes, and unsafe artwork URLs', () => {
 for (const body of [null, {}, {...valid,content:'a'.repeat(1001)}, {...valid,track:{...valid.track,sourceId:'bad'}}, {...valid,track:{...valid.track,image:'javascript:alert(1)'}}]) assert.throws(()=>parsePostInput(body));
});
