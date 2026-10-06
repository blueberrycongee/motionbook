import {RibbonController,frameAt,DURATION,liveGeometry,lerp,clamp,PANEL_WIDTH} from './geometry.mjs';
import {ASSET_NAMES,makeTextures,drawRibbon} from './scene.mjs';
import {MOTION} from './motion.mjs';
const canvas=document.querySelector('#ribbon'),g=canvas.getContext('2d'),status=document.querySelector('#status');
const controller=new RibbonController();const reduce=matchMedia('(prefers-reduced-motion: reduce)');controller.reducedMotion=reduce.matches;
let autoplay=!reduce.matches,paused=false,time=0,last=performance.now(),textures=[],transition=null;
function size(){const d=Math.min(devicePixelRatio||1,1.5);canvas.width=Math.round(innerWidth*d);canvas.height=Math.round(innerHeight*d);}
function takeControl(){if(autoplay){const snapshot=frameAt(time,MOTION);controller.offset=snapshot.offset;controller.velocity=0;transition={snapshot,start:performance.now()};autoplay=false;}paused=false;}
function norm(e){return e.clientX/innerWidth;}
canvas.addEventListener('pointerdown',e=>{takeControl();controller.begin(norm(e),performance.now()/1000);canvas.setPointerCapture(e.pointerId);});
canvas.addEventListener('pointermove',e=>controller.move(norm(e),performance.now()/1000));
for(const event of['pointerup','pointercancel','lostpointercapture'])canvas.addEventListener(event,()=>controller.end());
canvas.addEventListener('wheel',e=>{e.preventDefault();takeControl();const delta=Math.abs(e.deltaX)>Math.abs(e.deltaY)?e.deltaX:e.deltaY;controller.wheel(Math.max(-.45,Math.min(.45,delta/1100)));},{passive:false});
canvas.addEventListener('keydown',e=>{if(['ArrowLeft','ArrowRight',' ','Escape','Home'].includes(e.key))e.preventDefault();if(e.key==='ArrowLeft'||e.key==='ArrowRight'){takeControl();controller.wheel(e.key==='ArrowLeft'?-.34:.34);}if(e.key===' '){if(!autoplay){autoplay=true;time=0;}else paused=!paused;}if(e.key==='Escape'||e.key==='Home'){controller.end();time=0;autoplay=!reduce.matches;paused=false;controller.offset=MOTION[0].offset;controller.velocity=0;}});
reduce.addEventListener('change',e=>{controller.reducedMotion=e.matches;if(e.matches){takeControl();controller.velocity=0;}});
document.querySelector('#fullscreen').addEventListener('click',async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await document.documentElement.requestFullscreen();}catch{status.textContent='Full screen is unavailable in this browser.'}});
addEventListener('resize',size);size();
try{await document.fonts.load('10px StudySans');const images=await Promise.all(ASSET_NAMES.map(name=>new Promise((resolve,reject)=>{const im=new Image();im.onload=()=>resolve(im);im.onerror=()=>reject(new Error(`Could not load ${name}`));im.src=new URL(`../assets/${name}`,import.meta.url).href;})));textures=makeTextures(images,(w,h)=>{const c=document.createElement('canvas');c.width=w;c.height=h;return c;});status.textContent='Ten original artworks. Drag or scroll to explore.';}catch(error){status.textContent=error.message;throw error;}
function tick(now){const dt=Math.min(.05,(now-last)/1000);last=now;if(!document.hidden){if(autoplay&&!paused)time=(time+dt)%DURATION;let state=autoplay?frameAt(time,MOTION):controller.step(paused?0:dt);if(!autoplay&&transition){const q=clamp((now-transition.start)/250),smooth=q*q*(3-2*q),old=transition.snapshot;state.panelWidth=lerp(old.panelWidth,PANEL_WIDTH,smooth);state.top=old.top.map((v,i)=>lerp(v,liveGeometry(i/32,state.velocity)[0],smooth));state.bottom=old.bottom.map((v,i)=>lerp(v,liveGeometry(i/32,state.velocity)[1],smooth));if(q===1)transition=null;}drawRibbon(g,textures,state,{width:canvas.width,height:canvas.height});}requestAnimationFrame(tick);}requestAnimationFrame(tick);
