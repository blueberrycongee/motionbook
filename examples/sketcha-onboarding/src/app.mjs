import {OnboardingController,TIMES,WIDTH,HEIGHT} from './motion.mjs';
import {configureRenderer,drawScene} from './scene.mjs';
const canvas=document.querySelector('#scene'),ctx=canvas.getContext('2d');
const cat=document.querySelector('#cat'),menu=document.querySelector('#menu'),status=document.querySelector('#status');
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const state=new OnboardingController({reducedMotion:reduced.matches});
configureRenderer(Path2D);
let frame=0,pressed=-1,menuShown=false,dpr=2,lastNow=performance.now(),hiddenAt=null;
const initialTime=performance.now();
function resize(){const r=canvas.getBoundingClientRect();dpr=Math.min(3,Math.max(1,devicePixelRatio||1));canvas.width=Math.round(r.width*dpr);canvas.height=Math.round(r.height*dpr);ctx.setTransform(canvas.width/WIDTH,0,0,canvas.height/HEIGHT,0,0);paint(performance.now());}
function showMenu(){if(menuShown)return;menuShown=true;menu.hidden=false;cat.hidden=true;document.body.dataset.menu='true';status.textContent='Sketcha，入场完成。';}
function paint(now){lastNow=now;const t=state.time(now);drawScene(ctx,t,{idleTime:(now-initialTime)/1000,pressed});if(t>=TIMES.finish)showMenu();}
function loop(now){paint(now);if(state.state!=='menu'&&!document.hidden)frame=requestAnimationFrame(loop);else frame=0;}
function resume(){if(!frame&&!document.hidden)frame=requestAnimationFrame(loop);}
function enter(){if(state.tap(performance.now())){cat.disabled=true;status.textContent='小猫正在进入。';resume();}}
function reset(){cancelAnimationFrame(frame);frame=0;state.reset();menuShown=false;menu.hidden=true;cat.hidden=false;cat.disabled=false;pressed=-1;document.body.dataset.menu='false';status.textContent='戳一下小猫。';resume();}
cat.addEventListener('click',enter);
document.querySelector('#replay').addEventListener('click',reset);
menu.querySelectorAll('[data-press]').forEach(button=>{
 button.addEventListener('pointerdown',()=>{pressed=Number(button.dataset.press);paint(performance.now());});
 const clear=()=>{pressed=-1;paint(performance.now());};button.addEventListener('pointerup',clear);button.addEventListener('pointercancel',clear);button.addEventListener('pointerleave',clear);
 button.addEventListener('click',()=>{status.textContent=button.getAttribute('aria-label')+'。此交互研究展示至菜单。';});
});
window.addEventListener('keydown',e=>{if(e.key.toLowerCase()==='r'||e.key==='Escape'){e.preventDefault();reset();cat.focus({preventScroll:true});}});
reduced.addEventListener('change',e=>{if(e.matches){state.reduce(performance.now());paint(performance.now());}else state.reducedMotion=false;});
document.addEventListener('visibilitychange',()=>{if(document.hidden){hiddenAt=performance.now();cancelAnimationFrame(frame);frame=0;}else{if(hiddenAt!==null&&state.state==='animating')state.startedAt+=performance.now()-hiddenAt;hiddenAt=null;resume();}});
new ResizeObserver(resize).observe(canvas);
await Promise.all([document.fonts.load('400 18px "Study Sans"'),document.fonts.load('700 31px "Study Sans"'),document.fonts.load('400 18px "Study CJK"')]);
resize();resume();
const params=new URLSearchParams(location.search);if(params.get('autoplay')==='1')setTimeout(enter,1000);
// Deterministic browser-QA hook. This drives the same renderer used by all interactions.
window.sketchaStudy={reset,enter,snapshot:()=>({state:state.state,time:state.time(performance.now()),menuShown,reducedMotion:state.reducedMotion}),seek:t=>{cancelAnimationFrame(frame);frame=0;drawScene(ctx,Number(t));},version:'1.1.0'};
