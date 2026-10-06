'use strict';
(()=>{const stage=document.querySelector('#stage'),scrub=document.querySelector('#scrub'),status=document.querySelector('#status');const model=new CalendarModel.Calendar();let mode='live',time=0,playing=false,last=performance.now();
 const coords=e=>{const r=stage.getBoundingClientRect();return[(e.clientX-r.left)*1318/r.width,(e.clientY-r.top)*812/r.height];};
 function live(){mode='live';playing=false;status.value='Drag to create an event';}
 stage.addEventListener('pointermove',e=>{if(mode!=='live')return;model.move(...coords(e));});
 stage.addEventListener('pointerdown',e=>{live();stage.focus();if(model.press(...coords(e))){stage.setPointerCapture(e.pointerId);e.preventDefault();}});
 stage.addEventListener('pointerup',e=>{model.release();if(stage.hasPointerCapture(e.pointerId))stage.releasePointerCapture(e.pointerId);if(model.lastInterval)status.value=CalendarModel.interval(...model.lastInterval);});
 stage.addEventListener('pointercancel',()=>{model.cancel();status.value='Cancelled';});
 stage.addEventListener('lostpointercapture',()=>{if(model.down)model.cancel();});
 stage.addEventListener('keydown',e=>{if(['ArrowUp','ArrowDown',' ','Escape'].includes(e.key)){e.preventDefault();live();if(e.key==='Escape')model.cancel();else if(e.key===' '){if(model.down)model.release();else model.press(660,model.pointer.y);}else{model.move(660,CalendarModel.toY(CalendarModel.toMinute(model.pointer.y)+(e.key==='ArrowUp'?-15:15)));}}});
 document.querySelector('#live').onclick=()=>{live();stage.focus();};
 document.querySelector('#reset').onclick=()=>{model.reset();time=0;scrub.value=0;live();};
 document.querySelector('#replay').onclick=()=>{if(!window.CalendarTrace){status.value='Native replay pending';return;}mode='replay';time=0;playing=true;status.value='Reference motion replay';};
 scrub.oninput=()=>{if(!window.CalendarTrace)return;mode='replay';playing=false;time=Number(scrub.value);};
 function tick(now){const dt=Math.min(.05,(now-last)/1000);last=now;if(mode==='replay'&&CalendarTrace){if(playing)time=(time+dt)%CalendarTrace.duration;scrub.value=time;stage.innerHTML=CalendarScene.render(CalendarTrace.at(time));}else stage.innerHTML=CalendarScene.render(model.step(dt));requestAnimationFrame(tick);}
 // Deterministic capture API. It does not start or emulate a browser.
 window.calendarStudy={model,setTime(t){mode='replay';playing=false;time=t;if(CalendarTrace)stage.innerHTML=CalendarScene.render(CalendarTrace.at(t));},getState(){return mode==='replay'&&CalendarTrace?CalendarTrace.at(time):model.state();}};
 requestAnimationFrame(tick);
})();
