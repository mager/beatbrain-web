import assert from 'node:assert/strict';
import test from 'node:test';
import { filterCatalog, roleCategory, catalogHref, normalizeDiscovery, normalizeRecordingMetadata, withRecordingMetadata } from '../lib/creator-catalog';
import type { CreatorCatalogEntry } from '../lib/types';
const a='b5e1e12f-8832-4ba4-b772-de15e2db2009',b='833f00e1-781f-4edd-90e4-e52712618862',person='149f91ef-1287-46da-9a8e-87fee02f1471';
const catalog:CreatorCatalogEntry[]=[
 {id:a,kind:'recording',title:'Alright',artists:[{id:person,name:'Kendrick Lamar'}],roles:['producer','background vocals vocal'],date:'2015'},
 {id:b,kind:'recording',title:'Get Lucky',artists:[],roles:['vocal'],date:'2013'},
 {id:b,kind:'release',title:'An album',artists:[],roles:['executive producer']},
 {id:a,kind:'work',title:'A composition',artists:[],roles:['composer']},
];
test('catalog searches artists and roles while keeping production and entity scopes exact',()=>{
 assert.deepEqual(filterCatalog(catalog,{kind:'recording',role:'production',q:'',sort:'title'}).map(x=>x.id),[a]);
 assert.equal(filterCatalog(catalog,{kind:'recording',role:'all',q:'kendrick',sort:'title'}).length,1);
 assert.equal(filterCatalog(catalog,{kind:'all',role:'production',q:'executive',sort:'title'})[0].kind,'release');
 assert.equal(roleCategory('background vocals vocal'),'performance');
 assert.equal(roleCategory('executive producer'),'production');
 assert.equal(roleCategory('composer'),'writing');
 assert.equal(roleCategory('remixer'),'remix');
 assert.equal(roleCategory('video director'),'other');
 assert.deepEqual(filterCatalog(catalog,{kind:'recording',role:'all',q:'',sort:'newest'}).map(x=>x.id),[a,b]);
 assert.equal(catalogHref(catalog[0]),'/song/'+a);
 assert.equal(catalogHref(catalog[2]),'https://musicbrainz.org/release/'+b);
});
test('discovery uses verified IDs, excludes the seed and bounds results',()=>{
 const raw={[person]:[{similar_artist_mbid:person,similar_artist_name:'Pharrell'}],[a]:[{similar_artist_mbid:a,similar_artist_name:'Another artist',recording_mbid:b}],bad:[{similar_artist_name:'Wrong'}]};
 assert.deepEqual(normalizeDiscovery(raw,person),[{id:a,name:'Another artist',recordingId:b}]);
 assert.throws(()=>normalizeDiscovery({error:'unavailable'},person));
 assert.deepEqual(normalizeDiscovery({},person),[]);
});
test('artwork metadata only accepts requested exact recordings and valid cover identifiers',()=>{
 const raw={[a]:{release:{caa_release_mbid:b,caa_id:123},artist:{artists:[{artist_mbid:person,name:'Kendrick Lamar'}]},recording:{first_release_date:'2015'}},[b]:{release:{caa_release_mbid:a,caa_id:456}}};
 const found=normalizeRecordingMetadata(raw,[a]);
 assert.equal(Object.keys(found).length,1);
 assert.equal(found[a].image,`https://coverartarchive.org/release/${b}/123-250.jpg`);
 assert.equal(found[a].artists[0].id,person);
 assert.equal(found[a].date,'2015');
 assert.equal(normalizeRecordingMetadata({[a]:{release:{caa_release_mbid:'../bad',caa_id:-1}}},[a])[a].image,undefined);
});
test('displayed fallback artists participate in search without replacing source credits',()=>{
 const enriched=withRecordingMetadata(catalog,{[b]:{artists:[{id:person,name:'Daft Punk'}]},[a]:{artists:[{id:person,name:'Wrong artist'}]}});
 assert.equal(filterCatalog(enriched,{kind:'recording',role:'all',q:'Daft Punk',sort:'artist'})[0].id,b);
 assert.equal(enriched[0].artists[0].name,'Kendrick Lamar');
 assert.deepEqual(enriched[2].artists,[],'recording details must not be applied to release credits');
});
