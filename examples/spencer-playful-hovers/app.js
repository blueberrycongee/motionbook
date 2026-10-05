(function(){
  'use strict';
  var rows=Array.from(document.querySelectorAll('.project')), fans=rows.map(function(row){return row.querySelector('.fan');}), buttons=rows.map(function(row){return row.querySelector('.summary');});
  var motion=window.ProjectMotion,model=motion.createModel(rows.length),values=rows.map(function(){return 0;}),from=values.slice(),target=values.slice(),started=0,frame=0,autoTimer=0,auto=false,step=0;
  var config=window.ProjectMotionConfig,duration=config.duration_ms,media=window.matchMedia('(prefers-reduced-motion: reduce)'),play=document.getElementById('play'),announcement=document.getElementById('announcement');
  function paint(){fans.forEach(function(fan,i){
    var p=values[i],tiles=fan.querySelector('.tiles');
    fan.style.height=(1+87*p)+'px';
    tiles.style.height=(88-8*p)+'px';tiles.style.opacity=String(p);
    tiles.style.setProperty('--fade-height',(32+14*p)+'px');
    tiles.style.setProperty('--fade-bottom',(-1-p)+'px');
    fan.querySelectorAll('.card').forEach(function(card,j){
      var a=config.rows[i].cards[j].hidden,b=config.rows[i].cards[j].shown;
      function mix(key){return a[key]+(b[key]-a[key])*p;}
      card.style.left=mix('x')+'px';card.style.top=mix('y')+'px';
      card.style.width=mix('width')+'px';card.style.height=mix('height')+'px';
      card.style.transform='rotate('+mix('angle')+'deg)';card.style.zIndex=String(b.z);
    });
    buttons[i].setAttribute('aria-expanded',String(model.active===i));
  });}
  function tick(now){var t=Math.min(1,(now-started)/duration);values=from.map(function(value,i){return motion.interpolate(value,target[i],t);});paint();if(t<1)frame=requestAnimationFrame(tick);else frame=0;}
  function sync(){cancelAnimationFrame(frame);target=model.targets();from=values.slice();if(media.matches){values=target.slice();paint();frame=0;return;}started=performance.now();frame=requestAnimationFrame(tick);}
  function stopAuto(){auto=false;clearTimeout(autoTimer);play.setAttribute('aria-pressed','false');play.innerHTML='<span aria-hidden="true">▷</span> Play sequence';}
  function reset(){stopAuto();model.reset();sync();announcement.textContent='All previews closed.';}
  function next(){if(!auto)return;model.activate(step===4?-1:step);sync();step=(step+1)%5;autoTimer=setTimeout(next,step===0?1000:1850);}
  function startAuto(){stopAuto();if(media.matches){announcement.textContent='Automatic motion is disabled by your reduced-motion preference. Choose a project to show its preview.';return;}auto=true;step=0;play.setAttribute('aria-pressed','true');play.innerHTML='<span aria-hidden="true">Ⅱ</span> Pause sequence';model.reset();next();}
  rows.forEach(function(row,i){
    row.addEventListener('pointerenter',function(event){if(event.pointerType!=='mouse')return;stopAuto();model.hover(i);sync();});
    row.addEventListener('pointerleave',function(event){if(event.pointerType!=='mouse')return;model.leave(i);sync();});
    buttons[i].addEventListener('focus',function(){stopAuto();model.activate(i);sync();});
    buttons[i].addEventListener('blur',function(){if(model.pinned!==i){model.leave(i);sync();}});
    buttons[i].addEventListener('click',function(){stopAuto();model.toggle(i);sync();announcement.textContent=model.pinned===i?buttons[i].querySelector('.name').textContent+' preview held.':'Preview closed.';});
    buttons[i].addEventListener('keydown',function(event){if(event.key==='ArrowDown'||event.key==='ArrowUp'){event.preventDefault();buttons[(i+(event.key==='ArrowDown'?1:-1)+rows.length)%rows.length].focus();}});
  });
  play.addEventListener('click',function(){if(auto)stopAuto();else startAuto();});document.getElementById('reset').addEventListener('click',reset);
  document.addEventListener('keydown',function(event){if(event.key==='Escape')reset();});
  document.addEventListener('visibilitychange',function(){if(document.hidden)stopAuto();});
  media.addEventListener('change',function(){if(media.matches)stopAuto();sync();});
  function resize(){fans.forEach(function(fan){fan.querySelector('.tiles').style.transform='scale('+Math.min(1,fan.getBoundingClientRect().width/520)+')';});}
  if(window.ResizeObserver){new ResizeObserver(resize).observe(document.getElementById('projects'));}else window.addEventListener('resize',resize);
  resize();paint();if(new URLSearchParams(location.search).has('demo'))startAuto();
})();
