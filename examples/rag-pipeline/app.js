'use strict';
const stage=document.getElementById('stage'),run=document.getElementById('run'),reset=document.getElementById('reset'),reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
let started=performance.now(),mode='auto';
function start(){mode='run';started=performance.now()-680;}
function clear(){mode='ready';}
run.addEventListener('click',start);reset.addEventListener('click',clear);
addEventListener('keydown',event=>{if(event.key==='Escape')clear();});
function frame(now){let t=(now-started)/1000;if(mode==='run')t=Math.min(18,t);if(mode==='ready')t=1;if(reduce)t=mode==='run'?18:1;const s=(mode==='ready'||(reduce&&mode!=='run'))?Scene.ready():Scene.state(t);stage.innerHTML=Scene.svg(t,s);run.style.left=((658+34*s.buttonPhase)/1080*100)+'%';run.style.width=((125-34*s.buttonPhase)/1080*100)+'%';run.style.top=((s.y+s.height-57)/852*100)+'%';run.setAttribute('aria-label',s.done?'Replay pipeline':'Run pipeline');reset.hidden=!s.done;reset.style.top=((s.y+s.height-57)/852*100)+'%';requestAnimationFrame(frame);}
requestAnimationFrame(frame);
