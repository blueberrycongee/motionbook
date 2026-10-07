(function(){'use strict';
const M=window.PlayerMotion,S=window.PlayerScene,player=document.getElementById('player'),scrub=document.getElementById('scrub'),label=document.getElementById('time-label'),modeLabel=document.getElementById('mode-label'),replayButton=document.getElementById('replay'),interactiveButton=document.getElementById('interactive');
const media=window.matchMedia('(prefers-reduced-motion: reduce)');
let controller=new M.Controller({reducedMotion:media.matches,time:performance.now()/1000}),mode=media.matches?'interactive':'reference',origin=performance.now()/1000,sourceTime=M.referenceSpec.start,raf=0,handoff=null,pausedAt=null,pointer=null,moved=false,lastState=M.referenceAt(sourceTime);
scrub.min=String(M.referenceSpec.start);scrub.max=String(M.referenceSpec.end);scrub.value=String(sourceTime);
player.innerHTML=S.render(lastState);
function render(state){lastState=state;S.patch(player,state);player.setAttribute('aria-expanded',String(state.progress>.5));player.setAttribute('aria-label',state.progress>.5?'Collapse player. Drag down, or press Escape.':'Expand player. Drag up on the mini player, or press Enter.');}
function displayInteractive(){const now=performance.now()/1000;if(handoff&&!M.handoffWeight(handoff,now))handoff=null;render(M.applyPoseHandoff(M.stateForProgress(controller.progress),handoff,now));}
function updateMode(){replayButton.setAttribute('aria-pressed',String(mode==='reference'));interactiveButton.setAttribute('aria-pressed',String(mode==='interactive'));modeLabel.textContent=mode==='reference'?'Reference replay · original speed':mode==='scrub'?(media.matches?'Reference paused · reduced motion':'Paused reference frame'):media.matches?'Interactive · reduced motion':'Interactive · drag, tap, Enter / Escape';}
function abortPointer(){if(pointer===null)return;const id=pointer;pointer=null;moved=false;controller.cancelDrag(performance.now()/1000);if(mode==='interactive')displayInteractive();if(player.hasPointerCapture?.(id))player.releasePointerCapture(id);}
function setInteractive(){if(mode!=='interactive'){abortPointer();handoff=media.matches?null:M.createPoseHandoff(lastState,performance.now()/1000);controller=new M.Controller({reducedMotion:media.matches,progress:lastState.progress,time:performance.now()/1000});mode='interactive';updateMode();}}
function syncTime(){scrub.value=String(sourceTime);label.textContent=sourceTime.toFixed(3)+' s';}
function needsFrame(){return!document.hidden&&(mode==='reference'||(mode==='interactive'&&(controller.mode==='settling'||handoff)));}
function schedule(){if(!raf&&needsFrame())raf=requestAnimationFrame(loop);}
function loop(ms){raf=0;const now=ms/1000;if(mode==='reference'){const duration=M.referenceSpec.end-M.referenceSpec.start;sourceTime=M.referenceSpec.start+((now-origin)%duration+duration)%duration;render(M.referenceAt(sourceTime));syncTime();}else if(mode==='interactive'){controller.tick(now);displayInteractive();}schedule();}
function settle(target){abortPointer();setInteractive();controller.settle(target,performance.now()/1000);displayInteractive();schedule();}
function toggle(){settle(mode==='interactive'?1-controller.target:lastState.progress>.5?0:1);}
function releasePointer(event){if(pointer===null||event.pointerId!==pointer)return;const now=performance.now()/1000,id=pointer;pointer=null;if(event.type==='pointercancel'){controller.cancelDrag(now);}else if(moved){controller.dragEnd(now);}else{controller.cancelDrag(now);controller.settle(controller.target?0:1,now);}moved=false;if(player.hasPointerCapture?.(id))player.releasePointerCapture(id);displayInteractive();schedule();}
player.addEventListener('pointerdown',event=>{if(event.button!==0||pointer!==null)return;const box=player.getBoundingClientRect(),y=(event.clientY-box.top)*M.H/box.height;if(lastState.progress<.02&&(y<lastState.card.y||y>842))return;setInteractive();pointer=event.pointerId;moved=false;controller.dragStart(y,performance.now()/1000);player.setPointerCapture?.(pointer);event.preventDefault();schedule();});
player.addEventListener('pointermove',event=>{if(pointer===null||event.pointerId!==pointer||!controller.drag)return;const box=player.getBoundingClientRect(),y=(event.clientY-box.top)*M.H/box.height;if(Math.abs(y-controller.drag.y)>3)moved=true;controller.dragMove(y,performance.now()/1000);displayInteractive();});
player.addEventListener('pointerup',releasePointer);player.addEventListener('pointercancel',releasePointer);
player.addEventListener('lostpointercapture',event=>{if(pointer!==null&&event.pointerId===pointer){abortPointer();schedule();}});
player.addEventListener('click',event=>{if(event.detail===0)toggle();});
player.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' '||event.key==='Escape'){event.preventDefault();if(event.repeat)return;if(event.key==='Escape')settle(0);else toggle();}});
replayButton.addEventListener('click',()=>{abortPointer();handoff=null;mode=media.matches?'scrub':'reference';origin=performance.now()/1000;sourceTime=M.referenceSpec.start;render(M.referenceAt(sourceTime));syncTime();updateMode();schedule();});
interactiveButton.addEventListener('click',()=>{abortPointer();setInteractive();schedule();});
document.getElementById('expand').addEventListener('click',()=>settle(1));
document.getElementById('collapse').addEventListener('click',()=>settle(0));
scrub.addEventListener('input',()=>{abortPointer();handoff=null;mode='scrub';sourceTime=M.clamp(Number(scrub.value),M.referenceSpec.start,M.referenceSpec.end);render(M.referenceAt(sourceTime));syncTime();updateMode();});
media.addEventListener('change',event=>{abortPointer();if(event.matches)handoff=null;controller.setReducedMotion(event.matches,performance.now()/1000);if(event.matches&&mode==='reference'){mode='scrub';}if(mode==='interactive')displayInteractive();updateMode();schedule();});
function pause(){if(pausedAt===null)pausedAt=performance.now()/1000;abortPointer();if(raf)cancelAnimationFrame(raf);raf=0;}
function resume(){const now=performance.now()/1000;if(pausedAt!==null&&handoff)handoff.time+=Math.max(0,now-pausedAt);pausedAt=null;if(mode==='reference')origin=now-(sourceTime-M.referenceSpec.start);controller.time=now;schedule();}
document.addEventListener('visibilitychange',()=>{if(document.hidden)pause();else resume();});
window.addEventListener('pageshow',resume);
window.addEventListener('pagehide',pause);
render(lastState);updateMode();schedule();
})();
