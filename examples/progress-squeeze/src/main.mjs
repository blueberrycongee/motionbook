import {scene,demoState,reduce,DURATION} from './scene.mjs';
const stage=document.querySelector('#visual'),button=document.querySelector('#toggle'),readout=document.querySelector('#readout');
const reduceMotion=matchMedia('(prefers-reduced-motion: reduce)');
let mode='demo',elapsed=0,state=demoState(0),last=null,lastValue=-1;
function paint(){stage.innerHTML=scene(state);button.setAttribute('aria-label',state.paused?'Resume progress':'Pause progress');button.setAttribute('aria-pressed',String(state.paused));const value=Math.floor(state.progress*100);if(value!==lastValue){readout.textContent=`${value}%${state.paused?', paused':''}`;lastValue=value;}}
function toggle(){mode='manual';state=reduce(state,{type:'toggle'});paint();}
function replay(){mode='demo';elapsed=0;state=demoState(0);last=null;paint();}
button.addEventListener('click',toggle);
addEventListener('keydown',e=>{if(e.code==='Space'&&e.target!==button){e.preventDefault();toggle();}if(e.key.toLowerCase()==='r')replay();});
function frame(now){const dt=last===null?0:Math.min((now-last)/1000,.1);last=now;if(!reduceMotion.matches){elapsed=(elapsed+dt)%DURATION;state=mode==='demo'?demoState(elapsed):reduce(state,{type:'tick',dt});paint();}requestAnimationFrame(frame);}
reduceMotion.addEventListener('change',()=>{last=null;});
paint();requestAnimationFrame(frame);
