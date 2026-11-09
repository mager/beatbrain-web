import assert from 'node:assert/strict';
import test from 'node:test';
import { auth } from '../lib/auth';
import prisma from '../lib/prisma';
import handler from '../pages/api/search';

function response() { return { code: 200, body: undefined as any, headers: {} as any, setHeader(k: string,v: unknown) { this.headers[k]=v; return this; }, status(n: number) { this.code=n; return this; }, json(v: unknown) { this.body=v; return this; } } as any; }
const request=(body: unknown={query:'mager',scope:'all'})=>({method:'POST',headers:{},body} as any);
test('combined search protects membership and returns only public profile fields',async t=>{
 const session=auth.api.getSession,find=prisma.user.findMany,fetcher=global.fetch;
 t.after(()=>{auth.api.getSession=session;prisma.user.findMany=find;global.fetch=fetcher;});
 let actor:any=null,calls=0,peopleCalls=0,failMusic=false,failPeople=false;
 auth.api.getSession=(async()=>actor) as any;
 prisma.user.findMany=(async args=>{peopleCalls++;assert.ok(args.take<=30);assert.deepEqual(Object.keys(args.select).sort(),['image','name','username']);assert.equal(args.where.username.not,null);if(failPeople)throw Error('database unavailable');return [{username:'other',name:'Mager fan',image:null},{username:'mager',name:'Andrew',image:null}];}) as any;
 global.fetch=async()=>{calls++;return new Response(JSON.stringify({results:[{id:'70LcF31zb1H0PyJoS1Sx1r',name:'Creep',artist:'Radiohead',thumb:null}]}),{status:failMusic?503:200});};
 const guest=response();await handler(request(),guest);assert.equal(guest.code,401);assert.equal(calls,0);assert.equal(peopleCalls,0);
 actor={user:{id:'member'}};
 for(const body of [{query:'x',scope:'all'},{query:'a'.repeat(201),scope:'all'},{query:'ok',scope:'emails'}]){const r=response();await handler(request(body),r);assert.equal(r.code,400);}
 const both=response();await handler(request(),both);assert.equal(both.code,200);assert.equal(both.body.people[0].username,'mager');assert.equal(both.body.results.length,1);assert.deepEqual(both.body.unavailable,[]);assert.match(both.headers['Cache-Control'],/no-store/);
 const before=peopleCalls;const tracks=response();await handler(request({query:'Radiohead'}),tracks);assert.equal(tracks.body.results.length,1);assert.equal(peopleCalls,before);assert.equal(tracks.body.people,undefined);
 failMusic=true;const peopleOnly=response();await handler(request(),peopleOnly);assert.equal(peopleOnly.code,200);assert.equal(peopleOnly.body.people.length,2);assert.deepEqual(peopleOnly.body.unavailable,['music']);assert.deepEqual(peopleOnly.body.results,[]);
 failMusic=false;failPeople=true;const musicOnly=response();await handler(request(),musicOnly);assert.equal(musicOnly.code,200);assert.equal(musicOnly.body.results.length,1);assert.deepEqual(musicOnly.body.unavailable,['people']);
 failMusic=true;const neither=response();await handler(request(),neither);assert.equal(neither.code,503);assert.ok(neither.body.error);
});
