/* Original implementation. No Telegram source code is copied. Browser + Node shared runtime. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.SpoilerMotion=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
const mod=(a,b)=>((a%b)+b)%b;
const lerp=(a,b,t)=>a+(b-a)*t;
// The observed reveal is short and nearly uniform at its middle. See evidence/measurement.json.
const REVEAL_MS=180;
// PTS-calibrated radii, normalized to the reference's ~339.2 px farthest corner.
const RADIUS_KNOTS=[[0,0],[8.333,25],[25,58],[41.667,119],[58.333,156],[75,203],[91.667,244],[108.333,286],[125,320],[158.333,405],[180,455]];
function revealRadius(progress,far){const ms=clamp(progress)*REVEAL_MS;for(let i=1;i<RADIUS_KNOTS.length;i++){const a=RADIUS_KNOTS[i-1],b=RADIUS_KNOTS[i];if(ms<=b[0])return lerp(a[1],b[1],(ms-a[0])/(b[0]-a[0]))*far/339.2;}return 455*far/339.2;}
const layerCache=new WeakMap();
const HIDE_MS=240; // Demo affordance, not claimed to exist in the source Telegram UI.
function ease(p){return p*p*(3-2*p);}
function seeded(seed=20221230){let s=seed>>>0;return function(){s+=0x6D2B79F5;let t=s;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return((t^(t>>>14))>>>0)/4294967296;};}
function maxRadius(w,h,x,y){return Math.hypot(Math.max(x,w-x),Math.max(y,h-y));}
function createModel({width=480,height=360,reducedMotion=false}={}){
 let w=Math.max(1,width),h=Math.max(1,height),origin={x:w/2,y:h/2};let from=0,target=0,start=0,duration=0,reduced=!!reducedMotion;
 function value(now){if(reduced||!duration)return target;return lerp(from,target,clamp((now-start)/duration));}
 function transition(next,now,point){const current=value(now);if(next===target)return false;if(point&&current<=0.00001){origin={x:clamp(point.x,0,w),y:clamp(point.y,0,h)};}from=current;target=next;start=now;duration=reduced?0:Math.abs(target-from)*(next?REVEAL_MS:HIDE_MS);return true;}
 return {
  reveal(now,point){return transition(1,now,point);},
  hide(now){return transition(0,now);},
  reset(now=0){from=target=0;start=now;duration=0;origin={x:w/2,y:h/2};},
  resize(width,height){const nx=origin.x/w,ny=origin.y/h;w=Math.max(1,width);h=Math.max(1,height);origin={x:w*nx,y:h*ny};},
  setReducedMotion(v,now=0){const p=value(now);reduced=!!v;if(reduced){from=target;duration=0;}else{from=p;start=now;duration=Math.abs(target-p)*(target?REVEAL_MS:HIDE_MS);}},
  sample(now){const p=value(now);return {progress:p,target,phase:p===0?'hidden':p===1?'revealed':target?'revealing':'hiding',origin:{...origin},width:w,height:h,radius:revealRadius(p,maxRadius(w,h,origin.x,origin.y)),reducedMotion:reduced};}
 };
}
function makeParticles(seed=20221230,count=4600){const rand=seeded(seed);return Array.from({length:count},()=>({x:rand(),y:rand(),angle:rand()*Math.PI*2,phase:rand()*Math.PI*2,speed:0.008+rand()*0.012,life:0.9+rand()*1.2,offset:rand()*5,size:0.55+rand()*0.85,opacity:0.4+rand()*0.55,curl:0.5+rand()*1.6}));}
function particleAt(p,time,width,height){const life=mod(time+p.offset,p.life)/p.life;const angle=p.angle;return {x:mod(p.x+Math.cos(angle)*time*p.speed+Math.sin(time*0.6+p.phase)*0.009,1)*width,y:mod(p.y+Math.sin(angle)*time*p.speed+Math.cos(time*0.53+p.phase)*0.011,1)*height,alpha:Math.sin(life*Math.PI)*p.opacity,size:p.size};}
function maskAlpha(distance,radius,feather){return clamp((distance-radius+feather)/Math.max(0.001,feather*2));}
// Radially symmetric Gaussian convolution of a disk, integrated in image space.
// Explicit alpha avoids browser/native-canvas differences in filter: blur semantics.
function erf(x){const sign=x<0?-1:1,a=Math.abs(x),t=1/(1+0.3275911*a);return sign*(1-(((((1.061405429*t-1.453152027)*t)+1.421413741)*t-0.284496736)*t+0.254829592)*t*Math.exp(-a*a));}
function diskAlpha(distance,radius,sigma){
 if(radius<=0)return 0;if(distance===0)return 1-Math.exp(-radius*radius/(2*sigma*sigma));
 if(distance>radius+4*sigma)return 0;if(radius-distance>4*sigma)return 1;
 const a=Math.max(-radius,distance-4*sigma),b=Math.min(radius,distance+4*sigma),n=64,dx=(b-a)/n;let sum=0;
 for(let i=0;i<n;i++){const x=a+(i+0.5)*dx,y=Math.sqrt(Math.max(0,radius*radius-x*x));sum+=Math.exp(-(((x-distance)/sigma)**2)/2)*erf(y/(Math.SQRT2*sigma));}
 return clamp(sum*dx/(Math.sqrt(2*Math.PI)*sigma));
}
function renderMedia(ctx,{model,time=0,width=model.width,height=model.height,assets,particles,createCanvas}){
 const w=width,h=height,sx=w/model.width,sy=h/model.height;const p=model.progress;
 ctx.save();ctx.beginPath();ctx.roundRect(0,0,w,h,[14,14,0,0]);ctx.clip();
 ctx.drawImage(assets.clear,0,0,w,h);
 if(p<1){
  let layer=layerCache.get(ctx);if(!layer||layer.width!==w||layer.height!==h){layer=createCanvas(w,h);layerCache.set(ctx,layer);}const g=layer.getContext('2d');g.clearRect(0,0,w,h);g.globalCompositeOperation='source-over';g.globalAlpha=1;g.drawImage(assets.blur,0,0,w,h);
  g.fillStyle='rgba(255,248,230,0.10)';g.fillRect(0,0,w,h);
  const t=model.reducedMotion?0:time/1000;
  g.fillStyle='#fff8e9';
  for(const q of particles){const a=particleAt(q,t,w,h);g.globalAlpha=a.alpha;g.beginPath();g.ellipse(a.x,a.y,a.size*w/480,a.size*h/360,0,0,Math.PI*2);g.fill();}
  g.globalAlpha=1;
  if(p>0){
   const radius=model.radius*Math.max(sx,sy),sigma=42*w/480;
   const x=model.origin.x*sx,y=model.origin.y*sy,extent=radius+4*sigma;
   // Gaussian-blurred expanding disk. Its core itself begins translucent.
   // No white touch ring: that ring belongs to the official video's tap tutorial.
   g.save();g.globalCompositeOperation='destination-out';
   const grad=g.createRadialGradient(x,y,0,x,y,extent);
   for(let i=0;i<=96;i++){const q=i/96;grad.addColorStop(q,`rgba(0,0,0,${diskAlpha(q*extent,radius,sigma)})`);}
   g.fillStyle=grad;g.fillRect(0,0,w,h);g.restore();
  }
  ctx.drawImage(layer,0,0);
 }
 ctx.restore();
}
return {clamp,mod,lerp,ease,revealRadius,RADIUS_KNOTS,seeded,maxRadius,createModel,makeParticles,particleAt,maskAlpha,diskAlpha,renderMedia,REVEAL_MS,HIDE_MS};
});
