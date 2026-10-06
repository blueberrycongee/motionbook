import {loopFrameAt,LOOP_DURATION as DURATION}from'./timeline.mjs';import{drawScene}from'./scene.mjs';import{CodeInputModel,normalizeCode}from'./model.mjs';
const $=id=>document.getElementById(id),canvas=$('scene'),g=canvas.getContext('2d'),media=matchMedia('(prefers-reduced-motion: reduce)'),model=new CodeInputModel({reducedMotion:media.matches});
let mode=media.matches?'live':'replay',start=performance.now()/1000,paused=false,pausedTime=0,lastStatus='',previousState='idle';const now=()=>performance.now()/1000;
const stateLabels={idle:'Click Enter code to try the demonstration.',editing:'Enter six digits. The demo success code is 123456.',filled:'Code entered.',checking:'Verifying demo code.',error:'That demo code was not accepted. Try 123456.',success:'Demo code verified.'};
function setLive(){mode='live';paused=false;model.reset(now());model.reopened=false;$('code').value='';$('pause').textContent='Pause';$('hint').textContent='Demo code: 123456';$('activate').disabled=false;}
function activate(){if(mode!=='live'||model.state==='success')setLive();if(model.activate(now()))$('code').focus({preventScroll:true});}
$('activate').addEventListener('click',activate);$('live').addEventListener('click',()=>{setLive();activate();});
$('code').addEventListener('input',()=>{const v=normalizeCode($('code').value);model.input(v,now());$('code').value=model.code;});
$('code').addEventListener('keydown',e=>{if(e.key==='Escape'){setLive();$('activate').focus();e.preventDefault();}});
$('replay').addEventListener('click',()=>{mode='replay';paused=false;start=now();$('code').blur();$('pause').textContent='Pause';$('hint').textContent='Recorded interaction replay';});
$('pause').addEventListener('click',()=>{if(mode!=='replay')return;if(paused){start=pausedTime>=DURATION?now():now()-pausedTime;paused=false;}else{pausedTime=now()-start;paused=true;}$('pause').textContent=paused?'Resume':'Pause';});
media.addEventListener('change',e=>{model.reducedMotion=e.matches;if(e.matches)setLive();});
if(new URLSearchParams(location.search).has('clean'))document.body.classList.add('clean');
await document.fonts.load('bold 40px StudySans');
await document.fonts.ready;
function render(){const t=now();let s;if(mode==='replay'){const age=paused?pausedTime:t-start;s=loopFrameAt(Math.min(age,DURATION));if(age>=DURATION){paused=true;pausedTime=DURATION;$('pause').textContent='Play again';}}
 else{s=model.frame(t);if(previousState==='error'&&model.state==='editing')$('code').value='';previousState=model.state;const label=stateLabels[model.state];if(label!==lastStatus){$('status').textContent=label;lastStatus=label;}$('activate').disabled=model.state==='checking'||model.state==='filled'||model.state==='error';}
 drawScene(g,s,{cursor:mode==='replay'});requestAnimationFrame(render);}
requestAnimationFrame(render);
