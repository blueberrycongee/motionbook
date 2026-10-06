(()=>{'use strict';const el=document.getElementById('scene'),S=ClockScene,P=ClockPhysics,T=ClockTimeline;let state=null,last=performance.now(),start=last,background='#ebebeb',current=T.at(0);
function reset(){state=null;start=performance.now();render(T.at(0));}
function render(pose){pose.background=background;current=pose;el.innerHTML=S.svg(pose);}
function point(e){const r=el.getBoundingClientRect();return [(e.clientX-r.left)/r.width*S.W,(e.clientY-r.top)/r.height*S.H];}
el.addEventListener('pointerdown',e=>{const p=point(e);if(p[0]<370||p[0]>1500)return;state??=P.create(T.toPhysics(current));P.grab(state,p);el.setPointerCapture(e.pointerId);});
el.addEventListener('pointermove',e=>{if(state)P.move(state,point(e));});for(const name of ['pointerup','pointercancel'])el.addEventListener(name,()=>{if(state)P.release(state);});
document.getElementById('reset').onclick=reset;document.querySelectorAll('[data-color]').forEach(b=>b.onclick=()=>{background=b.dataset.color;render(state?P.pose(state):current);});window.addEventListener('keydown',e=>{if(e.key.toLowerCase()==='r')reset();});
function tick(now){const dt=Math.min(.04,(now-last)/1000);last=now;render(state?P.step(state,dt):T.at((now-start)/1000));requestAnimationFrame(tick);}reset();requestAnimationFrame(tick);})();
