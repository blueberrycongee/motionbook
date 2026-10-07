'use strict';
// Browser-adapter contract tests: real browser-global modules, fake DOM/RAF/ImageData.
// This is deterministic JavaScript integration QA, not browser-layout or GPU QA.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const crypto=require('node:crypto');
const {performance}=require('node:perf_hooks');
const root=__dirname, results=[];
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const scripts=[...html.matchAll(/<script\s+src="([^"]+)"\s*>\s*<\/script>/g)].map(m=>m[1]);
const sources=Object.fromEntries(scripts.map(file=>[file,fs.readFileSync(path.join(root,file),'utf8')]));
function test(name,fn){const start=performance.now();try{const details=fn()||{};results.push({name,passed:true,ms:+(performance.now()-start).toFixed(2),...details});console.log('PASS '+name);}catch(error){results.push({name,passed:false,error:error.stack,ms:+(performance.now()-start).toFixed(2)});console.error('FAIL '+name+'\n'+error.stack);}}
function target(tagName='DIV'){
  const handlers=new Map();
  return {tagName,value:'',checked:false,hidden:false,disabled:false,textContent:'',attrs:{},handlers,
    setAttribute(name,value){this.attrs[name]=value;},
    addEventListener(type,callback){if(!handlers.has(type))handlers.set(type,[]);handlers.get(type).push(callback);},
    emit(type,data={}){const event={target:this,preventDefault(){this.prevented=true;},...data};for(const fn of handlers.get(type)||[])fn(event);return event;}};
}
function harness({reduced=false,hidden=false,width=300,legacy=false}={}){
  let now=1000,seq=0,observedWidth=width,renderCount=0,maxQueue=0,lastState=null,lastRender=null,controller=null,creates=0;
  const queue=new Map(),els={};
  for(const id of ['scene','play','replay','seek','speed','static-mode','gravity','gravity-value','settings','start-time','seed','status','position','loading'])els[id]=target();
  for(const id of ['seek','static-mode','gravity','start-time','seed'])els[id].tagName='INPUT';
  els.play.tagName=els.replay.tagName='BUTTON';els.speed.tagName='SELECT';els.settings.tagName='FORM';
  for(const id of ['start-time','seed','gravity']) { const input=html.match(new RegExp('<input[^>]*id="'+id+'"[^>]*>'))[0];els[id].value=input.match(/value="([^"]*)"/)[1]; }els.speed.value='1';
  els.scene.parentElement={getBoundingClientRect:()=>({width:observedWidth})};els.scene.width=564;els.scene.height=342;
  const ctx={createImageData:(w,h)=>({width:w,height:h,data:new Uint8ClampedArray(w*h*4)}),putImageData(image){lastRender={width:image.width,height:image.height,hash:crypto.createHash('sha256').update(image.data).digest('hex')};}};
  els.scene.getContext=type=>{assert.equal(type,'2d');return ctx;};
  const document=Object.assign(target(),{hidden,getElementById:id=>{assert(els[id],'unknown element '+id);return els[id];}}),window=target(),preference=target();preference.matches=reduced;
  if(legacy){preference.addListener=fn=>preference.addEventListener('change',fn);}
  window.matchMedia=()=>legacy?{matches:reduced,addListener:preference.addListener}:preference;
  let observer=null;
  class ResizeObserver{constructor(fn){this.callback=fn;this.observing=false;observer=this;}observe(){this.observing=true;}disconnect(){this.observing=false;}}
  const sandbox={document,window,performance:{now:()=>now},console,Uint8ClampedArray,
    requestAnimationFrame(fn){const id=++seq;queue.set(id,fn);maxQueue=Math.max(maxQueue,queue.size);assert(queue.size<=1,'duplicate RAF chains');return id;},
    cancelAnimationFrame(id){queue.delete(id);}};
  if(!legacy)sandbox.ResizeObserver=ResizeObserver;
  vm.createContext(sandbox);
  for(const file of scripts){
    if(file==='app.js'){
      const playback=sandbox.ClockPlayback,motion=sandbox.ClockMotion,renderer=sandbox.ClockRenderer;
      sandbox.ClockPlayback={createController(options){controller=playback.createController(options);return controller;}};
      sandbox.ClockMotion={...motion,createSimulation(options){creates++;const sim=motion.createSimulation(options);return {...sim,stateAt(t){lastState=sim.stateAt(t);return lastState;}};}};
      sandbox.ClockRenderer={...renderer,render(context,bodies,options){renderCount++;return renderer.render(context,bodies,options);}};
    }
    vm.runInContext(sources[file],sandbox,{filename:file});
  }
  return {els,document,window,preference,sandbox,get observer(){return observer;},get lastState(){return lastState;},get lastRender(){return lastRender;},get renderCount(){return renderCount;},get creates(){return creates;},get maxQueue(){return maxQueue;},get queued(){return queue.size;},snapshot:()=>controller.snapshot(),
    at(t){now=t;},frame(dt=16){now+=dt;const scheduled=[...queue];queue.clear();for(const [,fn]of scheduled)fn(now);},
    event(id,type,value){if(value!==undefined)els[id].value=String(value);return els[id].emit(type);},
    resize(w){observedWidth=w;if(observer){if(observer.observing)observer.callback();}else window.emit('resize');},
    visibility(hidden){document.hidden=hidden;document.emit('visibilitychange');},
    reduced(value){preference.matches=value;preference.emit('change',{matches:value});}};
}

test('HTML load order exposes all globals; shared body and duration bounds are compatible',()=>{
  assert.deepEqual(scripts,['geometry-data.js','renderer.js','motion.js','playback.js','scene-config.js','app.js']);
  const config=require('./scene-config.js'),motion=require('./motion.js'),renderer=require('./renderer.js');
  assert(config.motion.maxBodies<=renderer.LIMITS.bodies,'scene-config must explicitly constrain motion maxBodies to renderer limit');
  assert(config.duration<=motion.DEFAULTS.maxSeconds);assert.match(html,new RegExp('max="'+config.duration+'"'));
  const sandbox={};vm.createContext(sandbox);assert.throws(()=>vm.runInContext(fs.readFileSync(path.join(root,'renderer.js'),'utf8'),sandbox),/Load geometry-data/);
  return {scripts,maxBodies:config.motion.maxBodies,rendererLimit:renderer.LIMITS.bodies,duration:config.duration};
});

test('Autoplay, repeated pause/play/replay, keyboard and speed maintain one RAF chain',()=>{
  const h=harness();assert.equal(h.snapshot().active,true);assert.equal(h.queued,1);assert.equal(h.els.loading.hidden,true);
  h.frame(100);assert(Math.abs(h.snapshot().time-.1)<1e-10);
  h.event('play','click');assert.equal(h.queued,0);const paused=h.snapshot().time;h.frame(500);assert.equal(h.snapshot().time,paused);
  h.event('play','click');h.event('speed','change',2);h.frame(100);assert(Math.abs(h.snapshot().time-(paused+.2))<1e-10);
  for(let i=0;i<8;i++){h.event('replay','click');assert.equal(h.snapshot().time,0);assert.equal(h.queued,1);}
  h.event('seek','input',12.5);assert.equal(h.snapshot().time,12.5);h.frame(50);assert(Math.abs(h.snapshot().time-12.6)<1e-10);
  const ignored=h.document.emit('keydown',{code:'Space',target:h.els.seek});assert.equal(ignored.prevented,undefined);assert.equal(h.snapshot().playing,true);
  const space=h.document.emit('keydown',{code:'Space',target:{tagName:'BODY'}});assert.equal(space.prevented,true);assert.equal(h.snapshot().playing,false);assert.equal(h.queued,0);
  return {maxQueuedRAF:h.maxQueue,renders:h.renderCount};
});

test('Hidden pages freeze across repeated interruptions and preserve pause intent',()=>{
  const h=harness();h.frame(100);const before=h.snapshot().time;
  h.visibility(true);assert.equal(h.queued,0);h.at(90000);h.visibility(false);assert.equal(h.snapshot().time,before);assert.equal(h.queued,1);h.frame(100);assert(Math.abs(h.snapshot().time-before-.1)<1e-10);
  h.event('play','click');h.visibility(true);h.at(150000);h.visibility(false);assert.equal(h.snapshot().playing,false);assert.equal(h.queued,0);
  h.visibility(true);h.event('replay','click');h.event('replay','click');assert.equal(h.queued,0);assert.equal(h.snapshot().time,0);
  h.visibility(false);assert.equal(h.queued,1);h.frame(50);assert(Math.abs(h.snapshot().time-.05)<1e-10);
  const initiallyHidden=harness({hidden:true});assert.equal(initiallyHidden.queued,0);assert.equal(initiallyHidden.snapshot().time,0);
  return {maxQueuedRAF:h.maxQueue};
});

test('Reduced-motion first load and dynamic changes stay static until explicit play',()=>{
  const h=harness({reduced:true});assert.equal(h.queued,0);assert.equal(h.snapshot().time,0);assert.equal(h.els.play.disabled,true);
  h.event('replay','click');h.event('seek','input',1.25);assert.equal(h.snapshot().time,1.25);assert.equal(h.queued,0);
  h.reduced(false);assert.equal(h.els['static-mode'].checked,false);assert.equal(h.els.play.disabled,false);assert.equal(h.queued,0);
  h.event('play','click');h.frame(100);assert.equal(h.snapshot().active,true);h.reduced(true);assert.equal(h.queued,0);assert.equal(h.snapshot().playing,false);
  h.els['static-mode'].checked=false;h.event('static-mode','change');assert.equal(h.queued,0);h.event('play','click');assert.equal(h.queued,1);
  return {maxQueuedRAF:h.maxQueue};
});

test('Invalid time, seed, and gravity submissions are atomic; valid apply repeats pixels',()=>{
  const h=harness();h.event('seek','input',.75);h.event('play','click');const original=h.snapshot(),state=JSON.stringify(h.lastState),image=h.lastRender.hash,renders=h.renderCount;
  const invalid=[['start-time','29:00:00'],['start-time','bad'],['seed','-1'],['seed','1.5'],['seed','4294967296'],['seed','NaN'],['gravity','Infinity'],['gravity','-1']];
  for(const [field,value]of invalid){const old=h.els[field].value;h.event(field,'input',value);const event=h.event('settings','submit');assert.equal(event.prevented,true);assert.match(h.els.status.textContent,/参数无效/);assert.equal(h.snapshot().time,original.time);assert.equal(h.snapshot().playing,original.playing);assert.equal(h.renderCount,renders);assert.equal(h.lastRender.hash,image);assert.equal(JSON.stringify(h.lastState),state);h.els[field].value=old;}
  h.els['start-time'].value='23:59:59';h.els.seed.value='0';h.els.gravity.value='800';h.event('settings','submit');assert.equal(h.snapshot().time,0);assert.equal(h.snapshot().playing,true);assert.match(h.els.scene.attrs['aria-label'],/23:59:59/);const first=h.lastRender.hash;
  h.event('seek','input',1.25);assert.equal(h.lastState.text,'000000');h.event('settings','submit');assert.equal(h.lastRender.hash,first);assert.equal(h.queued,1);
  return {invalidCases:invalid.length,maxQueuedRAF:h.maxQueue,repeatSHA256:first};
});

test('Empty numeric seed is rejected without replacing simulation',()=>{
  const h=harness();h.event('seek','input',.25);const before=h.lastRender.hash;h.els.seed.value='';h.event('settings','submit');assert.match(h.els.status.textContent,/参数无效/);assert.equal(h.snapshot().time,.25);assert.equal(h.lastRender.hash,before);
});

test('Pagehide cancels scheduling; repeated pageshow resumes once and refreshed size renders',()=>{
  const h=harness();h.frame(100);const before=h.snapshot().time;
  h.window.emit('pagehide');h.window.emit('pagehide');assert.equal(h.queued,0);assert.equal(h.observer.observing,false);h.at(200000);h.window.emit('pageshow');assert.equal(h.snapshot().time,before);assert.equal(h.queued,1);assert.equal(h.observer.observing,true);h.window.emit('pageshow');assert.equal(h.queued,1);
  h.frame(100);assert(Math.abs(h.snapshot().time-before-.1)<1e-10);
  for(const width of [100,280,564,720,1000]){h.resize(width);const expected=Math.max(280,Math.min(720,width));assert.equal(h.els.scene.width,expected);assert.equal(h.lastRender.width,expected);assert.equal(h.lastRender.height,Math.round(expected*342/564));assert.equal(h.queued,1);}
  h.event('play','click');h.window.emit('pagehide');h.at(300000);h.window.emit('pageshow');assert.equal(h.queued,0);assert.equal(h.snapshot().playing,false);
  return {maxQueuedRAF:h.maxQueue,dimensions:[h.lastRender.width,h.lastRender.height]};
});

test('Legacy media/resize fallback and repeated viewport changes retain RAF invariant',()=>{
  const h=harness({legacy:true});h.resize(600);assert.equal(h.lastRender.width,600);h.reduced(true);assert.equal(h.queued,0);h.resize(300);assert.equal(h.lastRender.width,300);h.reduced(false);assert.equal(h.queued,0);h.event('play','click');assert.equal(h.queued,1);
  return {maxQueuedRAF:h.maxQueue};
});

test('Duration endpoint renders within body bound and wraps with one active chain',()=>{
  const h=harness(),duration=h.snapshot().duration;let largest=0;
  for(const t of [0,8,16,24,duration]){h.event('seek','input',t);largest=Math.max(largest,h.lastState.bodies.length);assert(h.lastState.bodies.length<=48);assert.equal(h.lastState.time,t);assert.equal(h.queued,1);}
  assert.equal(h.snapshot().time,duration);h.frame(100);assert(Math.abs(h.snapshot().time-.1)<1e-9);assert.equal(h.snapshot().loops,1);
  h.event('replay','click');assert.equal(h.snapshot().time,0);assert.equal(h.snapshot().loops,0);
  return {largestBodyCount:largest,maxQueuedRAF:h.maxQueue};
});

const report={passed:results.every(r=>r.passed),total:results.length,node:process.version,note:'Fake DOM/RAF with actual browser-global motion/playback/renderer and ImageData shim. Does not certify browser visuals, CSS layout, native form validation, performance, BFCache delivery ordering, or assistive-technology behavior.',sourceSHA256:Object.fromEntries(scripts.map(file=>[file,crypto.createHash('sha256').update(sources[file]).digest('hex')])),changedDuringRun:scripts.filter(file=>sources[file]!==fs.readFileSync(path.join(root,file),'utf8')),results};
fs.writeFileSync(path.join(root,'assets/app-tests.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report,null,2));if(!report.passed)process.exitCode=1;
