'use strict';
const stage=document.getElementById('stage');
const share=document.getElementById('share');
const close=document.getElementById('close');
const clip=document.getElementById('clip');
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
let started=performance.now(),activated=started,last=started,mode='auto',hoverTarget=1,fan=1;
share.addEventListener('click',()=>{mode='opening';activated=performance.now();hoverTarget=1;fan=1;});
function dismiss(){mode='closed';share.focus();}
function hover(value){mode='hold';hoverTarget=value;}
close.addEventListener('click',dismiss);
clip.addEventListener('pointerenter',()=>hover(0));
clip.addEventListener('pointerleave',()=>hover(1));
clip.addEventListener('focus',()=>hover(0));
clip.addEventListener('blur',()=>hover(1));
clip.addEventListener('click',()=>hover(1-hoverTarget));
addEventListener('keydown',e=>{if(e.key==='Escape')dismiss();});
function frame(now){
 const dt=Math.min(.05,(now-last)/1000);last=now;
 let s;
 if(mode==='closed')s={panel:0,paper:0,ink:0,clip:0,clipY:0,clipFront:true,fan:0};
 else if(mode==='hold'){s=Scene.state(3.2);fan+=(hoverTarget-fan)*(reduced?1:1-Math.exp(-20*dt));s.fan=fan;}
 else if(mode==='opening')s=Scene.state(reduced?3.2:Math.min(3.2,(now-activated)/1000+.76));
 else s=Scene.state(reduced?3.2:(now-started)/1000);
 stage.innerHTML=Scene.svg(0,s);share.setAttribute('aria-expanded',String(s.panel>.5));close.hidden=s.panel<.1;clip.hidden=s.clip<.1;requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
