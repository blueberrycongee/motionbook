import {scene,demoState} from './scene.mjs';
const art=document.getElementById('art'),replay=document.getElementById('replay');
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
let start=performance.now(),last=-1;
function paint(now){const t=reduced?0:(now-start)/1000,s=demoState(t),key=s.crossfade===undefined?s.frame:now;if(key!==last){art.innerHTML=scene(s);last=key;}requestAnimationFrame(paint);}
replay.addEventListener('click',()=>{start=performance.now();last=-1;});
requestAnimationFrame(paint);
