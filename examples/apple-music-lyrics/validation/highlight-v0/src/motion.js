(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory(require('./calibration-data.js'));else root.LyricsMotion=factory(root.LyricsCalibration);})(typeof globalThis!=='undefined'?globalThis:this,function(D){
'use strict';
const clamp=(v,a,b)=>Math.min(b,Math.max(a,v)), mix=(a,b,p)=>a+(b-a)*p;
const finite=(v,name)=>{if(!Number.isFinite(v))throw new TypeError(name+' must be finite');return v};
const referenceSpec=D.spec;
function activeAt(items,t){finite(t,'time');return items.findIndex(item=>t>=item.begin&&t<item.end);}
function spanProgress(span,t){finite(t,'time');if(!(span.end>span.begin))return t>=span.end?1:0;return clamp((t-span.begin)/(span.end-span.begin),0,1);}
/** Linear native-PTS interpolation. Every measured knot is retained; no inferred spring constants. */
function sampleSeries(samples,t){
 finite(t,'time');if(!samples.length)return{};
 let a=samples[0],b=a;if(t>=samples.at(-1).t)return{...samples.at(-1)};
 if(t<=a.t)return{...a};
 let lo=0,hi=samples.length-1;while(hi-lo>1){const mid=(lo+hi)>>1;if(samples[mid].t<=t)lo=mid;else hi=mid;}
 a=samples[lo];b=samples[hi];const p=(t-a.t)/(b.t-a.t),out={t};
 for(const key of new Set([...Object.keys(a),...Object.keys(b)])){if(key==='t')continue;out[key]=typeof a[key]==='number'&&typeof b[key]==='number'?mix(a[key],b[key],p):a[key]??b[key];}return out;
}
function referenceAt(t){
 t=clamp(finite(t,'time'),referenceSpec.start,referenceSpec.end);
 const lines=D.tracks.map(track=>{
  const p=sampleSeries(track.samples,t),look=sampleSeries(track.appearance||[],t);
  const active=(track.active||[]).some(s=>t>=s.begin&&t<s.end);
  return{id:track.id,text:track.text||'',fontSize:track.fontSize||32,weight:track.weight||700,
   x:p.x??24,y:p.y??0,w:p.w??250,h:p.h??36,opacity:look.opacity??p.opacity??.5,
   litOpacity:look.litOpacity??(active?1:(look.opacity??p.opacity??.5)),blur:look.blur??p.blur??0,scale:look.scale??p.scale??1,highlight:look.highlight??p.highlight??0,active,
   visible:track.visible?t>=track.visible.begin&&(t<track.visible.end||(t===referenceSpec.end&&track.visible.end>=referenceSpec.end-1e-9)):true,
   spans:(track.spans||[]).map(s=>({...s,progress:spanProgress(s,t)})), measured:p};
 });return{time:t,width:referenceSpec.width,height:referenceSpec.height,lines,follow:true,playing:false,rate:1,reducedMotion:false};
}
/** Supplemental control model; the reference does not establish native gesture behavior. */
class Controller{
 constructor({time=0,mediaTime=referenceSpec.start,playing=false,rate=1,reducedMotion=false}={}){
  this.now=finite(time,'wall time');this.anchorWall=this.now;this.anchorMedia=clamp(finite(mediaTime,'media time'),referenceSpec.start,referenceSpec.end);this.mediaTime=this.anchorMedia;this.rate=finite(rate,'rate');this.reducedMotion=!!reducedMotion;this.playing=!!playing&&!this.reducedMotion;this.frozenAt=null;this.manualPose=null;this.offset=0;this.pointer=null;this.returning=null;
 }
 tick(now){
  finite(now,'wall time');this.now=now;
  if(this.frozenAt!==null)return this.state();
  if(this.playing){const t=this.anchorMedia+(now-this.anchorWall)*this.rate;this.mediaTime=clamp(t,referenceSpec.start,referenceSpec.end);if((t>=referenceSpec.end&&this.rate>0)||(t<=referenceSpec.start&&this.rate<0)){this.playing=false;this.anchorMedia=this.mediaTime;this.anchorWall=now;}}
  if(this.returning&&now-this.returning.time>=this.returning.duration){this.returning=null;this.manualPose=null;this.offset=0;}
  return this.state();
 }
 reanchor(){this.anchorMedia=this.mediaTime;this.anchorWall=this.frozenAt??this.now;}
 setPlaying(value,now){this.tick(now);this.playing=!!value&&!this.reducedMotion;this.reanchor();return this.state();}
 setRate(value,now){finite(value,'rate');this.tick(now);this.rate=clamp(value,-4,4);this.reanchor();return this.state();}
 seek(value,now){finite(value,'media time');this.tick(now);this.mediaTime=clamp(value,referenceSpec.start,referenceSpec.end);this.reanchor();this.pointer=null;this.manualPose=null;this.returning=null;this.offset=0;return this.state();}
 beginManual(y,now){finite(y,'pointer y');this.tick(now);const pose=this.state();this.manualPose=Object.fromEntries(pose.lines.map(l=>[l.id,l.y]));this.offset=0;this.returning=null;this.pointer={y,offset:0};return this.state();}
 moveManual(y,now){finite(y,'pointer y');this.tick(now);if(this.pointer)this.offset=clamp(this.pointer.offset+y-this.pointer.y,-referenceSpec.height,referenceSpec.height);return this.state();}
 endManual(now){this.tick(now);this.pointer=null;return this.state();}
 resumeFollow(now){this.tick(now);const pose=this.state();this.pointer=null;if(!this.manualPose&&!this.returning)return pose;if(this.reducedMotion){this.manualPose=null;this.returning=null;this.offset=0;}else{this.returning={time:now,duration:.45,ys:Object.fromEntries(pose.lines.map(l=>[l.id,l.y]))};this.manualPose=null;this.offset=0;}return this.state();}
 cancelManual(now){return this.resumeFollow(now);}
 setReducedMotion(value,now){this.tick(now);this.reducedMotion=!!value;if(this.reducedMotion){this.playing=false;this.reanchor();}if(this.reducedMotion&&this.returning){this.returning=null;this.manualPose=null;this.offset=0;}return this.state();}
 freeze(now){if(this.frozenAt!==null)return this.state();this.tick(now);this.frozenAt=now;this.pointer=null;return this.state();}
 thaw(now){finite(now,'wall time');if(this.frozenAt!==null){const elapsed=Math.max(0,now-this.frozenAt);this.anchorWall+=elapsed;if(this.returning)this.returning.time+=elapsed;this.frozenAt=null;}this.now=now;return this.tick(now);}
 state(){
  const s=referenceAt(this.mediaTime);s.follow=!this.manualPose&&!this.returning;s.playing=this.playing;s.rate=this.rate;s.reducedMotion=this.reducedMotion;
  if(this.manualPose)s.lines.forEach(l=>{l.y=(this.manualPose[l.id]??l.y)+this.offset;});
  if(this.returning){const now=this.frozenAt??this.now,p=clamp((now-this.returning.time)/this.returning.duration,0,1),q=1-Math.pow(1-p,3);s.lines.forEach(l=>{l.y=mix(this.returning.ys[l.id]??l.y,l.y,q);});}
  if(this.reducedMotion)s.lines.forEach(l=>{l.blur=0;});
  return s;
 }
 needsFrame(){return this.frozenAt===null&&((this.playing&&this.rate!==0)||!!this.returning);}
}
return{W:referenceSpec.width,H:referenceSpec.height,referenceSpec,referenceAt,Controller,clamp,mix,activeAt,spanProgress,sampleSeries};
});
