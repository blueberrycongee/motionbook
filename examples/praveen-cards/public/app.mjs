import {draw} from '../src/render.mjs';
const scene=document.createElement('canvas');scene.width=1440;scene.height=1080;const ctx=scene.getContext('2d');
const cards=[...document.querySelectorAll('[data-card]')],added=[false,false];let elapsed=0,last=0,paused=matchMedia('(prefers-reduced-motion: reduce)').matches,active=-1;
const detail=document.querySelector('#detail'),expanded=document.querySelector('#expanded'),pause=document.querySelector('#pause');
function paint(){draw(ctx,elapsed,scene.width,scene.height,{added});cards.forEach((canvas,i)=>canvas.getContext('2d').drawImage(scene,(i?1000:120)*.75,104*.75,800*.75,1234*.75,0,0,800,1234));if(active>=0)expanded.getContext('2d').drawImage(cards[active],0,0);}
let lastPaint=0;function frame(now){if(last&&!paused&&document.visibilityState==='visible')elapsed+=(now-last)/1000;last=now;if((!paused||!lastPaint)&&document.visibilityState==='visible'&&now-lastPaint>1000/30){paint();lastPaint=now}requestAnimationFrame(frame)}
function updatePause(){if(!pause)return;pause.textContent=paused?'Play':'Pause';pause.setAttribute('aria-pressed',String(paused))}updatePause();
pause?.addEventListener('click',()=>{paused=!paused;updatePause()});document.querySelector('#replay')?.addEventListener('click',()=>{elapsed=0;paint()});
document.querySelectorAll('[data-add]').forEach(button=>button.addEventListener('click',()=>{let i=+button.dataset.add;added[i]=!added[i];button.setAttribute('aria-pressed',String(added[i]));document.querySelector('#status').textContent=`${i?'Shanghai':'NYC'} card ${added[i]?'added':'removed'}.`;paint()}));
document.querySelectorAll('[data-expand]').forEach(button=>button.addEventListener('click',()=>{active=+button.dataset.expand;detail.showModal();paint()}));document.querySelector('#close').addEventListener('click',()=>detail.close());detail.addEventListener('close',()=>{active=-1});detail.addEventListener('click',event=>{if(event.target===detail)detail.close()});
document.addEventListener('visibilitychange',()=>last=0);requestAnimationFrame(frame);
