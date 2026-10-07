'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),{mount}=require('../src/app'),M=require('../src/motion'),S=require('../src/scene');
class E{constructor(id,tag='DIV'){this.id=id;this.tagName=tag;this.events={};this.hidden=false;this.value='';this.checked=false;this.innerHTML='';this.textContent='';this.captures=new Set();this.focused=false;}addEventListener(n,f){(this.events[n]??=[]).push(f);}removeEventListener(n,f){this.events[n]=(this.events[n]||[]).filter(x=>x!==f);}emit(n,e={}){e={target:this,preventDefault(){this.prevented=true;},...e};for(const f of this.events[n]||[])f(e);return e;}getBoundingClientRect(){return {left:10,top:20,width:250,height:444};}setPointerCapture(id){this.captures.add(id);}hasPointerCapture(id){return this.captures.has(id);}releasePointerCapture(id){this.captures.delete(id);this.emit('lostpointercapture',{pointerId:id});}focus(){this.focused=true;}}
function setup(reduced=false){const ids=['stage','seek','play','draft','edit-controls','clock','phase','replay','reset','repeat','save','cancel'],nodes=Object.fromEntries(ids.map(id=>[id,new E(id,['draft','seek','repeat'].includes(id)?'INPUT':['play','replay','reset','save','cancel'].includes(id)?'BUTTON':'DIV')]));const doc=new E('doc');doc.hidden=false;doc.getElementById=id=>nodes[id];let t=0,next=1;const q=new Map(),pref=new E('preference');pref.matches=reduced;const win=new E('window');win.performance={now:()=>t};win.matchMedia=()=>pref;win.requestAnimationFrame=f=>{const id=next++;q.set(id,f);return id;};win.cancelAnimationFrame=id=>q.delete(id);const app=mount(doc,win,M,S);return {app,c:app.controller,nodes,doc,win,pref,q,tick(time){t=time;const todo=[...q.values()];q.clear();todo.forEach(f=>f(time));},time(time){t=time;},pointer(n,e){return nodes.stage.emit(n,{button:0,isPrimary:true,pointerId:1,clientX:235,clientY:439.5,...e});}};}
test('adapter paints the shared SVG and has at most one pending frame',()=>{const h=setup();assert.match(h.nodes.stage.innerHTML,/<svg/);assert.equal(h.q.size,1);h.app.draw();h.app.draw();assert.equal(h.q.size,1);h.tick(100);assert.equal(h.q.size,1);h.app.dispose();assert.equal(h.q.size,0);});
test('visible replay/play/seek controls operate the actual controller',()=>{const h=setup();h.tick(1000);h.nodes.play.emit('click');assert(!h.c.playing);h.nodes.seek.value='3.5';h.nodes.seek.emit('input');assert.equal(h.c.time,3.5);h.nodes.replay.emit('click');assert(h.c.playing);assert.equal(h.c.time,0);h.app.dispose();});
test('responsive pointer coordinates map to the source viewbox',()=>{const h=setup();h.nodes.reset.emit('click');h.pointer('pointerdown');assert(h.c.pointer);assert(Math.abs(h.c.pointer.x-450)<.01);h.pointer('pointermove',{clientX:150,clientY:270});assert.equal(h.c.pointer.x,280);assert.equal(h.c.pointer.y,500);h.pointer('pointerup');h.tick(500);assert.equal(h.c.mode,'editing');assert.equal(h.nodes.draft.hidden,false);assert(h.nodes.draft.focused);h.app.dispose();});
test('secondary buttons and nonprimary touches never begin capture',()=>{const h=setup();h.nodes.reset.emit('click');h.pointer('pointerdown',{button:2});assert.equal(h.c.pointer,null);h.pointer('pointerdown',{isPrimary:false});assert.equal(h.c.pointer,null);h.app.dispose();});
test('pointer cancel and capture loss clean up ownership',()=>{for(const ev of['pointercancel','lostpointercapture']){const h=setup();h.nodes.reset.emit('click');h.pointer('pointerdown');h.pointer(ev);assert.equal(h.c.pointer,null);h.app.dispose();}});
test('pointerup capture release does not cancel a successful editor transition',()=>{const h=setup();h.nodes.reset.emit('click');h.pointer('pointerdown');h.pointer('pointerup');assert.equal(h.c.mode,'transition');h.tick(500);assert.equal(h.c.mode,'editing');h.app.dispose();});
test('input text and Enter save a task exactly once',()=>{const h=setup();h.nodes.reset.emit('click');h.doc.emit('keydown',{target:h.nodes.stage,key:'Enter'});h.tick(500);h.nodes.draft.value='Original test title';h.nodes.draft.emit('input');h.doc.emit('keydown',{target:h.nodes.draft,key:'Enter'});h.tick(1000);assert.equal(h.c.mode,'committed');assert.equal(h.c.title,'Original test title');assert.equal(h.c.commits,1);assert(h.nodes.draft.hidden);h.app.dispose();});
test('Escape from input cancels without creating a task',()=>{const h=setup();h.nodes.reset.emit('click');h.doc.emit('keydown',{target:h.nodes.stage,key:'Enter'});h.tick(500);h.nodes.draft.value='Discard me';h.doc.emit('keydown',{target:h.nodes.draft,key:'Escape'});h.tick(1000);assert.equal(h.c.mode,'reference');assert.equal(h.c.commits,0);h.app.dispose();});
test('arrow shortcuts never intercept range or editable elements',()=>{const h=setup();h.nodes.play.emit('click');h.doc.emit('keydown',{target:h.nodes.seek,key:'ArrowRight'});assert.equal(h.c.time,0);h.doc.emit('keydown',{target:h.nodes.stage,key:'ArrowRight'});assert.equal(h.c.time,1/30);h.app.dispose();});
test('hidden page cancels pending animation and resumes at preserved source time',()=>{const h=setup();h.tick(1000);h.doc.hidden=true;h.doc.emit('visibilitychange');assert.equal(h.q.size,0);h.time(20000);h.doc.hidden=false;h.doc.emit('visibilitychange');assert.equal(h.c.time,1);assert.equal(h.q.size,1);h.app.dispose();});
test('pagehide/pageshow freeze rather than consume hidden elapsed time',()=>{const h=setup();h.tick(1500);h.win.emit('pagehide');h.time(25000);h.win.emit('pageshow');assert.equal(h.c.time,1.5);h.app.dispose();});
test('system reduced motion disables autoplay but leaves explicit frame review',()=>{const h=setup(true);assert.equal(h.q.size,0);assert(h.nodes.play.disabled);h.nodes.seek.value='2.4';h.nodes.seek.emit('input');assert.equal(h.c.time,2.4);h.pref.emit('change',{matches:false});assert(!h.nodes.play.disabled);assert(!h.c.playing);h.app.dispose();});
test('disposal removes listeners and prevents stale scheduled rendering',()=>{const h=setup();h.app.dispose();const t=h.c.time;h.nodes.replay.emit('click');h.tick(7000);assert.equal(h.c.time,t);assert.equal(h.q.size,0);});

test('IME confirmation never submits or cancels a draft before composition ends',()=>{
 for(const composition of [{isComposing:true},{keyCode:229}]){
  const h=setup();h.nodes.reset.emit('click');h.doc.emit('keydown',{target:h.nodes.stage,key:'Enter'});h.tick(500);
  h.nodes.draft.value='中文输入';h.nodes.draft.emit('input');
  for(const key of ['Enter','Escape']){
   const e=h.doc.emit('keydown',{target:h.nodes.draft,key,...composition});
   assert(!e.prevented);assert.equal(h.c.mode,'editing');assert.equal(h.c.commits,0);assert(!h.nodes.draft.hidden);
  }
  h.doc.emit('keydown',{target:h.nodes.draft,key:'Enter',isComposing:false});h.tick(1000);
  assert.equal(h.c.mode,'committed');assert.equal(h.c.title,'中文输入');assert.equal(h.c.commits,1);h.app.dispose();
 }
});

test('holding Enter after save cannot reset the task or open a second editor',()=>{
 for(const reduced of [false,true]){
  const h=setup(reduced);h.nodes.reset.emit('click');h.doc.emit('keydown',{target:h.nodes.stage,key:'Enter'});h.tick(500);
  h.nodes.draft.value='Keep this task';h.nodes.draft.emit('input');h.doc.emit('keydown',{target:h.nodes.draft,key:'Enter'});
  assert(h.nodes.stage.focused);assert.equal(h.c.commits,1);
  for(let i=0;i<5;i++)assert(h.doc.emit('keydown',{target:h.nodes.stage,key:'Enter',repeat:true}).prevented);
  h.tick(1000);assert.equal(h.c.mode,'committed');assert.equal(h.c.title,'Keep this task');assert(h.nodes.draft.hidden);
  h.doc.emit('keydown',{target:h.nodes.stage,key:'Enter',repeat:true});assert.equal(h.c.mode,'committed');assert.equal(h.c.commits,1);h.app.dispose();
 }
});

test('held Enter does not restart opening and held Space does not toggle playback',()=>{
 const h=setup();h.nodes.reset.emit('click');h.doc.emit('keydown',{target:h.nodes.stage,key:'Enter'});h.tick(100);
 h.doc.emit('keydown',{target:h.nodes.stage,key:'Enter',repeat:true});assert.equal(h.c.transition.start,0);
 h.tick(400);assert.equal(h.c.mode,'editing');
 h.nodes.reset.emit('click');h.doc.emit('keydown',{target:h.nodes.stage,key:' '});assert(h.c.playing);
 assert(h.doc.emit('keydown',{target:h.nodes.stage,key:' ',repeat:true}).prevented);assert(h.c.playing);
 h.doc.emit('keydown',{target:h.nodes.stage,key:'ArrowRight',repeat:true});assert.equal(h.c.time,1/30);h.app.dispose();
});

test('Escape cancels from either editor button and returns focus without committing',()=>{
 for(const id of ['save','cancel']){
  const h=setup();h.nodes.reset.emit('click');h.doc.emit('keydown',{target:h.nodes.stage,key:'Enter'});h.tick(500);
  h.nodes.draft.value='Discard this task';h.nodes.draft.emit('input');h.nodes[id].focus();
  assert(h.doc.emit('keydown',{target:h.nodes[id],key:'Escape'}).prevented);assert(h.nodes.stage.focused);
  const transition=h.c.transition;h.doc.emit('keydown',{target:h.nodes.stage,key:'Escape',repeat:true});assert.equal(h.c.transition,transition);
  h.tick(1000);assert.equal(h.c.mode,'reference');assert.equal(h.c.commits,0);assert.equal(h.c.draft,'');h.app.dispose();
 }
});

test('system preference status updates in both directions without a phase change',()=>{
 const h=setup(true);assert.equal(h.nodes.phase.textContent,'Reduced motion · still-frame review');
 h.pref.emit('change',{matches:false});assert.equal(h.nodes.phase.textContent,'rest');assert(!h.nodes.play.disabled);assert(!h.c.playing);
 h.pref.emit('change',{matches:true});assert.equal(h.nodes.phase.textContent,'Reduced motion · still-frame review');assert(h.nodes.play.disabled);assert.equal(h.q.size,0);h.app.dispose();
});

test('visibility and bfcache freeze opening, saving and cancellation transitions',()=>{
 for(const lifecycle of ['visibility','bfcache'])for(const action of ['open','save','cancel']){
  const h=setup();h.nodes.reset.emit('click');h.doc.emit('keydown',{target:h.nodes.stage,key:'Enter'});
  let start=0,duration=400;
  if(action!=='open'){
   h.tick(500);h.nodes.draft.value='Preserved task';h.nodes.draft.emit('input');h.nodes[action].emit('click');start=500;if(action==='cancel')duration=300;
  }
  h.tick(start+100);const before=h.nodes.stage.innerHTML;
  if(lifecycle==='visibility'){h.doc.hidden=true;h.doc.emit('visibilitychange');}else h.win.emit('pagehide');
  assert.equal(h.q.size,0);h.time(start+5100);assert.equal(h.c.mode,'transition');
  if(lifecycle==='visibility'){h.doc.hidden=false;h.doc.emit('visibilitychange');}else h.win.emit('pageshow');
  assert.equal(h.nodes.stage.innerHTML,before,action+' keeps its exact visible pose');assert.equal(h.c.mode,'transition');assert.equal(h.q.size,1);
  h.tick(start+5000+duration);assert.equal(h.c.mode,action==='open'?'editing':action==='save'?'committed':'reference');h.app.dispose();
 }
});
