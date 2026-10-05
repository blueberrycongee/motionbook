import {scene,demoState,transition,DURATION} from './scene.mjs';
const visual=document.querySelector('#visual'),buttons=[...document.querySelectorAll('[role=tab]')],panel=document.querySelector('#panel'),motion=matchMedia('(prefers-reduced-motion: reduce)');
let values=[0,0],selected=0,hover=null,mode='demo',time=0,last=null;
function paint(){visual.innerHTML=scene({values});buttons.forEach((b,i)=>{b.setAttribute('aria-selected',String(i===selected));b.tabIndex=i===selected?0:-1;});panel.textContent=selected?'Attachments selected':'Emails selected';}
function choose(i){selected=i;mode='manual';if(motion.matches)values=[+(i===0),+(i===1)];paint();}
buttons.forEach((b,i)=>{b.addEventListener('click',()=>choose(i));b.addEventListener('pointerenter',()=>{hover=i;mode='manual';});b.addEventListener('pointerleave',()=>hover=null);b.addEventListener('focus',()=>choose(i));b.addEventListener('keydown',e=>{if(['ArrowLeft','ArrowRight','Home','End'].includes(e.key)){e.preventDefault();choose(e.key==='Home'?0:e.key==='End'?1:1-selected);buttons[selected].focus();}});});
addEventListener('keydown',e=>{if(e.key.toLowerCase()==='r'){mode='demo';time=0;values=[0,0];hover=null;paint();}});
function frame(now){const dt=last===null?0:Math.min(.1,(now-last)/1000);last=now;if(!motion.matches){time=(time+dt)%DURATION;if(mode==='demo')values=demoState(time).values;if(mode==='manual'){const active=hover??selected;values=transition(values,[+(active===0),+(active===1)],dt);}paint();}requestAnimationFrame(frame);}
paint();requestAnimationFrame(frame);
