import {DURATION, clamp} from './motion.js';
/** Small playback state machine. All timing is monotonic; restart cancels the old RAF. */
export function createPlayer({onFrame,requestFrame=callback=>requestAnimationFrame(callback),cancelFrame=id=>cancelAnimationFrame(id),now=()=>performance.now(),reducedMotion=false}={}) {
  let time=reducedMotion?DURATION:0, playing=false, frame=null, anchor=0, speed=1, reduced=reducedMotion, generation=0;
  const notify=()=>onFrame?.(time,{playing,reducedMotion:reduced,speed});
  const stop=()=>{generation++; if(frame!==null)cancelFrame(frame); frame=null; playing=false;};
  const tick=(stamp,token)=>{
    if(token!==generation||!playing)return;
    time=clamp((stamp-anchor)*speed/1000,0,DURATION);
    if(time>=DURATION){stop();notify();return;}
    notify();frame=requestFrame(next=>tick(next,token));
  };
  function play(){
    stop();if(reduced){time=DURATION;notify();return;}
    if(time>=DURATION)time=0;
    anchor=now()-time*1000/speed;playing=true;const token=generation;notify();frame=requestFrame(t=>tick(t,token));
  }
  function pause(){if(playing)time=clamp((now()-anchor)*speed/1000,0,DURATION);stop();notify();}
  function seek(next){const was=playing;stop();time=clamp(Number(next)||0,0,DURATION);if(reduced)time=DURATION;if(was&&!reduced&&time<DURATION)play();else notify();}
  function replay(){stop();time=reduced?DURATION:0;play();}
  function setReducedMotion(value){stop();reduced=Boolean(value);time=reduced?DURATION:0;notify();}
  function setSpeed(next){pause();speed=clamp(Number(next)||1,.25,2);notify();}
  function destroy(){stop();}
  notify();
  return {play,pause,seek,replay,setReducedMotion,setSpeed,destroy,getState:()=>({time,playing,reducedMotion:reduced,speed})};
}
