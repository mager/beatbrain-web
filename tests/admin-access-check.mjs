import assert from "node:assert/strict";
import {createRequire} from "node:module";
const require=createRequire(import.meta.url);
const {auth}=require("../lib/auth.ts");
const {getServerSideProps}=require("../pages/admin.tsx");
const original=auth.api.getSession;
let session=null;
auth.api.getSession=async()=>session;
const headers={};
const context={req:{headers:{}},res:{setHeader:(key,value)=>{headers[key]=value;}}};
try {
  assert.deepEqual(await getServerSideProps(context),{redirect:{destination:"/auth/signin?callbackUrl=%2Fadmin",permanent:false}});
  session={user:{id:"not-owner",name:"mager",username:"mager"}};
  assert.deepEqual(await getServerSideProps(context),{notFound:true});
  session={user:{id:"4",name:"Owner"}};
  assert.deepEqual(await getServerSideProps(context),{props:{sender:"Owner"}});
  assert.equal(headers["Cache-Control"],"private, no-store, max-age=0");
  console.log("Admin access passed: guest redirect, non-owner denial, stable owner ID, no-store.");
} finally {auth.api.getSession=original;}
