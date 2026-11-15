import assert from 'node:assert/strict';
import test from 'node:test';
import { auth } from '../lib/auth';
import handler from '../pages/api/creator/discovery';
const id='149f91ef-1287-46da-9a8e-87fee02f1471',other='056e4f3e-d505-4dad-8ec1-d04f521cbb56',recording='833f00e1-781f-4edd-90e4-e52712618862';
function response(){return {code:200,body:undefined as any,headers:{} as any,setHeader(k:string,v:unknown){this.headers[k]=v;return this;},status(n:number){this.code=n;return this;},json(v:unknown){this.body=v;return this;}} as any;}
test('optional discovery requires membership, bounds requests, and keeps failures distinct',async t=>{
 const session=auth.api.getSession,fetcher=global.fetch;
 t.after(()=>{auth.api.getSession=session;global.fetch=fetcher;});
 let actor:any=null,calls=0,fail=false;
 auth.api.getSession=(async()=>actor) as any;
 global.fetch=async(input,init)=>{calls++;const url=new URL(String(input));assert.equal(url.pathname,'/creator/discovery');assert.ok(init?.signal);if(fail)throw Error('provider detail');if(url.searchParams.has('mbid'))return Response.json({[other]:[{similar_artist_mbid:other,similar_artist_name:'Daft Punk',recording_mbid:recording}]});return Response.json({});};
 const req=(query:any)=>({method:'GET',headers:{},query} as any);
 const guest=response();await handler(req({mbid:id}),guest);assert.equal(guest.code,401);assert.equal(calls,0);
 actor={user:{id:'member'}};
 for(const query of [{},{mbid:[id]},{mbid:'bad'},{recordings:Array(25).fill(recording).join(',')},{mbid:id,recordings:recording}]){const bad=response();await handler(req(query),bad);assert.equal(bad.code,400);}
 assert.equal(calls,0);
 const good=response();await handler(req({mbid:id}),good);assert.equal(good.code,200);assert.equal(good.body.artists[0].id,other);assert.match(good.headers['Cache-Control'],/private.*no-store/);
 const repeated=response();await handler(req({mbid:id}),repeated);assert.equal(calls,2); // Occipital owns the shared cache.
 fail=true;const failed=response();await handler(req({mbid:other}),failed);assert.equal(failed.code,503);assert.ok(failed.body.error);assert.doesNotMatch(failed.body.error,/provider detail/);
 fail=false;const empty=response();await handler(req({recordings:recording}),empty);assert.deepEqual(empty.body.metadata,{});
});
