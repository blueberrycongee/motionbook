'use strict';
const assert=require('assert'),fs=require('fs'),vm=require('vm'),crypto=require('crypto'),{createCanvas}=require('@napi-rs/canvas'),scene=require('./scene.js');
const hash=(p,t,w=900,h=536)=>{const c=createCanvas(w,h);scene.render(c.getContext('2d'),w,h,p,{time:t});return crypto.createHash('sha256').update(c.toBuffer('image/png')).digest('hex')};
assert.equal(hash(.4,1),hash(.4,1));assert.notEqual(hash(.4,1),hash(.4,2));assert.notEqual(hash(.4,1),hash(.8,1));hash(1,1);assert.equal(hash(.4,1),hash(.4,1));assert.equal(scene.state(-2).progress,0);assert.equal(scene.state(Infinity).progress,0);assert.equal(scene.state(2).progress,1);for(const [w,h] of [[390,844],[900,576],[1440,900]])for(const p of [0,.25,.5,.75,1])hash(p,2,w,h);
class E{constructor(v={}){Object.assign(this,{events:{},attrs:{},value:0,style:{}},v)}addEventListener(k,f){(this.events[k]??=[]).push(f)}removeEventListener(k,f){this.events[k]=(this.events[k]||[]).filter(x=>x!==f)}setAttribute(k,v){this.attrs[k]=v}fire(k,v={}){(this.events[k]||[]).forEach(f=>f(v))}}
function harness({readyState=2,reduced=false,hidden=false,error=null}={}){
  const c=createCanvas(900,576),els={};for(const id of ['scene','canvas','film','seek','progress','pause','scroll','reset','claims'])els[id]=new E();
  let scroll=0;els.scene.getBoundingClientRect=()=>({top:-scroll,height:3000});els.canvas.getBoundingClientRect=()=>({width:900,height:576});els.canvas.getContext=()=>c.getContext('2d');
  Object.assign(els.film,{currentTime:1,readyState,error,paused:true,pause(){this.paused=true},play(){this.paused=false;return Promise.resolve()}});
  const mq=new E({matches:reduced}),win=new E(),doc=new E({hidden,getElementById:id=>els[id]}),q=new Map(),draws={overlay:0,background:0,times:[]};let n=0,observe,disconnected=false;
  const countedScene={...scene,renderBackgroundLayer(...args){draws.background++;draws.times.push(args[4].time);return scene.renderBackgroundLayer(...args)},renderOverlay(...args){draws.overlay++;return scene.renderOverlay(...args)}};
  const box={document:doc,window:win,MotionScene:countedScene,matchMedia:()=>mq,devicePixelRatio:1,innerHeight:576,requestAnimationFrame:f=>(q.set(++n,f),n),cancelAnimationFrame:id=>q.delete(id),IntersectionObserver:class{constructor(f){observe=f}observe(){}disconnect(){disconnected=true}},Math,Number};
  vm.runInNewContext(fs.readFileSync(__dirname+'/motion.js','utf8'),box);
  return {m:win.MOTION,els,mq,win,doc,q,draws,setScroll(value){scroll=value},observe(value){observe([{isIntersecting:value}])},get disconnected(){return disconnected},frame(now){const callbacks=[...q.values()];q.clear();callbacks.forEach(f=>f(now))}};
}
{
  const {m,els,mq,win,q,observe,setScroll}=harness();
  m.setProgress(.4);assert.equal(m.getState().progress,.4);m.setPaused(true);assert(els.film.paused);m.setPaused(false);assert(!els.film.paused);setScroll(1186);els.scroll.fire('click');assert.equal(m.getState().progress,.5);mq.matches=true;mq.fire('change');assert(els.film.paused);mq.matches=false;mq.fire('change');assert(!els.film.paused);observe(false);assert.equal(els.film.currentTime,0);assert(els.film.paused);observe(true);assert(!els.film.paused);els.reset.fire('click');assert.equal(m.getState().progress,0);m.destroy();assert.equal(q.size,0);assert.equal(win.events.scroll.length,0);assert(els.film.paused);
}
// Decoded video and reduced-motion backgrounds are static Canvas states.
for(const options of [{},{reduced:true},{readyState:0,reduced:true},{readyState:0,hidden:true}]){
  const h=harness(options);
  assert.equal(h.q.size,0,'static state must not queue RAF: '+JSON.stringify(options));
  const draws=h.draws.overlay,backgrounds=h.draws.background;h.frame(1000);h.frame(2000);
  assert.equal(h.draws.overlay,draws,'static state must not redraw without an event');assert.equal(h.draws.background,backgrounds,'static background must not redraw without an event');
  h.m.setProgress(.35);assert.equal(h.draws.overlay,draws+1,'static state still repaints on seek');
  h.win.fire('resize');assert.equal(h.draws.overlay,draws+3,'resize repaints the static scene');assert.equal(h.q.size,0);h.m.destroy();
}
// Only an active missing/error video needs fallback animation, with one RAF.
{
  const h=harness({readyState:0});assert.equal(h.q.size,1);
  const firstDraw=h.draws.overlay;h.frame(0);assert.equal(h.draws.overlay,firstDraw+1);assert.equal(h.q.size,1);
  h.frame(100);assert(Math.abs(h.m.getState().fallbackTime-.1)<1e-9,'a zero timestamp is a valid clock origin');
  for(let i=0;i<3;i++)h.els.film.fire('waiting');assert.equal(h.q.size,1,'events must not create duplicate loops');
  h.frame(5100);assert(Math.abs(h.m.getState().fallbackTime-.2)<1e-9,'fallback frame deltas remain capped');
  const mediaTime=h.els.film.currentTime;h.m.setProgress(.8);assert.equal(h.els.film.currentTime,mediaTime);assert.equal(h.q.size,1);
  h.els.reset.fire('click');assert.equal(h.m.getState().fallbackTime,0);assert.equal(h.els.film.currentTime,0);h.frame(20000);assert.equal(h.m.getState().fallbackTime,0,'reset establishes a fresh frame-time baseline');
  h.m.destroy();
}
// Pause, hidden, offscreen and reduced-motion states cancel immediately. The
// first resumed frame establishes a new baseline, without advancing idle time.
for(const mode of ['pause','hidden','offscreen','reduced']){
  const h=harness({readyState:0});h.frame(1000);h.frame(1100);const old=[...h.q.values()][0];
  const change=value=>{if(mode==='pause')h.m.setPaused(value);if(mode==='hidden'){h.doc.hidden=value;h.doc.fire('visibilitychange')}if(mode==='offscreen')h.observe(!value);if(mode==='reduced'){h.mq.matches=value;h.mq.fire('change')}};
  change(true);assert.equal(h.q.size,0,mode+' must cancel the pending frame');assert(h.els.film.paused);
  if(mode==='reduced')assert.equal(h.draws.times.at(-1),0,'reduced motion paints a stationary background');
  const stoppedTime=h.m.getState().fallbackTime,stoppedDraws=h.draws.overlay;
  old(6000);h.frame(7000);assert.equal(h.q.size,0,mode+' must ignore a stale callback');assert.equal(h.draws.overlay,stoppedDraws);assert.equal(h.m.getState().fallbackTime,stoppedTime);
  change(false);assert.equal(h.q.size,1,mode+' must resume fallback');assert(!h.els.film.paused);
  const resumedDraws=h.draws.overlay;old(19000);assert.equal(h.q.size,1,mode+' old callback must not disturb the new loop');assert.equal(h.draws.overlay,resumedDraws);
  h.frame(20000);assert.equal(h.m.getState().fallbackTime,stoppedTime,mode+' first resumed frame must not catch up');
  h.frame(20050);assert(Math.abs(h.m.getState().fallbackTime-(stoppedTime+.05))<1e-9,mode+' resumes normal time');
  if(mode==='offscreen')assert.equal(stoppedTime,0,'viewport exit resets fallback time');
  h.m.destroy();
}
// Ready-state notifications switch the loop in either direction; a decoded
// video's error still needs fallback, but error recovery cancels it.
{
  const h=harness();assert.equal(h.q.size,0);
  for(const event of ['emptied','waiting','stalled','loadstart']){
    h.els.film.readyState=0;h.els.film.fire(event);assert.equal(h.q.size,1,event+' restarts missing-video fallback');const start=h.m.getState().fallbackTime;h.frame(1000);assert.equal(h.m.getState().fallbackTime,start,event+' starts a fresh baseline');h.frame(1050);
    const stale=[...h.q.values()][0];h.els.film.readyState=2;h.els.film.fire('loadeddata');assert.equal(h.q.size,0,'loadeddata cancels fallback');
    const draws=h.draws.overlay,time=h.m.getState().fallbackTime;stale(6000);assert.equal(h.draws.overlay,draws);assert.equal(h.m.getState().fallbackTime,time);
  }
  h.els.film.error={code:3};h.els.film.fire('error');assert.equal(h.q.size,1,'a media error animates fallback even if readyState is high');
  h.els.film.error=null;h.els.film.fire('canplay');assert.equal(h.q.size,0,'canplay recovery stops fallback');
  h.els.film.readyState=0;h.els.film.fire('waiting');h.m.setPaused(true);h.doc.hidden=true;h.doc.fire('visibilitychange');h.m.setPaused(false);assert.equal(h.q.size,0,'unpausing a hidden scene must not run fallback');h.doc.hidden=false;h.doc.fire('visibilitychange');assert.equal(h.q.size,1);
  const stale=[...h.q.values()][0];h.m.destroy();const draws=h.draws.overlay;assert.equal(h.q.size,0);assert(h.disconnected);assert(h.els.film.paused);
  stale(30000);h.observe(true);h.m.setPaused(false);h.els.film.fire('waiting');h.mq.fire('change');h.doc.fire('visibilitychange');h.win.fire('resize');h.win.fire('scroll');
  assert.equal(h.q.size,0,'destroyed loop cannot restart');assert.equal(h.draws.overlay,draws,'destroyed state cannot repaint');assert(h.els.film.paused,'destroyed video cannot restart');
  for(const target of [h.win,h.doc,h.mq,...Object.values(h.els)])for(const callbacks of Object.values(target.events))assert.equal(callbacks.length,0,'destroy removes every registered listener');
}
const profile=JSON.parse(fs.readFileSync(__dirname+'/reference-playback.json','utf8'));assert.equal(profile.frames.length,45);assert.equal(profile.frames.reduce((s,f)=>s+f.duration,0),4520);for(const f of profile.frames){const st=scene.state(f.progress);assert(Math.abs(st.firstMarker+51-f.sourceMarkerRaw)<.002)}assert.equal(scene.state(0).opacities[0],0);assert.equal(scene.state(1).opacities[5],1);const a=scene.state(.4),b=scene.state(.5),d=scene.state(.6);assert(Math.abs((b.firstMarker-a.firstMarker)-(d.firstMarker-b.firstMarker))<1e-8);assert(Math.abs(profile.frames[6].progress-.11621687)<1e-8);console.log('PASS 04-relay: source 45-frame timing/geometry, linear scroll slope, source entry opacity; independent clocks, reversible deterministic text, pause/play, viewport exit reset, reduced motion, resize draws, clamping, reset, destroy; demand-driven fallback RAF, static draw counts, media readiness/error events, no catch-up resume and stale callback cancellation. Offline Canvas and DOM harness only.');
