import assert from 'node:assert/strict';
import test from 'node:test';
import { normalizeConnections, connectionLabel } from '../lib/song-connections';
import { adaptTrack } from '../lib/adapters/track';

const id = '22222222-2222-4222-8222-222222222222';
const sample = { id, title: 'Source song', artist: 'Someone', type: 'samples material', direction: 'forward' };
test('sample, remix, and edit labels retain MusicBrainz direction', () => {
  for (const [type, forward, backward] of [['samples material','Samples','Sampled by'],['remix','Remix of','Remixed as'],['edit','Edit of','Edited as']]) {
    assert.equal(connectionLabel({type,direction:'forward'}), forward);
    assert.equal(connectionLabel({type,direction:'backward'}), backward);
  }
  assert.equal(connectionLabel({type:'remaster',direction:'forward'}), '');
  assert.equal(connectionLabel({type:'remix',direction:'wrong'}), '');
});
test('connections reject invalid data and deduplicate without merging different relationships', () => {
  const result = normalizeConnections([sample, sample, {...sample,type:'remix'}, {...sample,id:'../../bad'}, {...sample,title:''}, {...sample,direction:null}, null, {}, {...sample,artist:null}]);
  assert.equal(result.length,2);
  assert.equal(result[0].title, 'Source song');
  assert.equal(normalizeConnections(null).length,0);
  assert.equal(normalizeConnections({}).length,0);
});
test('adapter retains connections and gives older API payloads an empty list', () => {
  assert.equal(adaptTrack({track:{connections:[sample]} as any}).connections?.length,1);
  assert.deepEqual(adaptTrack({track:{} as any}).connections,[]);
});

test('studio dates keep source precision and reject impossible dates', async () => {
  const { normalizeStudios, studioDateRange } = await import('../lib/song-studios');
  const studio = {id,name:'Air Studios',type:'recorded at',begin:'1973-10',end:'1973-10',additional:true};
  const result = normalizeStudios([studio,studio,{...studio,id:'bad'},{...studio,type:'video shot at'}]);
  assert.equal(result.length,1);
  assert.equal(result[0].additional,true);
  assert.equal(studioDateRange(result[0]),'October 1973');
  assert.equal(studioDateRange({...studio,begin:'1973',end:'1974'}),'1973 – 1974');
  assert.equal(studioDateRange({...studio,begin:'1973-02-31',end:''}),'');
  assert.equal(studioDateRange({...studio,begin:'',end:'1973-10'}),'Until October 1973');
  assert.deepEqual(normalizeStudios(null),[]);
});

test('compact preview shows different connection types without dropping any songs', async () => {
  const { connectionPreviewOrder } = await import('../lib/song-connections');
  const items = [sample, {...sample,id:'b',direction:'backward'}, {...sample,id:'c',direction:'backward'}, {...sample,id:'d',type:'remix'}, {...sample,id:'e',type:'edit'}];
  const result = connectionPreviewOrder(items);
  assert.deepEqual(result.slice(0,4).map(item=>item.id),[id,'b','d','e']);
  assert.equal(result.length,items.length);
  assert.equal(new Set(result).size,items.length);
});
