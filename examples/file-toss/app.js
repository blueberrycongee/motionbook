(function(){
  'use strict';
  const stage=document.getElementById('stage'),art=document.getElementById('art'),paper=document.getElementById('paper'),undo=document.getElementById('undo'),play=document.getElementById('play'),status=document.getElementById('status');
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches,model=new TossModel.Toss();let recorded=true,playing=!reduced,time=0,last=performance.now(),row=TossScene.observed(0),drag=null;
  const point=e=>{const r=stage.getBoundingClientRect();return{x:(e.clientX-r.left)*1920/r.width,y:(e.clientY-r.top)*1360/r.height};};
  function place(el,x,y,w,h){el.style.left=x/19.2+'%';el.style.top=y/13.6+'%';el.style.width=w/19.2+'%';el.style.height=h/13.6+'%';}
  function draw(){row=recorded?TossScene.observed(time):TossScene.live(model);art.innerHTML=TossScene.render(row);const paperVisible=row.paperKind!=='none'&&row.paperAlpha>.2&&!row.deleted;paper.hidden=!paperVisible;place(paper,row.paperX-70,row.paperY-75,140,150);undo.hidden=row.toastAlpha<.5;place(undo,1167,651,108,64);play.textContent=playing?'Pause':'Play';status.textContent=recorded?'Recorded motion':model.state==='deleted'?'Example file deleted':model.misses?'Missed. Have another go.':'Drag or flick the example file';}
  function endCapture(){const id=drag;drag=null;if(id!==null&&paper.hasPointerCapture?.(id))paper.releasePointerCapture(id);}
  function cancelDrag(){endCapture();const misses=model.misses;model.reset();model.misses=misses;}
  paper.addEventListener('pointerdown',e=>{if(drag!==null)return;e.preventDefault();const p=point(e);recorded=false;playing=false;model.misses=row.misses;model.begin(p.x,p.y,e.timeStamp);drag=e.pointerId;paper.setPointerCapture(e.pointerId);draw();});
  paper.addEventListener('pointermove',e=>{if(drag!==e.pointerId)return;const p=point(e);model.move(p.x,p.y,e.timeStamp);draw();});
  function release(e){if(drag!==e.pointerId)return;endCapture();model.release();if(reduced)for(let i=0;i<300&& !['ready','deleted'].includes(model.state);i++)model.step(.05);draw();}
  paper.addEventListener('pointerup',release);paper.addEventListener('pointercancel',e=>{if(drag===e.pointerId){cancelDrag();draw();}});
  paper.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();endCapture();recorded=false;playing=false;model.keyboardDelete();if(reduced)for(let i=0;i<20;i++)model.step(.05);draw();}});
  undo.addEventListener('click',()=>{endCapture();recorded=false;playing=false;model.reset();draw();});
  play.addEventListener('click',()=>{if(drag!==null)cancelDrag();if(!recorded){recorded=true;time=0;}playing=!playing;last=performance.now();draw();});
  document.getElementById('replay').addEventListener('click',()=>{endCapture();recorded=true;playing=!reduced;time=0;model.reset();last=performance.now();draw();});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&drag!==null){cancelDrag();draw();}});
  function tick(now){const dt=Math.min(.05,(now-last)/1000);last=now;if(recorded&&playing){time=(time+dt)%TossScene.DURATION;draw();}else if(!recorded&&!['ready','drag','deleted'].includes(model.state)){model.step(dt);draw();}requestAnimationFrame(tick);}draw();requestAnimationFrame(tick);
})();
