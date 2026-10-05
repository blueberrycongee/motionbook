import {drawScene} from './scene.mjs';
const canvas=document.querySelector('canvas'),ctx=canvas.getContext('2d');
const makeCanvas=(w,h)=>{const c=document.createElement('canvas');c.width=w;c.height=h;return c;};
const motion=matchMedia('(prefers-reduced-motion: reduce)');
let paused=motion.matches,time=0,last=performance.now();
function render(now){if(!paused)time+=(now-last)/1000;last=now;drawScene(ctx,time,makeCanvas);requestAnimationFrame(render);}
function toggle(){paused=!paused;}
canvas.addEventListener('click',toggle);canvas.addEventListener('keydown',e=>{if(e.code==='Space'){e.preventDefault();toggle();}});
motion.addEventListener('change',e=>{paused=e.matches;});
requestAnimationFrame(render);
