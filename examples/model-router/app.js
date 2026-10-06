(function(){
  'use strict';
  const art=document.getElementById('art'),controls=document.getElementById('controls'),play=document.getElementById('play'),replay=document.getElementById('replay');
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches,model=new RouterModel.Router(),motion=new RouterMotion.Transition(reduced);let recorded=true,playing=!reduced,time=0,last=performance.now();
  const buttons={};
  function add(id,label,x,y,w,h,action){const b=document.createElement('button');b.id=id;b.setAttribute('aria-label',label);b.style.left=x/RouterScene.W*100+'%';b.style.top=y/RouterScene.H*100+'%';b.style.width=w/RouterScene.W*100+'%';b.style.height=h/RouterScene.H*100+'%';b.addEventListener('click',()=>{takeControl();action();draw();});controls.appendChild(b);buttons[id]=b;return b;}
  function takeControl(){if(!recorded)return;const s=RouterScene.observed(time);model.policy=s.policy;model.fallback=s.fallback>.5;model.source=s.source;model.destination=s.destination;model.menu=s.menu>.5;model.hover=-1;motion.reset({...s,heads:undefined,cursor:null},performance.now()/1000);recorded=false;playing=false;}
  for(let i=0;i<3;i++)add('policy-'+i,RouterModel.POLICIES[i].label,[794,851,933][i],231,[57,82,78][i],35,()=>model.selectPolicy(i));
  add('fallback','Enable fallback',500,693,95,28,()=>model.toggleFallback());add('source','Fallback source model',620,693,119,27,()=>model.toggleMenu());
  add('deploy','Deploy policy',896,753,120,32,()=>model.deploy());
  for(let i=0;i<4;i++){
    const b=add('route-'+i,'Highlight '+RouterModel.MODELS[i].name,885,330+i*32,130,28,()=>model.hoverRoute(i));
    b.addEventListener('pointerenter',()=>{takeControl();model.hoverRoute(i);draw();});b.addEventListener('pointerleave',()=>{if(!recorded){model.hoverRoute(-1);draw();}});b.addEventListener('focus',()=>{takeControl();model.hoverRoute(i);draw();});b.addEventListener('blur',()=>{if(!recorded){model.hoverRoute(-1);draw();}});
    const row=add('row-'+i,'Highlight '+RouterModel.MODELS[i].name+' route',498,523+i*40,516,37,()=>model.hoverRoute(i));row.addEventListener('pointerenter',()=>{takeControl();model.hoverRoute(i);draw();});row.addEventListener('pointerleave',()=>{if(!recorded){model.hoverRoute(-1);draw();}});
  }
  for(let i=0;i<4;i++){const b=add('option-'+i,RouterModel.MODELS[i].name,624,552.7+i*32,199,32,()=>{model.selectSource(i);buttons.source.focus();});b.addEventListener('pointerenter',()=>{if(!recorded){model.menuHover=i;draw();}});b.addEventListener('focus',()=>{if(!recorded){model.menuHover=i;draw();}});b.setAttribute('role','menuitemradio');}
  function draw(){const semantics=recorded?RouterScene.observed(time):model.snapshot(time),s=recorded?semantics:motion.sample(performance.now()/1000,semantics);art.innerHTML=RouterScene.render(s);play.textContent=playing?'Pause':'Play';buttons.fallback.setAttribute('aria-pressed',String(semantics.fallback>.5));buttons.source.disabled=semantics.fallback<.5;buttons.source.setAttribute('aria-expanded',String(semantics.menu>.5));buttons.source.setAttribute('aria-haspopup','menu');buttons.deploy.disabled=semantics.dirty<.5;for(let i=0;i<3;i++)buttons['policy-'+i].setAttribute('aria-pressed',String(semantics.policy===i));for(let i=0;i<4;i++){buttons['option-'+i].hidden=semantics.menu<.5;buttons['option-'+i].setAttribute('aria-checked',String(semantics.source===i));}}
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!recorded&&model.menu){model.menu=false;draw();buttons.source.focus();}});
  document.addEventListener('pointerdown',e=>{if(!recorded&&model.menu&&!e.target.id?.startsWith('option-')&&e.target!==buttons.source){model.menu=false;draw();}});
  play.addEventListener('click',()=>{if(!recorded){recorded=true;time=0;model.reset();}playing=!playing;last=performance.now();draw();});
  replay.addEventListener('click',()=>{model.reset();recorded=true;time=0;playing=!reduced;last=performance.now();draw();});
  function tick(now){const dt=Math.max(0,(now-last)/1000);last=now;if((recorded&&playing)||(!recorded&&!reduced)){time=(time+dt)%RouterScene.DURATION;draw();}requestAnimationFrame(tick);}draw();requestAnimationFrame(tick);
})();
