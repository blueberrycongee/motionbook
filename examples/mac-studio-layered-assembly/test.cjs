/* Offline runtime verification. These DOM mocks do not replace browser interaction QA. */
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const {createCanvas}=require('@napi-rs/canvas');const Scene=require('./scene.js');
const hashes=[];for(const p of [0,.25,.5,.75,1,.75,.5,.25,0]){const c=createCanvas(900,560);Scene.render(c.getContext('2d'),900,560,p);hashes.push(crypto.createHash('sha256').update(c.toBuffer('image/png')).digest('hex'));}for(let i=0;i<4;i++)assert.equal(hashes[i],hashes[8-i]);
for(const [w,h] of [[390,620],[900,560],[1440,800]]){const c=createCanvas(w,h);for(const p of [0,.25,.5,.75,1])Scene.render(c.getContext('2d'),w,h,p);}
assert.equal(Scene.state(-1).progress,0);assert.equal(Scene.state(3).progress,1);assert.equal(Scene.state(NaN).progress,0);
function runtime(reduced){const canvas=createCanvas(900,560),events=new Map(),rAF=new Map();let uid=0,top=0;
 function element(){return {value:0,textContent:'',attrs:{},events:new Map(),setAttribute(k,v){this.attrs[k]=v},addEventListener(k,v){this.events.set(k,v)},removeEventListener(k){this.events.delete(k)}}}
 const elements=Object.fromEntries(['progress','value','play','reset','status'].map(k=>[k,element()]));canvas.getBoundingClientRect=()=>({width:900,height:560});elements.scene=canvas;
 const media={matches:reduced,fn:null,addEventListener(k,v){this.fn=v},removeEventListener(){this.fn=null}};const section={offsetHeight:2435.2,getBoundingClientRect:()=>({top})};
 const box={console,MotionScene:Scene,document:{getElementById:k=>elements[k],querySelector:()=>section},matchMedia:()=>media,devicePixelRatio:1,innerHeight:761,ResizeObserver:class {observe(){}disconnect(){}},requestAnimationFrame:fn=>{rAF.set(++uid,fn);return uid},cancelAnimationFrame:id=>rAF.delete(id),addEventListener:(k,fn)=>events.set(k,fn),removeEventListener:k=>events.delete(k)};box.window=box;vm.createContext(box);vm.runInContext(fs.readFileSync(__dirname+'/motion.js','utf8'),box);
 const fire=(el,type)=>elements[el].events.get(type)();const flush=t=>{const pending=[...rAF.values()];rAF.clear();pending.forEach(fn=>fn(t));};flush(1);
 for(const p of [0,.25,.75,.1,1]){box.MOTION.setProgress(p);assert.equal(box.MOTION.getState().progress,p);}
 elements.progress.value=440;fire('progress','input');assert.equal(box.MOTION.getState().progress,.44);
 fire('reset','click');assert.equal(box.MOTION.getState().progress,0);
 if(reduced){fire('play','click');assert.equal(box.MOTION.getState().progress,1);assert.equal(box.MOTION.getState().playing,false);assert.equal(elements.play.textContent,'Next view');top=-800;events.get('scroll')();assert.equal(box.MOTION.getState().progress,1);}
 else{fire('play','click');flush(1000);flush(4500);assert.equal(box.MOTION.getState().progress,.5);flush(8000);assert.equal(box.MOTION.getState().progress,1);assert.equal(box.MOTION.getState().playing,false);top=-837.1;events.get('scroll')();flush(8100);assert(Math.abs(box.MOTION.getState().progress-.5)<.001);top=-418.55;events.get('scroll')();flush(8200);assert(Math.abs(box.MOTION.getState().progress-.25)<.001);}
 box.MOTION.destroy();assert.equal(events.size,0);assert.equal(elements.play.events.size,0);flush(9999);return true;
}
runtime(false);runtime(true);
console.log(JSON.stringify({scene:Scene.meta.id,syntax:'loaded',reversePixelIdentity:true,responsiveRenderSizes:['390×620','900×560','1440×800'],domMockChecks:['seek','range input','reset','play completion','reverse scroll','reduced motion','destroy'],browserQA:'not run; offline Canvas and DOM-harness checks only'},null,2));
