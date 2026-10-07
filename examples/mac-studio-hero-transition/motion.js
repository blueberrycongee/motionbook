/* Scroll, transport, and accessibility adapter. The pixels come from scene.js. */
(function(){'use strict';
  const scene=window.MotionScene,canvas=document.querySelector('canvas'),context=canvas.getContext('2d'),track=document.querySelector('.scroll-track'),range=document.getElementById('seek'),play=document.getElementById('play'),reset=document.getElementById('reset'),repeat=document.getElementById('repeat'),phase=document.getElementById('phase'),percent=document.getElementById('percent'),mq=window.matchMedia('(prefers-reduced-motion: reduce)');
  let p=0,width=0,height=0,dpr=1,playing=false,loop=false,raf=0,last=0,destroyed=false,mode='scroll',reduced=mq.matches;
  const cleanup=[];const on=(target,name,fn,options)=>{target.addEventListener(name,fn,options);cleanup.push(()=>target.removeEventListener(name,fn,options))};
  const clamp=x=>Math.max(0,Math.min(1,Number.isFinite(Number(x))?Number(x):0));
  function draw(){if(destroyed)return;context.setTransform(dpr,0,0,dpr,0,0);let state=scene.render(context,width,height,p,{reducedMotion:reduced});range.value=String(Math.round(p*1000));range.setAttribute('aria-valuetext',Math.round(p*100)+' percent, '+state.phase);percent.value=Math.round(p*100)+'%';phase.textContent=state.phase;canvas.setAttribute('aria-label','Motion scene: '+state.phase);}
  function resize(){const r=canvas.getBoundingClientRect();width=Math.max(1,r.width);height=Math.max(1,r.height);dpr=Math.min(2,window.devicePixelRatio||1);canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);if(mode==='scroll'&&!reduced)updateScroll();else draw()}
  function stop(){playing=false;play.textContent='Play';play.setAttribute('aria-pressed','false');cancelAnimationFrame(raf);last=0}
  function seek(value){stop();mode='manual';p=clamp(value);draw();return getState()}
  function updateScroll(){if(destroyed||reduced||mode!=='scroll')return;const rect=track.getBoundingClientRect();p=clamp(-rect.top/Math.max(1,track.offsetHeight-window.innerHeight));draw()}
  function userScroll(){if(reduced)return;stop();mode='scroll';updateScroll()}
  function tick(now){if(!playing||destroyed)return;if(last){p+=(now-last)/(scene.duration*1000);if(p>=1){p=1;draw();if(loop){p=0;last=now;raf=requestAnimationFrame(tick);return}stop();return}}last=now;draw();raf=requestAnimationFrame(tick)}
  function start(){if(reduced)return;if(playing){stop();return}mode='manual';if(p>=1)p=0;playing=true;play.textContent='Pause';play.setAttribute('aria-pressed','true');last=0;raf=requestAnimationFrame(tick)}
  function applyReduced(){reduced=mq.matches;document.documentElement.classList.toggle('reduced-motion',reduced);stop();p=reduced?1:0;mode=reduced?'manual':'scroll';resize();if(!reduced)updateScroll()}
  function getState(){return Object.assign({},scene.state(p),{mode,playing,repeat:loop,reducedMotion:reduced,width,height,destroyed})}
  on(range,'input',()=>seek(Number(range.value)/1000));on(play,'click',start);on(repeat,'click',()=>{loop=!loop;repeat.setAttribute('aria-pressed',String(loop))});
  on(reset,'click',()=>{seek(reduced?1:0);if(!reduced){window.scrollTo({top:track.offsetTop,behavior:'instant'});mode='scroll'}});
  on(window,'scroll',userScroll,{passive:true});on(window,'wheel',userScroll,{passive:true});on(window,'touchmove',userScroll,{passive:true});on(window,'keydown',e=>{if(/^(PageDown|PageUp|ArrowDown|ArrowUp|Home|End| )$/.test(e.key)&&!['INPUT','BUTTON'].includes(document.activeElement.tagName))userScroll()});on(window,'resize',resize);on(document,'visibilitychange',()=>{if(document.hidden)stop()});
  if(mq.addEventListener)on(mq,'change',applyReduced);
  const ro=typeof ResizeObserver==='function'?new ResizeObserver(resize):null;if(ro)ro.observe(canvas);
  function destroy(){if(destroyed)return;stop();destroyed=true;cleanup.forEach(fn=>fn());if(ro)ro.disconnect()}
  window.MOTION={setProgress:seek,getState,destroy,play:start,pause:stop};applyReduced();
})();
