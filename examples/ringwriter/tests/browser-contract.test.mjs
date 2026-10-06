import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import crypto from 'node:crypto';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
let canvasLibrary;try{canvasLibrary=require('@napi-rs/canvas');}catch{}

test('page wiring supports pointer cancellation, keyboard hold/release and replay', {skip:!canvasLibrary&&'Optional offline Canvas package is unavailable; this is not a browser-runtime test.'}, async()=>{
 const {createCanvas,Path2D}=canvasLibrary,canvas=createCanvas(1728,1728),listeners=new Map(),windowListeners=new Map();let replay,queued,time=0,capture=null;
 canvas.addEventListener=(name,fn)=>listeners.set(name,fn);canvas.getBoundingClientRect=()=>({left:0,top:0,width:864,height:864});canvas.setPointerCapture=id=>{capture=id;};
 const fakeDocument={querySelector:selector=>selector==='canvas'?canvas:{addEventListener:(name,fn)=>{assert.equal(name,'click');replay=fn;}},createElement:tag=>{assert.equal(tag,'canvas');return createCanvas(1,1);}};
 const saved={};for(const name of ['document','window','Path2D','fetch','performance','requestAnimationFrame'])saved[name]=Object.getOwnPropertyDescriptor(globalThis,name);
 const replacements={document:fakeDocument,window:{addEventListener:(name,fn)=>windowListeners.set(name,fn)},Path2D,performance:{now:()=>time},requestAnimationFrame:fn=>{queued=fn;},fetch:async url=>{const file=new URL('../'+url.replace(/^\.\//,''),import.meta.url),bytes=await fs.readFile(file);return{json:async()=>JSON.parse(bytes),arrayBuffer:async()=>bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength)};}};
 try{
  for(const [name,value] of Object.entries(replacements))Object.defineProperty(globalThis,name,{value,configurable:true,writable:true});
  await import('../src/main.mjs?offline-wiring-test');
  const frame=ms=>{time=ms;assert.equal(typeof queued,'function');const fn=queued;queued=null;fn(ms);assert.equal(typeof queued,'function');return crypto.createHash('sha256').update(canvas.getContext('2d').getImageData(0,0,1728,1728).data).digest('hex');};
  const event={clientX:538,clientY:310,button:0,pointerId:7};const blank=frame(0),visible=frame(2000);assert.notEqual(blank,visible);
  listeners.get('pointerdown')({...event,button:2});assert.equal(capture,null);
  listeners.get('pointerdown')(event);assert.equal(capture,7);const held=frame(2400);assert.notEqual(held,visible);
  listeners.get('pointercancel')();const released=frame(2600);assert.notEqual(released,held);
  listeners.get('lostpointercapture')();windowListeners.get('blur')();frame(2800);
  let prevented=0;const key={code:'Space',repeat:false,preventDefault(){prevented++;}};
  listeners.get('keydown')(key);frame(3000);listeners.get('keyup')(key);frame(3200);assert.equal(prevented,2);
  listeners.get('keydown')({code:'Escape'});assert.equal(frame(3200),blank);
  frame(4800);replay();assert.equal(frame(4800),blank);
 }finally{for(const [name,descriptor] of Object.entries(saved)){if(descriptor)Object.defineProperty(globalThis,name,descriptor);else delete globalThis[name];}}
});
