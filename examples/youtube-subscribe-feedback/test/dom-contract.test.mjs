import test from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const {createCanvas}=createRequire(import.meta.url)('@napi-rs/canvas');
let serial=0;
class Element{
 constructor(tagName='BUTTON'){this.tagName=tagName;this.events={};this.attrs={};this.dataset={};this.style={};this.checked=false;this.textContent='';}
 addEventListener(t,f){(this.events[t]??=[]).push(f);}
 setAttribute(k,v){this.attrs[k]=v;}
 fire(t,e={}){const event={target:this,preventDefault(){this.prevented=true;},...e};for(const f of this.events[t]||[])f(event);return event;}
}
async function harness({reduced=false}={}){
 let now=0,id=0;const frames=new Map(),timers=new Map();
 const e=Object.fromEntries(['#subscribe','#status','#replay','#reset','#cue','#reduced'].map(x=>[x,new Element(x==='#reduced'?'INPUT':'BUTTON')]));
 const doc=new Element('DOCUMENT'),win=new Element('WINDOW'),canvas=createCanvas(720,720),media=new Element();
 doc.querySelector=s=>s==='canvas'?canvas:e[s];doc.hidden=false;media.matches=reduced;
 Object.assign(globalThis,{document:doc,window:win,matchMedia:()=>media,performance:{now:()=>now},
 requestAnimationFrame:f=>{frames.set(++id,f);return id;},cancelAnimationFrame:i=>frames.delete(i),
 setTimeout:(f,delay)=>{timers.set(++id,{f,at:now+delay});return id;},clearTimeout:i=>timers.delete(i)});
 await import(new URL('../src/app.mjs?case='+ ++serial,import.meta.url));
 return {e,doc,win,media,canvas,get frames(){return frames.size;},get timers(){return timers.size;},get callbacks(){return {frames:[...frames.values()],timers:[...timers.values()].map(t=>t.f)};},
 step(ms=1000/60){now+=ms;for(const [id,t] of [...timers])if(t.at<=now){timers.delete(id);t.f();}const callbacks=[...frames.values()];frames.clear();callbacks.forEach(f=>f(now));},
 advance(seconds){for(let i=0;i<Math.ceil(seconds*60);i++)this.step();},close(){win.fire('pagehide');}};
}
test('DOM activation, reset, replay, preferences and protected native activation',async()=>{
 const h=await harness();assert.equal(h.e['#subscribe'].attrs['aria-pressed'],'false');
 for(let i=0;i<25;i++)h.e['#subscribe'].fire('click');h.step();assert.equal(h.e['#subscribe'].attrs['aria-pressed'],'true');assert.ok(h.frames<=1);
 h.e['#reset'].fire('click');h.step();assert.equal(h.e['#subscribe'].attrs['aria-pressed'],'false');
 h.e['#reduced'].checked=true;h.e['#reduced'].fire('change');h.e['#subscribe'].fire('click');h.step();assert.equal(h.e['#subscribe'].dataset.phase,'subscribed');
 h.e['#replay'].fire('click');h.step();assert.equal(h.e['#subscribe'].attrs['aria-pressed'],'false');
 assert.ok(!h.doc.fire('keydown',{key:'Enter',target:h.e['#subscribe']}).prevented);
 h.media.fire('change',{matches:true});assert.equal(h.e['#reduced'].checked,true);h.close();
});
test('Escape works on focused buttons/checkbox and protects composition',async()=>{
 const h=await harness();
 for(const target of [h.e['#subscribe'],h.e['#replay'],h.e['#reduced']]){
 h.e['#subscribe'].fire('click');h.step();assert.equal(h.e['#subscribe'].attrs['aria-pressed'],'true');
 const event=h.doc.fire('keydown',{key:'Escape',target});h.step();assert.equal(event.prevented,true);assert.equal(h.e['#subscribe'].attrs['aria-pressed'],'false');}
 h.e['#subscribe'].fire('click');h.doc.fire('keydown',{key:'Escape',isComposing:true,target:h.e['#reduced']});h.step();assert.equal(h.e['#subscribe'].attrs['aria-pressed'],'true');h.close();
});
test('settled sequence stops RAF; reset stays idle and explicit cue wakes it',async()=>{
 const h=await harness();h.advance(6);assert.equal(h.e['#subscribe'].dataset.phase,'subscribed');assert.equal(h.frames,0);assert.equal(h.timers,0);
 h.e['#reset'].fire('click');assert.equal(h.frames,0);h.e['#cue'].fire('click');assert.equal(h.frames,1);h.advance(3);assert.equal(h.frames,0);h.close();
});
test('reduced-motion timers retain automatic cue/activation without idle RAF',async()=>{
 const h=await harness({reduced:true});assert.equal(h.frames,0);assert.equal(h.timers,1);
 h.advance(1);assert.equal(h.e['#subscribe'].dataset.phase,'hint');assert.equal(h.frames,0);
 h.advance(2);assert.equal(h.e['#subscribe'].dataset.phase,'subscribed');assert.equal(h.frames,0);assert.equal(h.timers,0);h.close();
});
test('reset cancels reduced cue/activation; repeated replay owns one wake chain',async()=>{
 const h=await harness({reduced:true});h.advance(.4);h.e['#reset'].fire('click');assert.equal(h.timers,0);h.advance(5);assert.equal(h.e['#subscribe'].attrs['aria-pressed'],'false');
 for(let i=0;i<20;i++)h.e['#replay'].fire('click');assert.equal(h.timers,1);h.advance(3);assert.equal(h.e['#subscribe'].attrs['aria-pressed'],'true');h.close();
});
test('hidden/pagehide stop scheduling; visible/persisted restoration is current',async()=>{
 const h=await harness();h.advance(.5);h.doc.hidden=true;h.doc.fire('visibilitychange');assert.equal(h.frames,0);assert.equal(h.timers,0);h.advance(8);
 h.doc.hidden=false;h.doc.fire('visibilitychange');assert.equal(h.e['#subscribe'].attrs['aria-pressed'],'true');assert.equal(h.frames,0);
 h.e['#replay'].fire('click');h.win.fire('pagehide');assert.equal(h.frames,0);h.win.fire('pageshow',{persisted:true});assert.equal(h.frames,1);h.close();
});

test('stale cancelled callbacks cannot erase the current scheduling handle',async()=>{
 for(const reduced of [false,true]){
  const h=await harness({reduced});const callbacks=h.callbacks;const stale=reduced?callbacks.timers[0]:callbacks.frames[0];
  h.e['#replay'].fire('click');stale();h.e['#reset'].fire('click');assert.equal(h.frames,0);assert.equal(h.timers,0);h.close();
 }
});
