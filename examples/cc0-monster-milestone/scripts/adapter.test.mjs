import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {createPlayer} from '../controller.js';
import {renderSVG,DURATION,stateAt} from '../motion.js';

// Run the actual app entry and real controller against an event/clock simulation.
// Only ESM import declarations are replaced by the already imported bindings.
// This has no browser layout, accessibility tree, native keyboard, or GPU model.
const html=fs.readFileSync(new URL('../index.html',import.meta.url),'utf8');
const entry=fs.readFileSync(new URL('../app.js',import.meta.url),'utf8')
  .replace(/^import [^\n]+;\n/gm,'');

function setup({reduced=false}={}){
  class Element{
    constructor(id,tagName='DIV'){this.id=id;this.tagName=tagName;this.events={};this.value='';this.textContent='';this.innerHTML='';this.checked=false;this.disabled=false;}
    addEventListener(name,fn){(this.events[name]??=[]).push(fn);}
    emit(name,props={}){const event={target:this,...props};for(const fn of this.events[name]||[])fn(event);return event;}
  }
  const nodes={};
  for(const match of html.matchAll(/<([\w-]+)\b[^>]*\bid="([^"]+)"[^>]*>/g)){
    const node=nodes[match[2]]=new Element(match[2],match[1].toUpperCase());
    node.value=/\bvalue="([^"]*)"/.exec(match[0])?.[1]??'';
  }
  const document=new Element('document'),window=new Element('window'),media=new Element('media');
  document.hidden=false;document.getElementById=id=>nodes[id];media.matches=reduced;
  let stamp=0,next=0;const frames=new Map();
  const factory=options=>createPlayer({...options,now:()=>stamp,
    requestFrame:fn=>{frames.set(++next,fn);return next;},cancelFrame:id=>frames.delete(id)});
  vm.runInNewContext(entry,{document,window,matchMedia:()=>media,createPlayer:factory,renderSVG,DURATION,stateAt},{filename:'app.js'});
  return {nodes,document,window,media,frames,player:window.__motionStudy.player,
    time(ms){stamp=ms;},
    tick(ms){stamp=ms;const pending=[...frames.values()];frames.clear();pending.forEach(fn=>fn(ms));},
    systemReduce(matches){media.matches=matches;media.emit('change',{matches});},
  };
}

export function runAdapterTests(test){
  test('Adapter initializes the actual app with one frame and current playback UI',()=>{
    const h=setup();assert.equal(h.frames.size,1);assert(h.player.getState().playing);assert.equal(h.nodes.play.textContent,'Pause');
    assert.equal(h.nodes.timeline.value,0);assert.match(h.nodes.stage.innerHTML,/<svg[^>]+role="img"/);
    h.tick(1000);assert.equal(h.nodes.timeline.value,1);assert.equal(h.nodes.time.value,'1.00 / 7.50 s');assert.equal(h.frames.size,1);
  });
  test('Adapter play, pause, end and rapid replay events keep UI and frame ownership synchronized',()=>{
    const h=setup();h.tick(1000);h.nodes.play.emit('click');assert.equal(h.nodes.play.textContent,'Play');assert.equal(h.frames.size,0);
    h.nodes.play.emit('click');assert.equal(h.nodes.play.textContent,'Pause');h.tick(9000);
    assert.equal(h.nodes.play.textContent,'Play');assert.equal(h.nodes.timeline.value,DURATION);assert.equal(h.frames.size,0);
    for(let i=0;i<5;i++)h.nodes.replay.emit('click');assert.equal(h.nodes.timeline.value,0);assert.equal(h.frames.size,1);
  });
  test('Adapter timeline input pauses and seeks the actual controller',()=>{
    const h=setup();h.nodes.timeline.value='3.8';h.nodes.timeline.emit('input');
    assert.equal(h.player.getState().time,3.8);assert(!h.player.getState().playing);assert.equal(h.frames.size,0);assert.equal(h.nodes.play.textContent,'Play');
  });
  test('Adapter speed change preserves the current position and resumes at the chosen rate',()=>{
    const h=setup();h.tick(1000);h.nodes.speed.value='2';h.nodes.speed.emit('change');
    assert.equal(h.player.getState().time,1);assert.equal(h.player.getState().speed,2);assert.equal(h.frames.size,1);
    h.tick(1500);assert.equal(h.player.getState().time,2);
  });
  test('Adapter initial reduced motion presents a static final state through all playback controls',()=>{
    const h=setup({reduced:true});assert(h.nodes.reduced.checked);assert(h.nodes.timeline.disabled);assert.equal(h.nodes.phase.textContent,'Static final state');
    for(const id of ['play','replay'])h.nodes[id].emit('click');h.nodes.timeline.value='0';h.nodes.timeline.emit('input');
    assert.equal(h.player.getState().time,DURATION);assert.equal(h.nodes.play.textContent,'Play');assert.equal(h.frames.size,0);
  });
  test('Adapter live system preference changes synchronize checkbox, phase and timeline without autoplay',()=>{
    const h=setup();h.tick(1000);h.systemReduce(true);
    assert(h.nodes.reduced.checked);assert(h.nodes.timeline.disabled);assert.equal(h.nodes.phase.textContent,'Static final state');assert.equal(h.frames.size,0);
    h.systemReduce(false);assert(!h.nodes.reduced.checked);assert(!h.nodes.timeline.disabled);assert.equal(h.nodes.timeline.value,0);
    assert.equal(h.nodes.phase.textContent,'count');assert.equal(h.nodes.play.textContent,'Play');assert.equal(h.frames.size,0);
  });
  test('Adapter explicit reduced-motion checkbox controls the real player',()=>{
    const h=setup();h.nodes.reduced.checked=true;h.nodes.reduced.emit('change');assert(h.player.getState().reducedMotion);assert.equal(h.frames.size,0);
    h.nodes.reduced.checked=false;h.nodes.reduced.emit('change');assert(!h.player.getState().reducedMotion);assert.equal(h.nodes.timeline.value,0);assert.equal(h.frames.size,0);
  });
  test('Adapter hidden-page pause holds its position until the user resumes',()=>{
    const h=setup();h.tick(500);h.document.hidden=true;h.document.emit('visibilitychange');assert.equal(h.nodes.play.textContent,'Play');assert.equal(h.frames.size,0);
    h.time(10000);h.document.hidden=false;h.document.emit('visibilitychange');assert.equal(h.player.getState().time,.5);assert.equal(h.frames.size,0);
    h.nodes.play.emit('click');h.tick(10500);assert.equal(h.player.getState().time,1);
  });
  test('Adapter pagehide without a prior visibility event pauses and synchronizes UI for bfcache restore',()=>{
    const h=setup();h.tick(500);h.window.emit('pagehide',{persisted:true});
    assert.equal(h.frames.size,0);assert(!h.player.getState().playing);assert.equal(h.nodes.play.textContent,'Play');
    h.time(10000);h.window.emit('pageshow',{persisted:true});assert.equal(h.nodes.play.textContent,'Play');assert.equal(h.player.getState().time,.5);
    h.nodes.play.emit('click');assert.equal(h.nodes.play.textContent,'Pause');h.tick(10500);assert.equal(h.player.getState().time,1);
  });
}
