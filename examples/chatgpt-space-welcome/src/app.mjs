import{SpaceScene}from'./scene.mjs';
import{springValue,limitedVelocity,clamp}from'./motion.mjs';
const canvas=document.querySelector('canvas'),ctx=canvas.getContext('2d'),main=document.querySelector('main'),go=document.querySelector('#continue'),cards=[...document.querySelectorAll('[data-card]')];
const makeCanvas=(w,h)=>{const c=document.createElement('canvas');c.width=w;c.height=h;return c;};
let scene=new SpaceScene(innerWidth,innerHeight,makeCanvas),last=0,reduced=matchMedia('(prefers-reduced-motion: reduce)'),pointer={active:false,x:0,y:0,down:false},drag=null,focus=-1,raf=0;
const offsets=Array.from({length:4},()=>({x:0,y:0,angle:0})),springs=new Map();
function resize(){const dpr=Math.min(devicePixelRatio,2);canvas.width=Math.round(innerWidth*dpr);canvas.height=Math.round(innerHeight*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);scene.resize(innerWidth,innerHeight);springs.clear();offsets.forEach(o=>Object.assign(o,{x:0,y:0,angle:0}));go.disabled=false;}
function launch(i,vx=0,vy=0){const velocity=limitedVelocity(vx,vy);if(reduced.matches){offsets[i]={x:0,y:0,angle:0};return;}springs.set(i,{...offsets[i],vx:velocity.x,vy:velocity.y,start:scene.time});}
function setPointer(e){if(e.pointerType==='touch'||scene.field.warp!==null){pointer.active=false;return;}pointer.x=e.clientX;pointer.y=e.clientY;pointer.active=true;}
main.addEventListener('pointermove',setPointer,{passive:true});main.addEventListener('pointerleave',()=>pointer.active=false);main.addEventListener('pointerdown',e=>{setPointer(e);pointer.down=true;});window.addEventListener('pointerup',()=>pointer.down=false);window.addEventListener('blur',()=>{pointer.active=false;pointer.down=false;if(drag){launch(drag.i);drag=null;}});
function release(e,cancelled=false){if(!drag||drag.id!==e.pointerId)return;const d=drag;drag=null;try{e.currentTarget.releasePointerCapture(e.pointerId);}catch{}const a=d.samples[0],b=d.samples.at(-1),dt=Math.max(16,b.t-a.t)/1000,decay=Math.exp(-Math.max(0,e.timeStamp-b.t-35)/50);launch(d.i,cancelled?0:(b.x-a.x)/dt*decay,cancelled?0:(b.y-a.y)/dt*decay);}
cards.forEach((el,i)=>{
 el.addEventListener('focus',()=>focus=i);el.addEventListener('blur',()=>focus=-1);
 el.addEventListener('pointerdown',e=>{if(e.button!==0||!e.isPrimary||scene.field.warp!==null)return;e.preventDefault();el.focus({preventScroll:true});el.setPointerCapture(e.pointerId);springs.delete(i);drag={i,id:e.pointerId,x:e.clientX,y:e.clientY,ox:offsets[i].x,oy:offsets[i].y,samples:[{x:e.clientX,y:e.clientY,t:e.timeStamp}]};});
 el.addEventListener('pointermove',e=>{if(!drag||drag.id!==e.pointerId)return;const d=drag;d.samples.push({x:e.clientX,y:e.clientY,t:e.timeStamp});while(d.samples.length>2&&d.samples[1].t<e.timeStamp-80)d.samples.shift();offsets[i].x=d.ox+e.clientX-d.x;offsets[i].y=d.oy+e.clientY-d.y;const a=d.samples[0],v=(e.clientX-a.x)/Math.max(16,e.timeStamp-a.t)*1000;offsets[i].angle+=(clamp(v*.008,-10,10)-offsets[i].angle)*.25;});
 el.addEventListener('pointerup',e=>release(e));el.addEventListener('pointercancel',e=>release(e,true));el.addEventListener('lostpointercapture',e=>release(e,true));
 el.addEventListener('click',e=>{if(e.detail===0)launch(i,580,-500);});
 el.addEventListener('keydown',e=>{const vectors={ArrowLeft:[-288,0],ArrowRight:[288,0],ArrowUp:[0,-288],ArrowDown:[0,288]};if(e.key==='Home'){e.preventDefault();springs.delete(i);offsets[i]={x:0,y:0,angle:0};}else if(vectors[e.key]){e.preventDefault();if(reduced.matches)offsets[i]={x:vectors[e.key][0]/12,y:vectors[e.key][1]/12,angle:0};else launch(i,...vectors[e.key]);}});
});
go.addEventListener('click',()=>{if(scene.field.warp!==null)return;pointer.active=false;go.disabled=true;cards.forEach(c=>c.disabled=true);if(reduced.matches){scene.beginWarp();scene.field.warp=2.35;}else scene.beginWarp();});
function place(el,b){Object.assign(el.style,{left:b.x+'px',top:b.y+'px',width:b.width+'px',height:b.height+'px'});}
function frame(now){const dt=last?Math.min(.04,(now-last)/1000):0;last=now;if(!document.hidden){
 for(const[i,s]of springs){const t=scene.time-s.start;offsets[i]={x:springValue(s.x,s.vx,t),y:springValue(s.y,s.vy,t),angle:springValue(s.angle,0,t)};if(t>8){offsets[i]={x:0,y:0,angle:0};springs.delete(i);}}
 scene.step(dt,pointer,!reduced.matches);scene.draw(ctx,{pointer,offsets,focus,reduced:reduced.matches,hover:go.matches(':hover')});place(go,scene.button);
 cards.forEach((el,i)=>{const p=scene.lastPoses[i];el.hidden=!p.visible;el.disabled=scene.field.warp!==null;place(el,{x:p.x-p.width/2,y:p.y-p.height/2,width:p.width,height:p.height});el.style.transform=`rotate(${p.angle}deg)`;});
 if(reduced.matches&&scene.time===0){scene.time=.7;scene.field.step(0,pointer,false);}
 }raf=requestAnimationFrame(frame);}
window.addEventListener('resize',resize);document.addEventListener('visibilitychange',()=>{last=0;pointer.active=false;});window.addEventListener('keydown',e=>{if(e.key.toLowerCase()==='r'){resize();last=0;cards.forEach(c=>c.disabled=false);}});resize();requestAnimationFrame(frame);
