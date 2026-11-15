import assert from 'node:assert/strict';
import test from 'node:test';
import { auth } from '../lib/auth';
import handler from '../pages/api/creator';

const id='149f91ef-1287-46da-9a8e-87fee02f1471';
function response(){return {code:200,body:undefined as any,headers:{} as any,setHeader(k:string,v:unknown){this.headers[k]=v;return this;},status(n:number){this.code=n;return this;},json(v:unknown){this.body=v;return this;}} as any;}
test('creator API protects sessions, validates IDs and preserves provider errors',async t=>{
 const session=auth.api.getSession,fetcher=global.fetch;
 t.after(()=>{auth.api.getSession=session;global.fetch=fetcher;});
 let actor:any=null,calls=0,status=200,body:any={creator:{id,name:'Pharrell Williams',catalog:[],connections:[]}};
 auth.api.getSession=(async()=>actor) as any;
 global.fetch=async(input,init)=>{calls++;assert.ok(String(input).endsWith('/creator?mbid='+id));assert.ok(init?.signal);return new Response(JSON.stringify(body),{status});};
 const req=(mbid:any=id,method='GET')=>({query:{mbid},headers:{},method} as any);
 const guest=response();await handler(req(),guest);assert.equal(guest.code,401);assert.equal(calls,0);
 actor={user:{id:'member'}};
 for(const value of ['bad',[id,id],id+'&x=1',null]){const out=response();await handler(req(value),out);assert.equal(out.code,400);}
 const wrong=response();await handler(req(id,'POST'),wrong);assert.equal(wrong.code,405);
 assert.equal(calls,0);
 const good=response();await handler(req(),good);assert.equal(good.code,200);assert.equal(good.body.id,id);assert.match(good.headers['Cache-Control'],/private.*no-store/);
 status=404;body={error:'upstream detail'};const missing=response();await handler(req(),missing);assert.equal(missing.code,404);assert.ok(missing.body.error);
 status=200;body={creator:{id,name:'Missing catalog'}};const malformed=response();await handler(req(),malformed);assert.equal(malformed.code,502);
 body={creator:{id,name:'Invalid entry',catalog:[{id:'bad'}],connections:[]}};const badEntry=response();await handler(req(),badEntry);assert.equal(badEntry.code,502);
 global.fetch=async()=>{throw Error('private upstream detail');};const failed=response();await handler(req(),failed);assert.equal(failed.code,503);assert.doesNotMatch(failed.body.error,/private upstream/);
});
