(function(root){'use strict';
function mount(doc,win,M,S){
 const get=id=>doc.getElementById(id),stage=get('stage'),seek=get('seek'),play=get('play'),draft=get('draft'),edit=get('edit-controls');
 const preference=win.matchMedia('(prefers-reduced-motion: reduce)'),c=new M.Controller({reducedMotion:preference.matches});let raf=0,lastMode='',lastPhase='',disposed=false;
 const now=()=>win.performance.now(),listeners=[];const on=(el,event,fn)=>{el.addEventListener(event,fn);listeners.push(()=>el.removeEventListener(event,fn));};
 function draw(){if(disposed)return;const s=c.state(now());stage.innerHTML=S.render(s);seek.value=String(s.time);get('clock').textContent=`${s.time.toFixed(2)} / 7.50 s`;play.textContent=c.playing?'Pause':'Play';play.disabled=c.reducedMotion;const editing=c.mode==='editing';draft.hidden=!editing;edit.hidden=!editing;if(editing&&lastMode!=='editing'){draft.value=c.draft;draft.focus({preventScroll:true});}const phase=c.reducedMotion?'Reduced motion · still-frame review':s.phase;if(lastPhase!==phase){get('phase').textContent=phase;lastPhase=phase;}lastMode=c.mode;ensure();}
 function ensure(){if(!disposed&&!raf&&c.needsFrame())raf=win.requestAnimationFrame(()=>{raf=0;draw();});}
 function point(e){const b=stage.getBoundingClientRect();return {x:(e.clientX-b.left)/b.width*500,y:(e.clientY-b.top)/b.height*888};}
 on(play,'click',()=>{c.playing?c.pause(now()):c.play(now());draw();});on(get('replay'),'click',()=>{c.replay(now());draw();});on(get('reset'),'click',()=>{c.reset(now());stage.focus({preventScroll:true});draw();});on(seek,'input',()=>{c.pause(now());c.seek(Number(seek.value),now());draw();});on(get('repeat'),'change',e=>{c.repeat=!!e.target.checked;});
 on(stage,'pointerdown',e=>{if(e.button!==0||e.isPrimary===false)return;const p=point(e);if(c.beginPointer(e.pointerId,p.x,p.y,now(),true)){stage.setPointerCapture?.(e.pointerId);e.preventDefault();draw();}});
 on(stage,'pointermove',e=>{const p=point(e);if(c.movePointer(e.pointerId,p.x,p.y,now())){e.preventDefault();draw();}});
 on(stage,'pointerup',e=>{if(c.pointer?.id!==e.pointerId)return;c.releasePointer(e.pointerId,now());if(stage.hasPointerCapture?.(e.pointerId))stage.releasePointerCapture(e.pointerId);draw();});
 for(const event of ['pointercancel','lostpointercapture'])on(stage,event,e=>{if(c.cancelPointer(e.pointerId))draw();});
 const save=()=>{c.setDraft(draft.value);c.commit(now());stage.focus({preventScroll:true});draw();};const cancel=()=>{c.cancelEdit(now());stage.focus({preventScroll:true});draw();};
 on(get('save'),'click',save);on(get('cancel'),'click',cancel);on(draft,'input',()=>{c.setDraft(draft.value);draw();});
 on(doc,'keydown',e=>{
  // Composition confirmation belongs to the system input method, not task saving.
  if(e.isComposing||e.keyCode===229)return;
  if(e.target===draft){
   if(e.key==='Enter'||e.key==='Escape'){e.preventDefault();if(!e.repeat)(e.key==='Enter'?save:cancel)();}
   return;
  }
  // Escape remains available after tabbing from the draft to either editor button.
  if(e.key==='Escape'&&c.mode==='editing'){e.preventDefault();if(!e.repeat)cancel();return;}
  if(['INPUT','TEXTAREA','BUTTON','A','SELECT'].includes(e.target?.tagName)||e.target?.isContentEditable)return;
  if(e.repeat&&['Enter',' ','Escape'].includes(e.key)){e.preventDefault();return;}
  if(e.key==='Escape'){e.preventDefault();if(!c.cancelPointer())c.reset(now());draw();}
  else if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();c.pause(now());c.seek(c.time+(e.key==='ArrowRight'?1:-1)/30,now());draw();}
  else if(e.key===' '){e.preventDefault();c.playing?c.pause(now()):c.play(now());draw();}
  else if(e.key==='Enter'&&e.target===stage){e.preventDefault();c.reset(now());c.beginPointer(-1,450,839,now());c.releasePointer(-1,now());draw();}
 });
 on(doc,'visibilitychange',()=>{c.setHidden(doc.hidden,now());if(doc.hidden&&raf){win.cancelAnimationFrame(raf);raf=0;}draw();});on(win,'pagehide',()=>{c.setHidden(true,now());if(raf){win.cancelAnimationFrame(raf);raf=0;}});on(win,'pageshow',()=>{c.setHidden(false,now());draw();});
 on(preference,'change',e=>{c.setReducedMotion(e.matches,now());draw();});
 c.play(now());draw();return {controller:c,draw,dispose(){disposed=true;if(raf)win.cancelAnimationFrame(raf);listeners.splice(0).forEach(fn=>fn());}};
}
if(typeof module==='object'&&module.exports)module.exports={mount};else root.magicPlusDemo=mount(root.document,root,root.MagicMotion,root.MagicScene);
})(typeof globalThis!=='undefined'?globalThis:this);
