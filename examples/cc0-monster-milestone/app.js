import {renderSVG,DURATION,stateAt} from './motion.js';
import {createPlayer} from './controller.js';
const $=id=>document.getElementById(id);
const media=matchMedia('(prefers-reduced-motion: reduce)');
const reduced=$('reduced');reduced.checked=media.matches;
let lastPhase='';
const player=createPlayer({reducedMotion:media.matches,onFrame:(time,state)=>{
  $('stage').innerHTML=renderSVG(time,{reducedMotion:state.reducedMotion});
  $('timeline').value=time;$('timeline').disabled=state.reducedMotion;
  $('time').value=`${time.toFixed(2)} / ${DURATION.toFixed(2)} s`;
  $('play').textContent=state.playing?'Pause':'Play';
  const phase=state.reducedMotion?'Static final state':stateAt(time).phase;
  if(phase!==lastPhase){$('phase').textContent=phase;lastPhase=phase;}
}});
$('replay').addEventListener('click',()=>player.replay());
$('play').addEventListener('click',()=>player.getState().playing?player.pause():player.play());
$('timeline').addEventListener('input',event=>{const next=Number(event.target.value);player.pause();player.seek(next);});
$('speed').addEventListener('change',event=>{player.setSpeed(Number(event.target.value));player.play();});
reduced.addEventListener('change',()=>player.setReducedMotion(reduced.checked));
media.addEventListener('change',event=>{reduced.checked=event.matches;player.setReducedMotion(event.matches);});
document.addEventListener('visibilitychange',()=>{if(document.hidden)player.pause();});
window.addEventListener('pagehide',()=>player.pause());
window.__motionStudy={player,renderSVG,stateAt};
if(!media.matches)player.play();
