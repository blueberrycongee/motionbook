// Independent implementation of measured geometry and recovered motion constants.
export const SPEC = Object.freeze({travelMs:600, shapeMs:190, receiptExtraMs:200, overshootPx:3, stiffness:140, restDelta:.5, restSpeed:15, squishX:18, squishY:4, sizeReference:360});
export const clamp = (v,a=0,b=1) => Math.min(b,Math.max(a,v));
export function bezier(x1,y1,x2,y2) {
  const coordinate=(t,a,b)=>3*(1-t)**2*t*a+3*(1-t)*t*t*b+t**3;
  return x=>{if(x<=0)return 0;if(x>=1)return 1;let lo=0,hi=1;for(let i=0;i<30;i++){let m=(lo+hi)/2;if(coordinate(m,x1,x2)<x)lo=m;else hi=m;}return coordinate((lo+hi)/2,y1,y2);};
}
export const shapeEase=bezier(.73,.42,.54,1);
const compressEase=bezier(.65,0,.35,1),recoverEase=bezier(.19,0,.48,1);
export function springForDistance(distance) {
  const ratio=distance>0?Math.min(SPEC.overshootPx/distance,.99):0;
  const log=ratio ? -Math.log(ratio) : Infinity;
  const zeta=ratio ? log/Math.hypot(Math.PI,log) : 1;
  const omega=Math.sqrt(SPEC.stiffness);
  function state(ms){
    const sec=ms/1000;
    let displacement,velocity;
    if(zeta===1){displacement=Math.exp(-omega*sec)*(1+omega*sec);velocity=omega**2*sec*Math.exp(-omega*sec);}
    else {const w=omega*Math.sqrt(1-zeta*zeta),decay=Math.exp(-zeta*omega*sec);displacement=decay*(Math.cos(w*sec)+zeta*omega/w*Math.sin(w*sec));velocity=decay*omega**2/w*Math.sin(w*sec);}
    const done=Math.abs(displacement*100)<=SPEC.restDelta&&Math.abs(velocity*100)<=SPEC.restSpeed;
    return {value:done?1:1-displacement,done};
  }
  let naturalMs=0;while(naturalMs<20000&&!state(naturalMs).done)naturalMs+=50;
  const samples=Array.from({length:60},(_,i)=>Math.round(state(naturalMs*i/59).value*10000)/10000);
  function at(p){const x=clamp(p)*59, i=Math.min(58,Math.floor(x));return samples[i]+(samples[i+1]-samples[i])*(x-i);}
  return {zeta,damping:2*zeta*omega,naturalMs,samples,at};
}
export function geometry(composer,body,zoom=1){
  if(!(zoom>0))throw new RangeError('Zoom must be positive');
  const x=(composer.right-body.right)/zoom;
  const y=(Math.min(composer.top,composer.bottom-body.height)-body.top)/zoom;
  const width=body.width/zoom,height=body.height/zoom;
  const sizeFactor=clamp(Math.max(width,height)/SPEC.sizeReference);
  return {x,y,width,height,extraWidth:Math.max(0,composer.width/zoom-width),minScaleX:Math.max(.5,1-SPEC.squishX*sizeFactor/width),minScaleY:Math.max(.5,1-SPEC.squishY*sizeFactor/height),spring:springForDistance(Math.hypot(x,y))};
}
export function frame(g,elapsed,{reducedMotion=false}={}){
  if(reducedMotion)return {x:0,y:0,scaleX:1,scaleY:1,extraWidth:0,textX:0,receiptVisible:true,active:false};
  const phase=clamp(elapsed/SPEC.travelMs), travel=g.spring.at(phase);
  let compression=phase<1/3?compressEase(phase*3):phase<.9?1-recoverEase((phase-1/3)/(.9-1/3)):0;
  const extra=g.extraWidth*(1-shapeEase(clamp(elapsed/SPEC.shapeMs)));
  return {x:g.x*(1-travel),y:g.y*(1-travel),scaleX:1-(1-g.minScaleX)*compression,scaleY:1-(1-g.minScaleY)*compression,extraWidth:extra,textX:-extra,receiptVisible:elapsed>=SPEC.travelMs+SPEC.receiptExtraMs,active:elapsed<SPEC.travelMs+SPEC.receiptExtraMs};
}
export function previousRowOffset(before,after,elapsed,zoom=1){return (before-after)/zoom*(1-shapeEase(clamp(elapsed/SPEC.shapeMs)));}
