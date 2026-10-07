(function () {
  'use strict';
  const el = id => document.getElementById(id);
  const canvas=el('scene'),context=canvas.getContext('2d'), config=ClockSceneConfig;
  const preference=window.matchMedia('(prefers-reduced-motion: reduce)');
  const player=ClockPlayback.createController({duration:config.duration,reducedMotion:preference.matches});
  let simulation=ClockMotion.createSimulation(config.motion), raf=0, disposed=false;
  let lastSize=[config.width,config.height], pendingResize=true;
  el('static-mode').checked=preference.matches;
  function status(message) {el('status').textContent=message;}
  function resize() {
    const width=Math.max(280,Math.min(720,Math.round(canvas.parentElement.getBoundingClientRect().width||config.width)));
    const height=Math.round(width*config.height/config.width);
    if (canvas.width!==width || canvas.height!==height) {canvas.width=width;canvas.height=height;}
    lastSize=[width,height];pendingResize=false;
  }
  function draw() {
    if(pendingResize)resize();
    const s=player.snapshot(), state=simulation.stateAt(s.time);
    ClockRenderer.render(context,state.bodies,Object.assign({},config.render,{width:lastSize[0],height:lastSize[1]}));
    el('seek').value=String(s.time);
    el('position').textContent=s.time.toFixed(2)+' / '+s.duration.toFixed(2)+' s';
    el('play').textContent=s.playing?'暂停':'播放';
    el('play').disabled=s.reducedMotion;
    canvas.setAttribute('aria-label','重力时钟 '+state.text.slice(0,2)+':'+state.text.slice(2,4)+':'+state.text.slice(4,6)+'，'+state.bodies.length+' 个独立数字');
    el('loading').hidden=true;
  }
  function frame(now) {raf=0;if(disposed)return;player.tick(now);draw();if(player.snapshot().active)raf=requestAnimationFrame(frame);}
  function schedule() {if(disposed)return;if(raf){cancelAnimationFrame(raf);raf=0;}draw();if(player.snapshot().active)raf=requestAnimationFrame(frame);}
  function toggle() {const s=player.snapshot();(s.playing?player.pause:player.play)(performance.now());schedule();}
  el('play').addEventListener('click',toggle);
  el('replay').addEventListener('click',()=>{player.replay(performance.now());schedule();});
  el('seek').addEventListener('input',e=>{player.seek(Number(e.target.value),performance.now());schedule();});
  el('speed').addEventListener('change',e=>{player.setSpeed(Number(e.target.value),performance.now());schedule();});
  el('static-mode').addEventListener('change',e=>{player.setReducedMotion(e.target.checked,performance.now());status(e.target.checked?'静态模式：可拖动进度逐帧查看':'已关闭静态模式，点击播放开始');schedule();});
  el('gravity').addEventListener('input',e=>{el('gravity-value').value=e.target.value;el('gravity-value').textContent=e.target.value;});
  el('settings').addEventListener('submit',e=>{
    e.preventDefault();
    try {
      const seedText=el('seed').value.trim();
      if(!seedText || !Number.isInteger(Number(seedText)))throw new TypeError('随机种子须为非空整数');
      const next=ClockMotion.createSimulation(Object.assign({},config.motion,{startTime:el('start-time').value.trim(),seed:Number(seedText),gravity:Number(el('gravity').value)}));
      // Validate a real state before replacing the current simulation.
      next.stateAt(0);simulation=next;player.replay(performance.now());status('参数已应用，使用相同种子可重复得到相同轨迹');schedule();
    } catch(error) {status('参数无效：'+error.message);}
  });
  function visibility() {player.setHidden(document.hidden,performance.now());schedule();}
  document.addEventListener('visibilitychange',visibility);
  function preferenceChange(e) {el('static-mode').checked=e.matches;player.setReducedMotion(e.matches,performance.now());status(e.matches?'系统减少动态效果已启用，默认静态查看':'系统减少动态效果已关闭，点击播放开始');schedule();}
  if(preference.addEventListener)preference.addEventListener('change',preferenceChange);else preference.addListener(preferenceChange);
  const observer=typeof ResizeObserver!=='undefined'?new ResizeObserver(()=>{pendingResize=true;schedule();}):null;
  if(observer)observer.observe(canvas.parentElement);else window.addEventListener('resize',()=>{pendingResize=true;schedule();});
  document.addEventListener('keydown',e=>{if(e.code==='Space'&&!/^(INPUT|SELECT|TEXTAREA|BUTTON)$/.test(e.target.tagName)){e.preventDefault();toggle();}});
  window.addEventListener('pagehide',()=>{disposed=true;if(raf)cancelAnimationFrame(raf);raf=0;if(observer)observer.disconnect();});
  window.addEventListener('pageshow',()=>{if(disposed){disposed=false;if(observer)observer.observe(canvas.parentElement);player.setHidden(document.hidden,performance.now());schedule();}});
  if(preference.matches)status('系统减少动态效果已启用，默认静态查看');else player.play(performance.now());
  player.setHidden(document.hidden,performance.now());
  schedule();
})();
