(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory(require('./calibration-data.js'));else root.PlayerMotion=factory(root.PlayerCalibration);})(typeof globalThis!=='undefined'?globalThis:this,function(Data){
'use strict';
const W=432,H=934,TRAVEL=770;
const clamp=(v,a=0,b=1)=>Math.min(b,Math.max(a,v));
const mix=(a,b,p)=>a+(b-a)*p;
const smooth=(a,b,v)=>{const p=clamp((v-a)/(b-a));return p*p*(3-2*p)};
// Shape-preserving cubic: interpolates only recorded observations, not a claimed native spring.
function channel(samples,key,t){
  const ps=samples.filter(s=>Number.isFinite(s[key])); if(!ps.length)return undefined;
  if(t<=ps[0].t)return ps[0][key]; if(t>=ps.at(-1).t)return ps.at(-1)[key];
  let i=0;while(ps[i+1].t<t)i++;
  const slope=j=>(ps[j+1][key]-ps[j][key])/(ps[j+1].t-ps[j].t);
  const tangent=j=>{if(j===0)return slope(0);if(j===ps.length-1)return slope(j-1);const a=slope(j-1),b=slope(j);if(a*b<=0)return 0;const h0=ps[j].t-ps[j-1].t,h1=ps[j+1].t-ps[j].t,w1=2*h1+h0,w2=h1+2*h0;return(w1+w2)/(w1/a+w2/b)};
  const a=ps[i],b=ps[i+1],h=b.t-a.t,u=(t-a.t)/h;
  return(2*u**3-3*u**2+1)*a[key]+(u**3-2*u**2+u)*h*tangent(i)+(-2*u**3+3*u**2)*b[key]+(u**3-u**2)*h*tangent(i+1);
}
function fromChannels(c){
  const p=clamp(1-c.cardY/TRAVEL), large=clamp((c.coverSize-52.93)/326.07);
  const expanded=c.expandedOpacity??smooth(.13,.79,p);
  return {time:c.t,progress:p,card:{x:c.cardX??0,y:c.cardY,w:c.cardW??W,h:c.cardH??H-c.cardY,r:c.cardR??56*p},cover:{x:c.coverX,y:c.coverY,size:c.coverSize,r:c.coverR??mix(3,10,large)},background:{scale:c.backgroundScale??mix(1,.92,smooth(0,.7,p)),tx:c.backgroundX??0,ty:c.backgroundY??mix(0,22,smooth(0,.7,p)),dim:c.backgroundDim??(.1*smooth(.05,.9,p))},expandedOpacity:expanded,miniOpacity:c.miniOpacity??(1-smooth(.03,.47,p)),barOpacity:c.barOpacity??(1-smooth(.05,.98,p)),handleOpacity:c.handleOpacity??smooth(.25,.9,p),statusOpacity:c.statusOpacity??smooth(.7,.99,p),controlsY:c.controlsY??c.cardY,titleY:c.titleY??c.cardY,backgroundOpacity:c.backgroundOpacity??smooth(0,.1,p),compactGray:c.compactGray??248,tabY:c.tabY??80*smooth(.1,1,p),homeTone:c.homeTone??(c.t>545.45&&c.t<546.6?1:0)};
}
const keys=['cardY','cardX','cardH','cardW','cardR','coverX','coverY','coverSize','coverR','backgroundScale','backgroundX','backgroundY','backgroundDim','expandedOpacity','miniOpacity','barOpacity','handleOpacity','statusOpacity','controlsY','titleY','backgroundOpacity','compactGray','tabY'];
function referenceAt(t){const c={t};for(const key of keys){c[key]=channel(Data.samples,key,t);const appearance=channel(Data.appearanceSamples||[],key,t);if(appearance!==undefined)c[key]=appearance;}return fromChannels(c)}
function stateForProgress(progress){const p=clamp(progress);return fromChannels({cardY:mix(TRAVEL,0,p),cardH:mix(72,H,p),coverX:mix(21.84,27,p),coverY:mix(778.91,100,p),coverSize:mix(52.93,379,p)});}
// Supplemental browser handoff: preserve every current layer when leaving sampled replay.
function createPoseHandoff(pose,time){const base=stateForProgress(pose.progress);const delta={};for(const key of Object.keys(base)){if(['time','progress'].includes(key))continue;if(typeof base[key]==='object'){delta[key]={};for(const sub of Object.keys(base[key]))if(Number.isFinite(pose[key]?.[sub]))delta[key][sub]=pose[key][sub]-base[key][sub];}else if(Number.isFinite(pose[key]))delta[key]=pose[key]-base[key];}return{time,delta};}
function handoffWeight(handoff,time){if(!handoff)return 0;const dt=Math.max(0,time-handoff.time);return dt>=1?0:(1+12*dt)*Math.exp(-12*dt);}
function applyPoseHandoff(pose,handoff,time){const weight=handoffWeight(handoff,time);if(!weight)return pose;const out={...pose};for(const[key,value]of Object.entries(handoff.delta)){if(typeof value==='object'){out[key]={...pose[key]};for(const[sub,delta]of Object.entries(value))out[key][sub]+=delta*weight;}else out[key]=pose[key]+value*weight;}return out;}
class Controller{
 constructor({reducedMotion=false,progress=0,time=0}={}){this.progress=clamp(progress);this.velocity=0;this.target=Math.round(this.progress);this.mode='idle';this.time=time;this.reducedMotion=!!reducedMotion;this.drag=null;}
 state(){return{progress:this.progress,velocity:this.velocity,target:this.target,mode:this.mode};}
 tick(time){if(!Number.isFinite(time)||time<this.time)return this.state();const dt=time-this.time;this.time=time;if(this.mode==='settling'){
   if(this.reducedMotion){this.progress=this.target;this.velocity=0;this.mode='idle';}
   else{const omega=17,d=this.progress-this.target,b=this.velocity+omega*d,e=Math.exp(-omega*dt);this.progress=this.target+(d+b*dt)*e;this.velocity=(this.velocity-omega*b*dt)*e;if(this.progress<0||this.progress>1){this.progress=clamp(this.progress);this.velocity=0;}if(Math.abs(this.progress-this.target)<.0001&&Math.abs(this.velocity)<.001){this.progress=this.target;this.velocity=0;this.mode='idle';}}
 }return this.state();}
 settle(target,time){this.tick(time);this.target=target>=.5?1:0;this.drag=null;if(this.reducedMotion){this.progress=this.target;this.velocity=0;this.mode='idle';}else this.mode=Math.abs(this.progress-this.target)<1e-10&&Math.abs(this.velocity)<1e-10?'idle':'settling';return this.state();}
 dragStart(y,time){this.tick(time);this.drag={y,progress:this.progress,target:this.target,lastY:y,lastTime:time};this.mode='dragging';return this.state();}
 dragMove(y,time){if(this.mode!=='dragging'||!this.drag)return this.state();if(time<this.time)return this.state();const old=this.progress,dt=time-this.drag.lastTime;this.progress=clamp(this.drag.progress-(y-this.drag.y)/TRAVEL);if(dt>0)this.velocity=clamp((this.progress-old)/dt,-4,4);this.time=time;this.drag.lastTime=time;this.drag.lastY=y;return this.state();}
 dragEnd(time,{cancel=false}={}){if(!this.drag)return this.tick(time);if(time-this.drag.lastTime>.1)this.velocity=0;const target=cancel?this.drag.target:(this.progress+this.velocity*.16>.5?1:0);return this.settle(target,time);}
 cancelDrag(time){return this.dragEnd(time,{cancel:true});}
 setReducedMotion(enabled,time){this.tick(time);this.reducedMotion=!!enabled;if(enabled&&this.mode==='settling')return this.settle(this.target,time);return this.state();}
}
return{W,H,TRAVEL,clamp,mix,smooth,channel,fromChannels,referenceAt,stateForProgress,createPoseHandoff,applyPoseHandoff,handoffWeight,Controller,referenceSpec:{start:Data.start,end:Data.end,fps:Data.fps},data:Data};
});
