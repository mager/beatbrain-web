import assert from 'node:assert/strict';
import test from 'node:test';
import { adaptTrack } from '../lib/adapters/track';
import { trackSourceLinks } from '../lib/track-details';
test('track adapter preserves failed and completed metadata lookups', () => {
  for (const status of ['unavailable', 'matched', 'unmatched']) {
    const track = adaptTrack({ track: { name:'Yoda',artist:'Tech N9ne',metadata_status:status } } as any);
    assert.equal((track as any).metadata_status,status);
  }
  assert.equal((adaptTrack({track:{name:'Legacy'}} as any) as any).metadata_status,null);
});
test('reviewed credits retain a clear source link', () => {
 const links=trackSourceLinks({links:[{type:'apple_music',url:'https://music.apple.com/us/song/yoda/1813191831'}]});
 assert.equal(links[0].label,'Apple Music credits');
});
