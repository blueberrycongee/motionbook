/* Authored gait rebuilt against modern real-horse video, not recovered original motion. */
(function(root){
  const TAU=Math.PI*2, DEG=Math.PI/180;
  const PERIOD=1.4,SPEED=36,DUTY=.635,GROUND=136;
  const ROUTE_START=-170,ROUTE_END=1720,INITIAL_X=675;
  const configs=[
    {id:'hind-near',onset:0,hip:[57,81],center:58,upper:22,a:20.2,b:15.8,pastern:6,side:1,lift:6.0,ground:GROUND},
    {id:'front-near',onset:.25,hip:[116,87],center:109,upper:16,a:19,b:16.5,pastern:6,side:-1,lift:6.5,ground:GROUND},
    {id:'hind-far',onset:.5,hip:[61,80],center:62,upper:22,a:20.2,b:15.8,pastern:6,side:1,lift:6.0,ground:GROUND-1.3},
    {id:'front-far',onset:.75,hip:[119,85.7],center:117,upper:16,a:19,b:16.5,pastern:6,side:-1,lift:6.5,ground:GROUND-1.3}
  ];
  const n=x=>Number(x.toFixed(4)),mod=(x,m)=>((x%m)+m)%m,mix=(a,b,t)=>a+(b-a)*t,clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
  const smooth=x=>{x=clamp(x,0,1);return x*x*x*(x*(x*6-15)+10)};
  // Piecewise cubic Hermite track: [phase, angle, derivative per cycle].
  // Endpoint tangents match, including touchdown and toe-off.
  function curve(q,keys){
    for(let i=0;i<keys.length-1;i++){const a=keys[i],b=keys[i+1];if(q>=a[0]&&q<=b[0]){const h=b[0]-a[0],s=(q-a[0])/h;return (2*s*s*s-3*s*s+1)*a[1]+(s*s*s-2*s*s+s)*h*a[2]+(-2*s*s*s+3*s*s)*b[1]+(s*s*s-s*s)*h*b[2];}}
    return keys[keys.length-1][1];
  }
  const HOOF=[[0,0,0],[.5,0,0],[.6,14,220],[.635,18,0],[.72,5,-190],[.82,-8,0],[.93,-2,55],[1,0,0]];
  const FORE_FLEX=[[0,7,0],[.12,5,0],[.46,3,0],[.55,8,90],[.635,20,180],[.72,47,0],[.8,39,-150],[.91,13,-150],[1,7,0]];
  const HIND_FLEX=[[0,23,0],[.18,20,0],[.48,18,0],[.635,30,100],[.73,56,0],[.84,37,-140],[1,23,0]];
  const PASTERN=[[0,56,0],[.2,44,0],[.5,50,35],[.635,61,0],[.76,66,0],[.93,57,-20],[1,56,0]];
  function ik(origin,target,a,b,side){
    const dx=target[0]-origin[0],dy=target[1]-origin[1],distance=Math.hypot(dx,dy);
    const d=clamp(distance,Math.abs(a-b)+.000001,a+b-.000001),along=(a*a-b*b+d*d)/(2*d),height=Math.sqrt(Math.max(0,a*a-along*along)),ux=dx/distance,uy=dy/distance;
    return [origin[0]+along*ux-side*height*uy,origin[1]+along*uy+side*height*ux];
  }
  function segment(a,b,w1,w2,fullness=.58) {
    const dx=b[0]-a[0],dy=b[1]-a[1],len=Math.hypot(dx,dy),nx=-dy/len,ny=dx/len;
    const p=(x,y)=>`${n(x)} ${n(y)}`;
    const q=(t,w)=>p(a[0]+dx*t+nx*w,a[1]+dy*t+ny*w);
    // Convex proximal belly, gradual tendon taper and rounded joint end.
    return `M${q(0,w1/2)} C${q(.23,w1*fullness)} ${q(.65,w2*.75)} ${q(1,w2/2)} Q${p(b[0]+dx/len*.6,b[1]+dy/len*.6)} ${q(1,-w2/2)} C${q(.68,-w2*.7)} ${q(.26,-w1*.5)} ${q(0,-w1/2)} Q${p(a[0]-dx/len*.8,a[1]-dy/len*.8)} ${q(0,w1/2)}Z`;
  }
  function highlight(a,b,lower=false) {
    const from=lower?.18:.14,to=lower?.53:.66;
    return `M${n(mix(a[0],b[0],from)-.9)} ${n(mix(a[1],b[1],from))} Q${n(mix(a[0],b[0],(from+to)/2)-1.2)} ${n(mix(a[1],b[1],(from+to)/2))} ${n(mix(a[0],b[0],to)-.7)} ${n(mix(a[1],b[1],to))}`;
  }
  function jointMass(center,rx,ry) {
    const [x,y]=center;
    return `M${n(x-rx)} ${n(y)} C${n(x-rx)} ${n(y-ry)} ${n(x+rx)} ${n(y-ry)} ${n(x+rx)} ${n(y)} C${n(x+rx)} ${n(y+ry)} ${n(x-rx)} ${n(y+ry)} ${n(x-rx)} ${n(y)}Z`;
  }
  function pose(seconds,bounds){
    const p=seconds*TAU/PERIOD,routeStart=bounds&&typeof bounds==='object'?bounds.min-170:ROUTE_START,routeEnd=bounds&&typeof bounds==='object'?bounds.max+49:ROUTE_END;
    const x=routeStart+mod(INITIAL_X-routeStart+SPEED*seconds,routeEnd-routeStart);
    const bob=-1.8+.55*Math.cos(p*2+.25),pitch=.48*Math.sin(p*2-.25),theta=pitch*DEG,C=[85,84];
    const worldToBody=point=>{const dx=point[0]-C[0],dy=point[1]-bob-C[1];return[C[0]+dx*Math.cos(theta)+dy*Math.sin(theta),C[1]-dx*Math.sin(theta)+dy*Math.cos(theta)];};
    const bodyToWorld=point=>{const dx=point[0]-C[0],dy=point[1]-C[1];return[C[0]+dx*Math.cos(theta)-dy*Math.sin(theta),bob+C[1]+dx*Math.sin(theta)+dy*Math.cos(theta)];};
    const seat=.8*Math.sin(p*2+.4);
    const transforms={
      'horse-travel':`translate(${n(x-INITIAL_X)} 0)`,
      'horse-bob':`translate(0 ${n(bob)}) rotate(${n(pitch)} 85 84)`,
      'horse-head':`translate(${n(.4*Math.sin(p*2-.1))} 0) rotate(${n(-1.7*Math.sin(p*2+.35))})`,
      'horse-tail':`rotate(${n(2.5*Math.sin(p*.5+.7))})`,
      'horse-rider':`rotate(${n(seat)})`,
      'rider-upper':`rotate(${n(-seat*.72-pitch*.65)} 0 -2)`,
      'rider-arm':`rotate(${n(1.15*Math.sin(p*2+.25))} 0 -27)`
    };
    const paths={},limbs={};
    for(const leg of configs){
      const hind=leg.id.startsWith('hind'),q=mod(seconds/PERIOD-leg.onset,1),stance=q<DUTY,half=SPEED*PERIOD*DUTY/2;
      let relative,lift=0,swing=0;
      if(stance)relative=half-SPEED*PERIOD*q;
      else{const s=(q-DUTY)/(1-DUTY),m=-SPEED*PERIOD*(1-DUTY);swing=s;relative=(2*s*s*s-3*s*s+1)*(-half)+(s*s*s-2*s*s+s)*m+(-2*s*s*s+3*s*s)*half+(s*s*s-s*s)*m;lift=leg.lift*(s<.4?smooth(s/.4):1-smooth((s-.4)/.6));}
      const hoofAngle=curve(q,HOOF)*DEG,pasternAngle=(curve(q,PASTERN)+(hind?4:0))*DEG;
      const footGround=[leg.center+relative,leg.ground-lift],toe=[footGround[0]+4.6,footGround[1]];
      const rotate=point=>{const dx=point[0]-toe[0],dy=point[1]-toe[1];return[toe[0]+dx*Math.cos(hoofAngle)-dy*Math.sin(hoofAngle),toe[1]+dx*Math.sin(hoofAngle)+dy*Math.cos(hoofAngle)];};
      const coronaryWorld=rotate([footGround[0]-.4,footGround[1]-4.7]);
      const fetlockWorld=[coronaryWorld[0]-leg.pastern*Math.cos(pasternAngle+hoofAngle),coronaryWorld[1]-leg.pastern*Math.sin(pasternAngle+hoofAngle)];
      const foot=worldToBody(footGround),coronary=worldToBody(coronaryWorld),fetlock=worldToBody(fetlockWorld);
      const hip=[leg.hip[0]+relative*(hind?.10:.16),leg.hip[1]+(hind?.22:.32)*Math.sin(q*TAU)];
      const requestedFlex=curve(q,hind?HIND_FLEX:FORE_FLEX),desiredReach=Math.sqrt(leg.a*leg.a+leg.b*leg.b+2*leg.a*leg.b*Math.cos(requestedFlex*DEG));
      const targetDistance=Math.hypot(fetlock[0]-hip[0],fetlock[1]-hip[1]);
      const reach=clamp(desiredReach,Math.max(Math.abs(leg.a-leg.b)+.00001,targetDistance-leg.upper+.00001),Math.min(leg.a+leg.b-.00001,targetDistance+leg.upper-.00001));
      const joint=ik(hip,fetlock,leg.upper,reach,hind?-1:1);
      const knee=ik(joint,fetlock,leg.a,leg.b,leg.side);
      const actualFlex=Math.acos(clamp((reach*reach-leg.a*leg.a-leg.b*leg.b)/(2*leg.a*leg.b),-1,1))/DEG;
      paths[`${leg.id}-upper`]=segment(hip,joint,hind?18.5:15.6,hind?11.8:11.2,.65);
      paths[`${leg.id}-middle`]=segment(joint,knee,hind?11.8:11.2,hind?6.0:6.2,.59);
      paths[`${leg.id}-lower`]=segment(knee,fetlock,4.8,3.8,.51);
      paths[`${leg.id}-pastern`]=segment(fetlock,coronary,3.8,3.7,.49);
      paths[`${leg.id}-knee`]=hind?`M${n(knee[0]-4.6)} ${n(knee[1]-1.8)} Q${n(knee[0]-2)} ${n(knee[1]-3.8)} ${n(knee[0]+2.7)} ${n(knee[1]-2.3)} Q${n(knee[0]+4)} ${n(knee[1])} ${n(knee[0]+1.2)} ${n(knee[1]+3.4)} L${n(knee[0]-1.5)} ${n(knee[1]+3)} Q${n(knee[0]-4.2)} ${n(knee[1]+.5)} ${n(knee[0]-4.6)} ${n(knee[1]-1.8)}Z`:jointMass(knee,3.8,3.3);
      paths[`${leg.id}-fetlock`]=jointMass([fetlock[0]-.65,fetlock[1]+.15],2.8,2.65);
      paths[`${leg.id}-upper-texture`]=paths[`${leg.id}-upper`];paths[`${leg.id}-middle-texture`]=paths[`${leg.id}-middle`];
      paths[`${leg.id}-middle-highlight`]=highlight(joint,knee);paths[`${leg.id}-lower-highlight`]=highlight(knee,fetlock,true);
      const hp=(dx,dy)=>{const point=worldToBody(rotate([footGround[0]+dx,footGround[1]+dy]));return `${n(point[0])} ${n(point[1])}`;};
      paths[`${leg.id}-hoof`]=`M${hp(-4.2,-4.7)} Q${hp(-1,-5.1)} ${hp(1.4,-4.7)} Q${hp(3.5,-2.8)} ${hp(4.6,0)} L${hp(-4.8,0)} Q${hp(-5.1,-1.2)} ${hp(-4.2,-4.7)}Z`;
      limbs[leg.id]={phase:q,stance,footLocal:foot,footWorld:[x+footGround[0],687+footGround[1]],toeWorld:[x+toe[0],687+toe[1]],hip,joint,knee,fetlock,coronary,ankle:fetlock,lengths:[leg.upper,leg.a,leg.b,leg.pastern],requestedFlex,actualFlex,hoofAngle:hoofAngle/DEG,pasternAngle:pasternAngle/DEG,reach,reachAdjustment:reach-desiredReach};
    }
    return{transforms,paths,diagnostics:{x,bob,pitch,limbs,speed:SPEED,period:PERIOD,duty:DUTY}};
  }
  if (typeof module!=='undefined'&&module.exports) module.exports={pose,configs,PERIOD,SPEED,DUTY,ROUTE_START,ROUTE_END,curve};
  root.HorseMotion={pose};
  if(typeof document==='undefined')return;
  const nodes=new Map();for(const id of [...Object.keys(pose(0).transforms),...Object.keys(pose(0).paths)])nodes.set(id,document.getElementById(id));
  const reduced=matchMedia('(prefers-reduced-motion: reduce)'),button=document.querySelector('#motion-toggle');
  let paused=reduced.matches,request=0,elapsed=0,lastTime=0;
  let bounds=null;
  const landscape=document.querySelector('.landscape'),scene=document.querySelector('.landscape > svg');
  function measure(){if(!landscape?.getBoundingClientRect||!scene?.getBoundingClientRect)return;const a=landscape.getBoundingClientRect(),b=scene.getBoundingClientRect();if(b.width>0)bounds={min:(a.left-b.left)*1671/b.width,max:(a.right-b.left)*1671/b.width};}
  measure();
  if(typeof ResizeObserver==='function')new ResizeObserver(measure).observe(landscape);
  function render(seconds){const state=pose(seconds,bounds);Object.entries(state.transforms).forEach(([id,value])=>nodes.get(id)?.setAttribute('transform',value));Object.entries(state.paths).forEach(([id,value])=>nodes.get(id)?.setAttribute('d',value));}
  function label(){button.textContent=paused?'Play motion':'Pause motion';button.setAttribute('aria-pressed',String(!paused));}
  function frame(now){if(!paused&&!document.hidden){if(lastTime)elapsed+=Math.min((now-lastTime)/1000,.05);render(elapsed);}lastTime=now;request=requestAnimationFrame(frame);}
  button.addEventListener('click',()=>{paused=!paused;lastTime=0;label();});
  reduced.addEventListener('change',event=>{paused=event.matches;lastTime=0;label();});
  document.addEventListener('visibilitychange',()=>{lastTime=0;});
  window.addEventListener('pagehide',()=>{cancelAnimationFrame(request);request=0;});
  window.addEventListener('pageshow',()=>{if(!request){lastTime=0;request=requestAnimationFrame(frame);}});
  render(0);label();request=requestAnimationFrame(frame);
})(globalThis);
