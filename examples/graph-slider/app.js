(function(){
  'use strict';
  const art=document.getElementById('art'),slider=document.getElementById('scrub'),play=document.getElementById('play'),replay=document.getElementById('replay');
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches,model=new GraphModel.Scrub();let recorded=true,playing=!reduced,time=0,last=performance.now(),captured=null;
  function draw(){const row=recorded?GraphScene.observed(time):GraphScene.live(model.progress);art.innerHTML=GraphScene.render(row);slider.setAttribute('aria-valuenow',String(row.minute));slider.setAttribute('aria-valuetext',row.label);play.textContent=playing?'Pause':'Play';}
  function endCapture(){if(captured!==null&&slider.hasPointerCapture(captured))slider.releasePointerCapture(captured);captured=null;}
  function move(e){if(captured!==null&&captured!==e.pointerId)return;if(e.pointerType==='touch'&&captured!==e.pointerId)return;const r=slider.getBoundingClientRect();recorded=false;playing=false;model.move(e.clientX,r.left,r.width);draw();}
  slider.addEventListener('pointermove',move);
  slider.addEventListener('pointerdown',e=>{if(captured!==null)return;captured=e.pointerId;slider.setPointerCapture(e.pointerId);move(e);});
  function release(e){if(captured!==e.pointerId)return;endCapture();}
  slider.addEventListener('pointerup',release);slider.addEventListener('pointercancel',release);
  slider.addEventListener('keydown',e=>{if(!['Home','End','ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key))return;e.preventDefault();if(recorded)model.progress=(GraphScene.observed(time).minute-455)/60;recorded=false;playing=false;model.key(e.key);draw();});
  play.addEventListener('click',()=>{endCapture();if(!recorded){recorded=true;time=0;}playing=!playing;last=performance.now();draw();});
  replay.addEventListener('click',()=>{endCapture();recorded=true;playing=!reduced;time=0;model.reset();last=performance.now();draw();});
  function tick(now){const dt=Math.max(0,(now-last)/1000);last=now;if(recorded&&playing){time=(time+dt)%GraphScene.DURATION;draw();}requestAnimationFrame(tick);}draw();requestAnimationFrame(tick);
})();
