import {nativeState, demoState, DURATION} from './scene.mjs';
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
export const COLORS=['#cb3031','#2464d6','#20945f','#7846d5','#353538'];
export const STATUSES=['Paid','Received','Approved','Due'];
export function initialState(reduced=false){return {mode:reduced?'live':'demo',time:0,phase:'editor',age:0,day:13,month:9,year:2026,status:0,color:0,drag:null,reduced};}
function takeControl(s){if(s.mode==='live')return s;const i=Math.round((s.time%DURATION)*60);return {...s,mode:'live',day:i<55?13:i<84?14:15,phase:i<123?'editor':i<325?'confirm':'final',age:0};}
export function reduce(state,a){
 let s=state;
 if(a.type==='reset')return initialState(a.reduced??s.reduced);
 if(a.type==='tick'){
  const dt=Number.isFinite(a.dt)?clamp(a.dt,0,.1):0;
  if(s.mode==='demo')return {...s,time:(s.time+dt)%DURATION};
  let next={...s,age:s.age+dt};
  if(s.phase==='stamping'&&next.age>=(256-123)/60)return {...next,phase:'confirm',age:0};
  if(s.phase==='finishing'&&next.age>=(400-308)/60)return {...next,phase:'final',age:0};
  return next;
 }
 if(a.type==='motion')return a.reduced?{...takeControl(s),reduced:true,phase:s.phase==='stamping'?'confirm':s.phase==='finishing'?'final':takeControl(s).phase}: {...s,reduced:false};
 s=takeControl(s);
 if(a.type==='next'||a.type==='undo')return {...s,phase:'editor',age:0,drag:null};
 if(a.type==='mark'&&s.phase==='editor')return {...s,phase:s.reduced?'confirm':'stamping',age:0,day:Math.round(s.day),drag:null};
 if(a.type==='done'&&s.phase==='confirm')return {...s,phase:s.reduced?'final':'finishing',age:0};
 if(s.phase!=='editor')return s;
 if(a.type==='status')return {...s,status:clamp(a.index,0,3)};
 if(a.type==='color')return {...s,color:clamp(a.index,0,4)};
 if(a.type==='date'){
  const field=['day','month','year'].includes(a.field)?a.field:null;if(!field)return s;
  const value=Number.isFinite(a.value)?a.value:s[field]+(a.delta||0);
  const next={...s,[field]:field==='day'?value:Math.round(value)};
  next.month=clamp(next.month,1,12);next.year=clamp(next.year,1900,2100);
  next.day=clamp(next.day,1,new Date(Date.UTC(next.year,next.month,0)).getUTCDate());
  return next;
 }
 return s;
}
export function drawState(s){
 if(s.mode==='demo')return demoState(s.time);
 let t=s.phase==='editor'?0:s.phase==='stamping'?(123+s.age*60)/60:s.phase==='confirm'?270/60:s.phase==='finishing'?(308+s.age*60)/60:450/60;
 const pose=nativeState(t);pose.mode='live';pose.day=s.day;pose.month=s.month;pose.year=s.year;pose.status=STATUSES[s.status];pose.ink=COLORS[s.color];pose.cursor=null;
 return pose;
}
