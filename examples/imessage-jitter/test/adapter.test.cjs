'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs'),path=require('node:path'),M=require('../src/motion.js');
async function harness({reduced=false}={}){
 let now=0,id=0;const frames=new Map();
 class Element{constructor(){this.events={};this.disabled=false;this.checked=false;this.textContent='';this.value='wiggling';}addEventListener(t,f){this.events[t]=f;}fire(t,e={}){this.events[t]?.(e);}getContext(){return {};}}
 const e=Object.fromEntries(['canvas','#word','#reduced','#pause','#replay','#jitter-hit'].map(s=>[s,new Element()]));e['#pause'].textContent='Pause';
 const document=new Element(),window=new Element(),media=new Element();document.querySelector=s=>e[s];document.hidden=false;document.fonts={ready:Promise.resolve()};media.matches=reduced;
 window.JitterMotion=M;window.JitterScene={draw(){}};
 vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../src/app.js'),'utf8'),{document,window,matchMedia:()=>media,performance:{now:()=>now},requestAnimationFrame:f=>{frames.set(++id,f);return id;},cancelAnimationFrame:i=>frames.delete(i)});
 await new Promise(resolve=>setImmediate(resolve));
 return {e,document,window,media,get frames(){return frames.size;},step(ms){now+=ms;const list=[...frames.values()];frames.clear();list.forEach(f=>f(now));}};
}
test('completion announces Replay and restart owns one RAF',async()=>{
 const h=await harness();h.step(3000);assert.equal(h.frames,0);assert.equal(h.e['#pause'].textContent,'Replay');h.e['#pause'].fire('click');assert.equal(h.e['#pause'].textContent,'Pause');assert.equal(h.frames,1);
});
test('pause/resume labels reflect controller state',async()=>{
 const h=await harness();h.step(500);h.e['#pause'].fire('click');assert.equal(h.e['#pause'].textContent,'Resume');h.step(3000);assert.equal(h.frames,0);h.e['#pause'].fire('click');assert.equal(h.e['#pause'].textContent,'Pause');h.step(100);assert.equal(h.frames,1);
});
test('preference changes disable playback and restore a labelled stopped state',async()=>{
 const h=await harness();h.step(500);h.media.fire('change',{matches:true});h.step(20);assert.equal(h.frames,0);assert.equal(h.e['#pause'].disabled,true);
 h.media.fire('change',{matches:false});h.step(20);assert.equal(h.e['#pause'].disabled,false);assert.equal(h.e['#pause'].textContent,'Replay');assert.equal(h.frames,0);h.e['#pause'].fire('click');assert.equal(h.e['#pause'].textContent,'Pause');
});
test('hidden playback pauses without elapsed jump and restores playback',async()=>{
 const h=await harness();h.step(500);h.document.hidden=true;h.document.fire('visibilitychange');assert.equal(h.frames,0);h.step(5000);h.document.hidden=false;h.document.fire('visibilitychange');h.step(100);assert.equal(h.frames,1);assert.equal(h.e['#pause'].textContent,'Pause');
});
test('pagehide and persisted restoration synchronize cancelled playback',async()=>{
 const h=await harness();h.step(500);h.window.fire('pagehide');assert.equal(h.frames,0);h.window.fire('pageshow',{persisted:true});h.step(16);assert.equal(h.frames,0);assert.equal(h.e['#pause'].textContent,'Replay');h.e['#pause'].fire('click');assert.equal(h.frames,1);
});
test('rapid replay and word input keep one chain',async()=>{
 const h=await harness();for(let i=0;i<20;i++){h.e['#replay'].fire('click');h.e['#word'].value='中文🙂';h.e['#word'].fire('input');}assert.equal(h.frames,1);h.step(3000);assert.equal(h.frames,0);assert.equal(h.e['#pause'].textContent,'Replay');
});
test('reduced-motion cancellation while hidden cannot auto-resume after preference reversal',async()=>{
 const h=await harness();h.step(500);h.document.hidden=true;h.document.fire('visibilitychange');
 h.media.fire('change',{matches:true});h.media.fire('change',{matches:false});h.document.hidden=false;h.document.fire('visibilitychange');h.step(100);
 assert.equal(h.frames,0);assert.equal(h.e['#pause'].textContent,'Replay');
});
