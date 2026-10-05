import {scene,reduce,interactiveState} from './scene.mjs';
const visual=document.querySelector('#visual'),toggle=document.querySelector('#toggle'),copy=document.querySelector('#copy'),status=document.querySelector('#status'),motion=matchMedia('(prefers-reduced-motion: reduce)');let state=reduce({}, {type:'reset'}),last=null,copyEpoch=0;
function paint(){const s=interactiveState(state,motion.matches);visual.innerHTML=scene(s);const open=s.pose[2]<-15;toggle.setAttribute('aria-expanded',String(open));toggle.setAttribute('aria-label',open?'Close the invite code':'Reveal the invite code');copy.hidden=!open;copy.disabled=!open;}
function action(a){state=reduce(state,a);paint();}
toggle.addEventListener('click',()=>{copyEpoch++;status.textContent='';action({type:'toggle'});});
copy.addEventListener('click',async()=>{if(copy.disabled)return;const epoch=++copyEpoch;try{if(!navigator.clipboard?.writeText)throw Error('Clipboard unavailable');await navigator.clipboard.writeText('LoveSwiftUI');if(epoch!==copyEpoch)return;action({type:'copy'});status.textContent='Invite code copied.';}catch{if(epoch===copyEpoch)status.textContent='Invite code: LoveSwiftUI. Copy is unavailable in this browser context.';}});
addEventListener('keydown',e=>{if(e.key==='Escape'||e.key.toLowerCase()==='r'){copyEpoch++;status.textContent='';action({type:'reset'});}});
function frame(now){const dt=last===null?0:(now-last)/1000;last=now;if(!motion.matches){state=reduce(state,{type:'tick',dt});paint();}requestAnimationFrame(frame);}paint();requestAnimationFrame(frame);
