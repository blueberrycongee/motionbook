'use strict';
const M = window.JitterMotion, S = window.JitterScene;
const canvas = document.querySelector('canvas'), ctx = canvas.getContext('2d');
const media = matchMedia('(prefers-reduced-motion: reduce)');
const controller = new M.Controller({ reducedMotion: media.matches });
const wordInput = document.querySelector('#word'), reduced = document.querySelector('#reduced'), pause = document.querySelector('#pause');
reduced.checked = media.matches;
let word = 'wiggling', raf = null, disposed = false;
function syncControls() {
  pause.disabled = controller.reducedMotion;
  pause.textContent = controller.playing ? 'Pause' : controller.elapsed > 0 && controller.elapsed < M.DURATION ? 'Resume' : 'Replay';
}
function frame(now) {
  raf = null;
  if (disposed || document.hidden) return;
  S.draw(ctx, {seconds:controller.sample(now),selected:true,word,reducedMotion:controller.reducedMotion});
  syncControls();
  if (controller.playing) raf=requestAnimationFrame(frame);
}
function refresh() {
  if (raf!==null) cancelAnimationFrame(raf);
  raf=null; syncControls();
  if (!disposed && !document.hidden) raf=requestAnimationFrame(frame);
}
function replay() { if (disposed) return; controller.replay(performance.now()); refresh(); }
document.querySelector('#replay').addEventListener('click',replay);
document.querySelector('#jitter-hit').addEventListener('click',replay);
pause.addEventListener('click',()=>{
  if (disposed || controller.reducedMotion) return;
  const now=performance.now();
  if(controller.playing) controller.pause(now);
  else if(controller.elapsed===0 || controller.elapsed>=M.DURATION) controller.replay(now);
  else controller.resume(now);
  refresh();
});
wordInput.addEventListener('input',()=>{word=M.graphemes(wordInput.value).slice(0,32).join('')||' ';replay();});
function reduce(value){if(value)wasPlaying=false;controller.setReducedMotion(value);reduced.checked=value;refresh();}
reduced.addEventListener('change',()=>reduce(reduced.checked));
media.addEventListener('change',e=>reduce(e.matches));
let wasPlaying=false;
document.addEventListener('visibilitychange',()=>{
  if(document.hidden){
    wasPlaying=controller.playing;controller.pause(performance.now());
    if(raf!==null)cancelAnimationFrame(raf);raf=null;syncControls();
  } else {
    if(wasPlaying && !disposed)controller.resume(performance.now());
    wasPlaying=false;refresh();
  }
});
window.addEventListener('pagehide',()=>{disposed=true;wasPlaying=false;controller.cancel();if(raf!==null)cancelAnimationFrame(raf);raf=null;syncControls();});
window.addEventListener('pageshow',event=>{if(event.persisted){disposed=false;refresh();}});
syncControls();
document.fonts.ready.then(()=>{if(!disposed)replay();});
