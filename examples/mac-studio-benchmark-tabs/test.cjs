'use strict';
const assert=require('assert'),fs=require('fs'),vm=require('vm'),{createCanvas}=require('@napi-rs/canvas');
const scene=require('./scene.cjs');
const pixels=createCanvas(1188,761),ctx=pixels.getContext('2d');
class Element{constructor(){this.style={};this.attrs={};this.events={};this.children=[];this.clientWidth=1188;this.clientHeight=761;}addEventListener(k,f){(this.events[k]??=[]).push(f);}removeEventListener(k,f){this.events[k]=(this.events[k]||[]).filter(g=>g!==f);}setAttribute(k,v){this.attrs[k]=v;}appendChild(e){this.children.push(e);}focus(){this.focused=true;}fire(k,e={}){for(const f of this.events[k]||[])f(e);}}
const ids={};for(const id of ['stage','scene','tabs','replay','panel','status','panel-title','description','values'])ids[id]=new Element();ids.scene.getContext=()=>ctx;
const media=new Element();media.matches=false;const win=new Element();win.MotionScene=scene;win.devicePixelRatio=1;win.matchMedia=()=>media;
let now=0,next=0;const q=new Map();const box={window:win,document:{getElementById:id=>ids[id],createElement:tag=>tag==='canvas'?createCanvas(1,1):new Element()},requestAnimationFrame:f=>{q.set(++next,f);return next;},cancelAnimationFrame:id=>q.delete(id),performance:{now:()=>now},console};vm.runInNewContext(fs.readFileSync(__dirname+'/motion.js','utf8'),box);
const m=win.MOTION;assert.equal(m.getState().tab,2);
m.setProgress(.25);assert.equal(m.getState().tab,0);assert(m.getState().bars[0]>m.getState().bars[1]);m.seek(3);assert.equal(m.getState().tab,1);
for(let i=0;i<scene.tabs.length;i++){m.setTab(i);assert.equal(m.getState().tab,i);assert.equal(ids.tabs.children[i].attrs['aria-selected'],'true');assert.equal(ids.tabs.children.filter(b=>b.tabIndex===0).length,1);}
ids.tabs.children[2].fire('click');const stale=[...q.values()][0];now=80;ids.tabs.children[0].fire('click');now=110;ids.tabs.children[4].fire('click');stale(2000);assert.equal(m.getState().tab,4);assert.equal(q.size,1);now=2110;const latest=[...q.values()][0];q.clear();latest(now);assert.equal(m.getState().tab,4);assert.equal(m.getState().playing,false);
let prevented=false;ids.tabs.children[4].fire('keydown',{key:'Home',preventDefault:()=>prevented=true});assert(prevented);assert.equal(m.getState().tab,0);ids.tabs.children[0].fire('keydown',{key:'End',preventDefault(){}});assert.equal(m.getState().tab,4);
media.matches=true;media.fire('change');assert.deepEqual([...m.getState().bars],[1,1,1]);assert.equal(m.getState().playing,false);m.setTab(1,0);assert.equal(m.getState().progress,1);
ids.stage.clientWidth=390;ids.stage.clientHeight=780;win.fire('resize');assert(parseInt(ids.stage.style.height)>=650);assert(ids.tabs.children.every(b=>parseFloat(b.style.left)+parseFloat(b.style.width)<=391));
const last=m.getState().tab;m.destroy();m.setTab(0);ids.tabs.children[0].fire('click');assert.equal(m.getState().tab,last);assert.equal(m.getState().destroyed,true);
for(const p of [-1,0,.1,.5,1,2,NaN])assert(scene.state(p).bars.every(v=>v>=0&&v<=1));assert.equal(scene.state(0).tab,2);assert.equal(scene.state(.25).tab,0);assert.equal(scene.state(1).tab,1);
const early=scene.state(0,{tab:0,transitionProgress:.35});assert(early.bars[0]>early.bars[1]&&early.bars[1]>early.bars[2]);
for(const [w,h] of [[1188,761],[720,600],[390,800]]){const c=createCanvas(w,h);for(const p of [0,.1,.25,.5,.75,1])scene.render(c.getContext('2d'),w,h,p);}
console.log('PASS 03-stats: deterministic timeline; source stagger; all tabs; rapid interruption; keyboard Home/End; reduced motion; responsive hitboxes; resize; destroy; 18 offline renders. Browser UI not exercised.');
