(function(){'use strict';
const M=window.LyricsMotion,S=window.LyricsScene,$=id=>document.getElementById(id),player=$('player'),play=$('play'),scrub=$('scrub'),reverse=$('reverse'),follow=$('follow'),media=window.matchMedia('(prefers-reduced-motion: reduce)');
const now=()=>performance.now()/1000;
const controller=new M.Controller({time:now(),playing:!media.matches,reducedMotion:media.matches});
let raf=0,pointer=null,moveStart=0,moved=false;
scrub.min=String(M.referenceSpec.start);scrub.max=String(M.referenceSpec.end);scrub.value=String(M.referenceSpec.start);
player.innerHTML=S.render(controller.state());
function render(){const state=controller.state();S.patch(player,state);scrub.value=String(state.time);$('time-label').textContent=state.time.toFixed(3)+' s';play.textContent=state.playing?'Pause':'Play';play.disabled=state.reducedMotion;play.setAttribute('aria-pressed',String(state.playing));reverse.setAttribute('aria-pressed',String(state.rate<0));$('mode-label').textContent=state.follow?'Reference path · '+(state.rate<0?'reverse':'1×')+' · '+(state.playing?'playing':'paused'):controller.returning?'Returning to follow · supplemental model':'Manual inspection · supplemental model';$('reduced-label').textContent=state.reducedMotion?'Reduced motion: autoplay is paused; use the timeline or arrow keys.':'';follow.disabled=state.follow;}
function schedule(){if(!raf&&!document.hidden&&controller.needsFrame())raf=requestAnimationFrame(loop);}
function loop(ms){raf=0;controller.tick(ms/1000);render();schedule();}
function refresh(){render();schedule();}
function y(event){const b=player.getBoundingClientRect();return(event.clientY-b.top)*M.H/b.height;}
function abortPointer(){if(pointer===null)return;const id=pointer;pointer=null;controller.cancelManual(now());if(player.hasPointerCapture?.(id))player.releasePointerCapture(id);moved=false;}
function toggle(){controller.setPlaying(!controller.playing,now());refresh();}
play.addEventListener('click',toggle);
$('replay').addEventListener('click',()=>{abortPointer();controller.setRate(1,now());controller.seek(M.referenceSpec.start,now());controller.setPlaying(true,now());refresh();});
reverse.addEventListener('click',()=>{abortPointer();const rate=controller.rate<0?1:-1;controller.setRate(rate,now());if(rate<0&&controller.mediaTime<=M.referenceSpec.start)controller.seek(M.referenceSpec.end,now());if(rate>0&&controller.mediaTime>=M.referenceSpec.end)controller.seek(M.referenceSpec.start,now());controller.setPlaying(true,now());refresh();});
follow.addEventListener('click',()=>{abortPointer();controller.resumeFollow(now());refresh();});
scrub.addEventListener('input',()=>{abortPointer();controller.setPlaying(false,now());controller.seek(Number(scrub.value),now());refresh();});
player.addEventListener('pointerdown',event=>{if(event.button!==0||event.isPrimary===false||pointer!==null)return;pointer=event.pointerId;moveStart=y(event);moved=false;controller.beginManual(moveStart,now());player.setPointerCapture?.(pointer);event.preventDefault();refresh();});
player.addEventListener('pointermove',event=>{if(pointer===null||event.pointerId!==pointer)return;const point=y(event);if(Math.abs(point-moveStart)>3)moved=true;controller.moveManual(point,now());refresh();});
function release(event){if(pointer===null||event.pointerId!==pointer)return;const id=pointer;pointer=null;if(event.type==='pointercancel'||!moved)controller.cancelManual(now());else controller.endManual(now());if(player.hasPointerCapture?.(id))player.releasePointerCapture(id);moved=false;refresh();}
player.addEventListener('pointerup',release);player.addEventListener('pointercancel',release);player.addEventListener('lostpointercapture',event=>{if(pointer===event.pointerId){abortPointer();refresh();}});
player.addEventListener('wheel',event=>{if(pointer!==null)return;event.preventDefault();const delta=event.deltaY*(event.deltaMode===1?20:event.deltaMode===2?M.H:1);controller.beginManual(0,now());controller.moveManual(-delta,now());controller.endManual(now());refresh();},{passive:false});
player.addEventListener('keydown',event=>{if(event.repeat)return;if(event.key===' '){event.preventDefault();toggle();}else if(event.key==='Escape'){event.preventDefault();abortPointer();controller.resumeFollow(now());refresh();}else if(event.key==='ArrowRight'||event.key==='ArrowLeft'){event.preventDefault();abortPointer();controller.setPlaying(false,now());controller.seek(controller.mediaTime+(event.key==='ArrowRight'?.1:-.1),now());refresh();}});
media.addEventListener('change',event=>{abortPointer();controller.setReducedMotion(event.matches,now());refresh();});
function freeze(){abortPointer();controller.freeze(now());if(raf)cancelAnimationFrame(raf);raf=0;render();}
function thaw(){controller.thaw(now());refresh();}
document.addEventListener('visibilitychange',()=>document.hidden?freeze():thaw());
window.addEventListener('pagehide',freeze);window.addEventListener('pageshow',thaw);
render();schedule();
})();
