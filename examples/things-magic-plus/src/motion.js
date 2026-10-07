(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory(require('./calibration-data.js'));else root.MagicMotion=factory(root.MagicCalibration);})(typeof globalThis!=='undefined'?globalThis:this,function(C){
'use strict';
const W=500,H=888,DURATION=C.duration;
const clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,Number.isFinite(x)?x:a));
const mix=(a,b,t)=>a+(b-a)*t;
function sample(knots,t){if(t<=knots[0][0])return knots[0][1];for(let i=1;i<knots.length;i++)if(t<=knots[i][0])return mix(knots[i-1][1],knots[i][1],(t-knots[i-1][0])/(knots[i][0]-knots[i-1][0]));return knots.at(-1)[1];}
const TEXT={project:'A week in Lisbon',description:['A few days of art, walks and good food.','Leave some time for small discoveries.'],headings:['Things to pack','Planning','Things to do'],rows:['Spare camera charger','Travel adapter','Add train dates to calendar','Read about the old town','Borrow a pocket city guide','Explore a small gallery','Take the ferry across the river'],newTitle:'Pack journal'};
function referenceAt(time){
 const t=clamp(Number(time),0,DURATION),s={width:W,height:H,time:t,phase:t<.2?'rest':t<.5?'lift':t<53/30?'drag':t<2.2?'expand':t<6.25?'edit':t<6.7?'collapse':'settled',title:TEXT.newTitle};
 for(const [name,knots]of Object.entries(C.channels))s[name]=sample(knots,t);
 s.titleCount=t<3.13?0:Math.min(TEXT.newTitle.length,Math.floor((t-3.13)/.1)+1);
 s.titleVisible=t>=2.0;s.newRowAlpha=t>=6.233333?1-s.editorAlpha:0;s.cursor=!!(Math.floor(t*2)%2===0&&t>=2&&t<6.3);
 s.keyboardAlpha=s.keyboardY<888?1:0;s.mode='reference';
 return s;
}
function interpolateState(a,b,p){const out={...b};for(const k of Object.keys(b))if(typeof b[k]==='number'&&typeof a[k]==='number')out[k]=mix(a[k],b[k],p);return out;}
function smooth(p){return 1-Math.pow(1-clamp(p),3);}
class Controller{
 constructor({reducedMotion=false}={}){this.reducedMotion=!!reducedMotion;this.time=0;this.playing=false;this.anchor=0;this.anchorTime=0;this.hidden=false;this.hiddenAt=null;this.pointer=null;this.transition=null;this.mode='reference';this.title=TEXT.newTitle;this.draft='';this.commits=0;this.repeat=false;}
 currentTime(now=0){return this.playing&&!this.hidden?clamp(this.anchorTime+Math.max(0,now-this.anchor)/1000,0,DURATION):this.time;}
 seek(t,now=0){this.cancelPointer();this.transition=null;this.mode='reference';this.time=clamp(t,0,DURATION);this.anchorTime=this.time;this.anchor=now;return this.time;}
 play(now=0){if(this.reducedMotion)return false;if(this.mode!=='reference')this.reset(now);if(this.time>=DURATION)this.time=0;this.anchorTime=this.time;this.anchor=now;this.playing=true;return true;}
 pause(now=0){this.time=this.currentTime(now);this.playing=false;this.anchorTime=this.time;return this.time;}
 reset(now=0){this.pause(now);this.time=0;this.anchorTime=0;this.anchor=now;this.pointer=null;this.transition=null;this.mode='reference';this.draft='';return this.state(now);}
 replay(now=0){this.reset(now);return this.play(now);}
 setReducedMotion(value,now=0){if(value)this.pause(now);this.reducedMotion=!!value;if(this.transition&&value){this.time=this.transition.targetTime;this.mode=this.transition.nextMode;this.transition=null;}this.cancelPointer();}
 setHidden(value,now=0){if(value===this.hidden)return;if(value){this.time=this.currentTime(now);this.anchorTime=this.time;this.hiddenAt=now;}else{if(this.transition&&this.hiddenAt!==null)this.transition.start+=Math.max(0,now-this.hiddenAt);this.anchor=now;this.anchorTime=this.time;this.hiddenAt=null;}this.hidden=!!value;this.cancelPointer();}
 beginPointer(id,x,y,now=0,primary=true){if(!primary||this.pointer||this.hidden||this.mode==='editing')return false;const s=this.state(now);if(s.plusAlpha<.5||Math.hypot(x-s.plusX,y-s.plusY)>s.plusR+20)return false;this.pause(now);this.transition=null;this.mode='dragging';this.pointer={id,x,y,startX:x,startY:y,start:now,moved:false,offsetX:s.plusX-x,offsetY:s.plusY-y};this.dragBase={...s};return true;}
 movePointer(id,x,y,now=0){if(this.pointer?.id!==id)return false;this.pointer.x=clamp(x,20,W-20);this.pointer.y=clamp(y,100,H-20);this.pointer.moved ||= Math.hypot(x-this.pointer.startX,y-this.pointer.startY)>6;return true;}
 cancelPointer(id){if(!this.pointer||(id!==undefined&&this.pointer.id!==id))return false;this.pointer=null;this.mode='reference';return true;}
 releasePointer(id,now=0){if(this.pointer?.id!==id)return false;const from=this.state(now),p=this.pointer,valid=!p.moved||(p.x>=20&&p.x<=480&&p.y>=320&&p.y<=565);this.pointer=null;if(!valid){this.mode='reference';return false;}this.draft='';const to={...referenceAt(2.4),title:'',titleCount:0};this.startTransition(from,to,now,400,'editing',2.4);return true;}
 startTransition(from,to,now,duration,nextMode,targetTime){this.mode='transition';this.transition={from,to,start:now,duration:this.reducedMotion?0:duration,nextMode,targetTime};this.state(now);}
 setDraft(text){this.draft=String(text).slice(0,60);}
 commit(now=0){if(this.mode!=='editing')return false;if(!this.draft.trim())return this.cancelEdit(now);this.title=this.draft.trim();const from=this.state(now),to={...referenceAt(6.8),title:this.title,titleCount:this.title.length};this.commits++;this.startTransition(from,to,now,400,'committed',6.8);return true;}
 cancelEdit(now=0){if(this.mode!=='editing')return false;this.startTransition(this.state(now),referenceAt(0),now,300,'reference',0);this.draft='';return true;}
 state(now=0){
  if(this.transition){const tr=this.transition,clock=this.hidden&&this.hiddenAt!==null?this.hiddenAt:now,p=tr.duration?clamp((clock-tr.start)/tr.duration):1;if(p>=1){this.transition=null;this.time=tr.targetTime;this.mode=tr.nextMode;return this.state(now);}const s=interpolateState(tr.from,tr.to,smooth(p));s.mode='transition';return s;}
  if(this.mode==='dragging'&&this.pointer){const p=this.pointer,base={...this.dragBase},lift=this.reducedMotion?1:clamp((now-p.start)/180),active=p.moved||lift>=1;return {...base,mode:'dragging',phase:active?'drag':'lift',plusX:p.x+p.offsetX,plusY:p.y+p.offsetY,plusR:mix(base.plusR,49,smooth(lift)),dragTargets:active?1:0,planningOffset:active&&p.y<=565?58:base.planningOffset,addRowOffset:active&&p.y<=565?58:base.addRowOffset,readRowOffset:active&&p.y<=565?58:base.readRowOffset,borrowRowOffset:active&&p.y<=565?58:base.borrowRowOffset,gap:active&&p.y<=565?58:0,gapHeight:58,gapY:485,gapAlpha:active&&p.y<=565?1:0};}
  if(this.mode==='editing')return {...referenceAt(2.4),title:this.draft,titleCount:this.draft.length,cursor:true,mode:'editing'};
  if(this.mode==='committed')return {...referenceAt(6.8),title:this.title,titleCount:this.title.length,mode:'committed'};
  this.time=this.currentTime(now);if(this.time>=DURATION&&this.playing){if(this.repeat&&!this.reducedMotion){this.time=0;this.anchorTime=0;this.anchor=now;}else this.playing=false;}
  const s=referenceAt(this.time);if(this.reducedMotion){s.cursor=false;}return s;
 }
 needsFrame(){return !this.hidden&&(this.playing||!!this.transition||!!this.pointer&&!this.reducedMotion);}
}
return {W,H,DURATION,TEXT,clamp,mix,sample,referenceAt,interpolateState,Controller,referenceSpec:{width:W,height:H,start:0,end:DURATION,fps:C.fps,timeBase:C.timeBase,sourceSha256:C.sourceSha256}};
});
