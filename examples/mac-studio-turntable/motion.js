(function(){'use strict';
 const canvas=document.getElementById('scene'),ctx=canvas.getContext('2d'),section=document.querySelector('.scroll-scene'),slider=document.getElementById('progress'),value=document.getElementById('value'),play=document.getElementById('play'),reset=document.getElementById('reset'),status=document.getElementById('status'),media=matchMedia('(prefers-reduced-motion: reduce)');
 let progress=0,playing=false,raf=0,renderRaf=0,lastTime=0,destroyed=false,mode='scroll',lastPhase='';
 const clamp=v=>Math.max(0,Math.min(1,Number.isFinite(+v)?+v:0));
 function draw(){if(destroyed)return;const box=canvas.getBoundingClientRect(),dpr=Math.min(devicePixelRatio||1,2),w=box.width,h=box.height;if(canvas.width!==Math.round(w*dpr)||canvas.height!==Math.round(h*dpr)){canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);}ctx.setTransform(dpr,0,0,dpr,0,0);const s=MotionScene.render(ctx,w,h,progress,{reducedMotion:media.matches});slider.value=Math.round(progress*1000);value.textContent=Math.round(progress*100)+'%';if(s.phase!==lastPhase){status.textContent=media.matches?'Reduced motion · use the slider to inspect still states':s.phase;lastPhase=s.phase;}renderRaf=0;}
 function requestDraw(){if(!renderRaf)renderRaf=requestAnimationFrame(draw);}
 function stop(){playing=false;cancelAnimationFrame(raf);raf=0;play.textContent=media.matches?'Next view':'Play';play.setAttribute('aria-label',media.matches?'Next still view':'Play motion');}
 function setProgress(v){stop();mode='manual';progress=clamp(v);draw();return MotionScene.state(progress);}
 function onScroll(){if(media.matches||playing)return;mode='scroll';const rect=section.getBoundingClientRect(),travel=section.offsetHeight-innerHeight;progress=clamp(-rect.top/Math.max(1,travel));requestDraw();}
 function tick(t){if(!playing||destroyed)return;if(!lastTime)lastTime=t;progress=clamp(progress+(t-lastTime)/(MotionScene.duration*1000));lastTime=t;draw();if(progress>=1){stop();return;}raf=requestAnimationFrame(tick);}
 function onPlay(){if(media.matches){setProgress(progress<.5?1:0);return;}if(playing){stop();return;}mode='play';if(progress>=1)progress=0;playing=true;lastTime=0;play.textContent='Pause';play.setAttribute('aria-label','Pause motion');raf=requestAnimationFrame(tick);}
 function onInput(){setProgress(+slider.value/1000);}
 function onReset(){setProgress(0);}
 function onResize(){if(mode==='scroll')onScroll();requestDraw();}
 function onReduced(){stop();play.textContent=media.matches?'Next view':'Play';if(media.matches){progress=0;mode='manual';}lastPhase='';draw();}
 const observer=new ResizeObserver(onResize);observer.observe(canvas);addEventListener('scroll',onScroll,{passive:true});addEventListener('resize',onResize);slider.addEventListener('input',onInput);play.addEventListener('click',onPlay);reset.addEventListener('click',onReset);media.addEventListener('change',onReduced);
 window.MOTION={setProgress,getState:()=>Object.assign(MotionScene.state(progress),{playing,mode,reducedMotion:media.matches}),render:(c,w,h,p,o)=>MotionScene.render(c,w,h,p,o),destroy(){stop();destroyed=true;cancelAnimationFrame(renderRaf);observer.disconnect();removeEventListener('scroll',onScroll);removeEventListener('resize',onResize);slider.removeEventListener('input',onInput);play.removeEventListener('click',onPlay);reset.removeEventListener('click',onReset);media.removeEventListener('change',onReduced);}};
 onReduced();if(!media.matches)onScroll();draw();
})();
