import {SubscribeMotion,BUTTON,TIMING,shortcut} from './motion.mjs';
import {drawScene} from './draw.mjs';
const canvas=document.querySelector('canvas'),ctx=canvas.getContext('2d'),button=document.querySelector('#subscribe'),status=document.querySelector('#status');
const media=matchMedia('(prefers-reduced-motion: reduce)'),motion=new SubscribeMotion({reduced:media.matches});
const reduced=document.querySelector('#reduced');reduced.checked=media.matches;
const now=()=>performance.now()/1000;
motion.replay(now());
let prior='',raf=0,timer=0,generation=0,disposed=false;
function stopScheduling(){
  generation++;
  if(raf)cancelAnimationFrame(raf);
  if(timer)clearTimeout(timer);
  raf=timer=0;
}
function schedule(s){
  if(disposed || document.hidden)return;
  const cueEnd=motion.cueAt===null?0:motion.cueAt+1.2;
  const hintEnd=motion.hintAt===null||s.subscribed?0:motion.hintAt+TIMING.hintEnd-TIMING.hint;
  const rewardEnd=motion.clickedAt===null?0:motion.clickedAt+TIMING.settle;
  // Keep the authored landscape moving through the normal 5.4 s demo.
  // Explicit manual cues/rewards animate only until their own sequence settles.
  const end=Math.max(motion.autoplay?TIMING.duration:0,cueEnd,hintEnd,rewardEnd);
  const token=generation;
  if(!s.reduced && s.t<end){
    raf=requestAnimationFrame(()=>{if(token!==generation)return;raf=0;render();});
    return;
  }
  // Reduced motion still needs timed cue visibility and simulated activation.
  const events=[];
  if(motion.cueAt!==null)events.push(motion.cueAt,cueEnd);
  if(!s.subscribed && motion.hintAt!==null)events.push(motion.hintAt,hintEnd);
  if(!s.subscribed && motion.autoplay)events.push(TIMING.click);
  const next=Math.min(...events.filter(t=>t>s.t));
  if(Number.isFinite(next))timer=setTimeout(()=>{if(token!==generation)return;timer=0;render();},Math.max(1,(next-s.t)*1000));
}
function render(){
  if(disposed || document.hidden)return;
  const s=motion.snapshot(now());drawScene(ctx,s);
  button.setAttribute('aria-pressed',String(s.subscribed));
  button.setAttribute('aria-label',s.subscribed?'Subscribed; notifications enabled (simulation)':'Subscribe (simulation)');
  button.dataset.phase=s.phase;
  button.style.left=`${(BUTTON.x+BUTTON.width-s.width)/720*100}%`;button.style.width=`${s.width/720*100}%`;
  const next=s.phase==='subscribed'?'Subscribed. Notifications enabled in this simulation.':s.phase==='reward'?'Subscribed.':s.phase==='hint'?'The simulated video cue highlights Subscribe.':'Ready.';
  if(next!==prior){status.textContent=next;prior=next;}
  schedule(s);
}
function wake(){stopScheduling();render();}
button.addEventListener('click',()=>{motion.subscribe(now());wake();});
document.querySelector('#replay').addEventListener('click',()=>{motion.replay(now());wake();});
document.querySelector('#reset').addEventListener('click',()=>{motion.reset(now());wake();});
document.querySelector('#cue').addEventListener('click',()=>{motion.cue(now());wake();});
reduced.addEventListener('change',()=>{motion.setReduced(reduced.checked);wake();});
media.addEventListener('change',e=>{reduced.checked=e.matches;motion.setReduced(e.matches);wake();});
document.addEventListener('keydown',e=>{const action=shortcut(e);if(action){e.preventDefault();motion[action](now());wake();}});
document.addEventListener('visibilitychange',()=>{if(document.hidden)stopScheduling();else wake();});
window.addEventListener('pagehide',()=>{disposed=true;stopScheduling();});
window.addEventListener('pageshow',e=>{if(e.persisted){disposed=false;wake();}});
render();
