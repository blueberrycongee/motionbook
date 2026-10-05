/** Source-evidenced native PiP interaction math and portable host state.
 * Coordinates passed to this module are a consistent Cartesian space; UI adapters
 * explicitly choose y-down or native y-up. Native enum mapping lives in evidence.
 * No XPC, live desktop capture, browser account, or remote transport is simulated.
 */
import {fitDisplaySize} from './native-spec.mjs';
const clamp=(v,a,b)=>Math.min(b,Math.max(a,v));
const length=p=>Math.hypot(p.x,p.y);
const sub=(a,b)=>({x:a.x-b.x,y:a.y-b.y});
const add=(a,b)=>({x:a.x+b.x,y:a.y+b.y});
const mul=(a,n)=>({x:a.x*n,y:a.y*n});
export const interactionSpec=Object.freeze({dragThreshold:4,dragTimeFloor:1/240,oldVelocityWeight:.72,newVelocityWeight:.28,
  velocityScale:.55,projectionMin:.18,projectionMax:.45,projectionDivisor:5000,crossHostPenalty:180,crossHostMargin:120,
  directionBonus:.12,includeDragHostSpeed:120,resizeMin:100,resizeMax:400,resizeThreshold:.5,visibleLimit:5,stackStep:{x:28,y:22}});

export const alignmentNames=Object.freeze(['top-left','top-right','bottom-right','bottom-left','top-center','bottom-center']);
export function fallbackAnchors(host,{yDown=true}={}) {
 const f=host.frame,left=f.x+24,right=f.x+f.width-24,top=yDown?f.y+24:f.y+f.height-24,bottom=yDown?f.y+f.height-24:f.y+24;
 return [{alignment:3,point:{x:left,y:bottom}},{alignment:2,point:{x:right,y:bottom}},{alignment:0,point:{x:left,y:top}},{alignment:1,point:{x:right,y:top}}].map(a=>({...a,id:`${host.id}:${a.alignment}`,hostID:host.id,hostFrame:{...f}}));
}
export function nativeRestOffset(alignment,index,size,{yDown=true}={}) {
 const x=[0,3].includes(alignment)?28*index:[1,2].includes(alignment)?-size.width-28*index:-size.width/2;
 const nativeY=[0,1,4].includes(alignment)?-size.height-22*index:22*index;
 return {x,y:yDown?-(nativeY+size.height):nativeY};
}
export function frameAtAnchor(anchor,size,{yDown=true}={}) {
 const a=anchor.alignment,top=[0,1,4].includes(a),left=[0,3].includes(a),center=[4,5].includes(a);
 return {x:anchor.point.x-(center?size.width/2:left?0:size.width),y:anchor.point.y-(yDown?(top?0:size.height):(top?size.height:0)),width:size.width,height:size.height};
}
export function chooseTargetAnchor({current,velocity={x:0,y:0},currentHostID,anchors,hasMoved=false}) {
 const s=interactionSpec,scaled=mul(velocity,s.velocityScale),speed=length(scaled),rawSpeed=length(velocity);
 const time=clamp(s.projectionMin+speed/s.projectionDivisor,s.projectionMin,s.projectionMax);
 const projected=add(current,mul(scaled,time));let best=null;
 for(const anchor of anchors){const cross=anchor.hostID!==currentHostID;
  if(cross&&(!hasMoved&&rawSpeed<s.includeDragHostSpeed))continue;
  if(cross){const f=anchor.hostFrame,m=s.crossHostMargin;if(!f||projected.x<f.x-m||projected.y<f.y-m||projected.x>f.x+f.width+m||projected.y>f.y+f.height+m)continue;}
  const delta=sub(anchor.point,current),distance=length(delta);
  const alignment=distance&&speed?Math.max(0,(delta.x*scaled.x+delta.y*scaled.y)/(distance*speed)):0;
  const score=length(sub(anchor.point,projected))+(cross?s.crossHostPenalty:0)-s.directionBonus*speed*alignment;
  if(!best||score<best.score)best={anchor,score};
 }
 return {anchor:best?.anchor??null,score:best?.score??Infinity,projected,projectionTime:time,scaledVelocity:scaled};
}
export class DragSession {
 constructor({presentationID,pointer,anchor,time=0,wasFront=true}) {this.presentationID=presentationID;this.startPointer={...pointer};this.lastPointer={...pointer};this.startAnchor={...anchor};this.currentAnchor={...anchor};this.lastTime=time;this.velocity={x:0,y:0};this.hasMoved=false;this.wasFront=wasFront;}
 update(pointer,time){const dt=Math.max(time-this.lastTime,interactionSpec.dragTimeFloor),instant=mul(sub(pointer,this.lastPointer),1/dt);
  this.velocity=add(mul(this.velocity,.72),mul(instant,.28));this.lastPointer={...pointer};this.lastTime=time;
  const delta=sub(pointer,this.startPointer);if(length(delta)>=4)this.hasMoved=true;
  this.currentAnchor=add(this.startAnchor,delta);return this.snapshot();}
 snapshot(){return {presentationID:this.presentationID,hasMoved:this.hasMoved,click:this.wasFront&&!this.hasMoved,currentAnchor:{...this.currentAnchor},velocity:{...this.velocity}};}
}
export function resizeDisplaySize({startSize,startPointerY,pointerY,direction=1,backingScale=1,currentSize=startSize}){
 const scale=Number.isFinite(backingScale)&&backingScale>0?backingScale:1;
 const requested=clamp(startSize+(pointerY-startPointerY)*direction,100,400),snapped=Math.round(requested*scale)/scale;
 return Math.abs(snapped-currentSize)<.5?currentSize:snapped;
}
export function motionSpring({index,leadIndex=0,dragging=false,programmatic=false}){
 if(index===leadIndex)return dragging?{mass:1,stiffness:900,damping:55}:{mass:1,stiffness:320,damping:42};
 let distance=Math.abs(index-leadIndex);if(programmatic)distance*=1+.45*distance;
 return {mass:1,stiffness:(dragging?260:150)/(1+.18*distance),damping:(dragging?32:30)/(1+.08*distance)};
}
/** Closed-form damped oscillator. Remains stable across long animation frames. */
export function advanceSpring({position,velocity=0,target},seconds,{mass=1,stiffness=260,damping=32}={}){
 if(seconds<=0)return {position,velocity};const x=position-target,alpha=damping/(2*mass),w2=stiffness/mass,disc=alpha*alpha-w2;
 let displacement,v;
 if(Math.abs(disc)<1e-10){const c=velocity+alpha*x,e=Math.exp(-alpha*seconds);displacement=(x+c*seconds)*e;v=(c-alpha*(x+c*seconds))*e;}
 else if(disc<0){const w=Math.sqrt(-disc),b=(velocity+alpha*x)/w,cs=Math.cos(w*seconds),sn=Math.sin(w*seconds),e=Math.exp(-alpha*seconds);displacement=e*(x*cs+b*sn);v=e*((-alpha*x+b*w)*cs+(-alpha*b-x*w)*sn);}
 else {const r=Math.sqrt(disc),r1=-alpha+r,r2=-alpha-r,c1=(velocity-r2*x)/(r1-r2),c2=x-c1,e1=Math.exp(r1*seconds),e2=Math.exp(r2*seconds);displacement=c1*e1+c2*e2;v=c1*r1*e1+c2*r2*e2;}
 return {position:target+displacement,velocity:v};
}

export class PresentationStack {
 constructor({maxDisplaySize=200,onFocus=()=>false,now=()=>Date.now()/1000,shouldShowTask=()=>true}={}){
  this.maxDisplaySize=maxDisplaySize;this.onFocus=onFocus;this.now=now;this.shouldShowTask=shouldShowTask;this.items=new Map();this.renderedPositions=new Map();this.order=[];this.hosts=new Map();this.activeThreadID=null;this.suppressed=new Set();this.placement='pinned';this.anchorID=null;this.hostID=null;this.drag=null;this.deferred=new Map();
 }
 registerHost(host){if(!host?.id||!host.frame)throw new TypeError('Host id and frame required');this.hosts.set(host.id,structuredClone(host));if(!this.hostID)this.hostID=host.id;return this.currentHost();}
 unregisterHost(id){this.hosts.delete(id);if(this.hostID===id){this.hostID=this.hosts.keys().next().value??null;this.anchorID=null;}}
 updateHost(id,frame){const host=this.hosts.get(id);if(!host)return false;const old=host.frame,dx=frame.x-old.x,dy=frame.y-old.y;host.frame={...frame};if(host.anchors)host.anchors=host.anchors.map(a=>({...a,point:add(a.point,{x:dx,y:dy}),hostFrame:{...frame}}));return true;}
 currentHost(){return this.hosts.get(this.hostID)??null;}
 anchors(){return [...this.hosts.values()].filter(h=>h.available!==false).flatMap(h=>h.anchors?(h.anchors.map(a=>({...a,hostID:h.id,hostFrame:h.frame}))):fallbackAnchors(h));}
 setAnchor(id){const anchor=this.anchors().find(x=>x.id===id);if(!anchor)return false;this.anchorID=id;this.hostID=anchor.hostID;return true;}
 currentAnchor(){const all=this.anchors();return all.find(x=>x.id===this.anchorID)??all.find(x=>x.hostID===this.hostID)??null;}
 upsert(item){if(!item.id||!item.threadID)throw new TypeError('Presentation identity required');const prior=this.items.get(item.id);
  this.items.set(item.id,{kind:'browser',sourceSize:{width:960,height:600},...prior,...item,generation:(prior?.generation??0)+1,completed:false,expiresAt:null});
  if(!prior)this.order.unshift(item.id);return this.items.get(item.id);}
 remove(id){const pending=this.deferred.get(id)||[];this.deferred.delete(id);this.items.delete(id);this.renderedPositions.delete(id);this.order=this.order.filter(x=>x!==id);for(const resolve of pending)resolve(true);if(this.drag?.presentationID===id)this.drag=null;}
 invalidate(id){const item=this.items.get(id);if(item?.kind==='computer'&&item.completed)return new Promise(resolve=>{const waiting=this.deferred.get(id)||[];waiting.push(resolve);this.deferred.set(id,waiting)});this.remove(id);return Promise.resolve(true);}
 invalidateTurn(threadID,turnID){for(const [id,item]of this.items)if(item.threadID===threadID&&item.turnID===turnID)this.remove(id);}
 completeThread(threadID){let count=0;for(const item of this.items.values())if(item.threadID===threadID&&!item.completed){item.completed=true;item.completionStartedAt=this.now();item.expiresAt=item.kind==='computer'?this.now()+30:null;count++}return count;}
 expire(){const now=this.now();for(const [id,item]of this.items)if(item.expiresAt!==null&&item.expiresAt<=now)this.remove(id);}
 promote(id){if(!this.items.has(id))return false;this.order=[id,...this.order.filter(x=>x!==id)];return true;}
 setPlacement(placement){if(!['home','pinned','pet'].includes(placement))throw new TypeError('Unknown placement');this.placement=placement;}
 setActiveThread(id){this.activeThreadID=id;}
 hideThread(id){this.suppressed.add(id);}
 hideAllActive(){for(const item of this.items.values())this.suppressed.add(item.threadID);}
 showThread(id){this.suppressed.delete(id);}
 showAll(){this.suppressed.clear();}
 visible(){this.expire();const host=this.currentHost(),scope=host?.presentationScope??'all',homeAvailable=host?.codexHomeAvailable??true;return this.order.map(id=>this.items.get(id)).filter(item=>item&&this.shouldShowTask(item.threadID)&&!this.suppressed.has(item.threadID)&&(scope==='all'||item.threadID===this.activeThreadID)&&(this.placement!=='home'||scope==='all'||homeAvailable)).slice(0,5);}
 displaySize(id){const item=this.items.get(id);return item?fitDisplaySize(item.sourceSize.width,item.sourceSize.height,this.maxDisplaySize):null;}
 recordRenderedPosition(id,position){if(!this.items.has(id))return false;this.renderedPositions.set(id,{...position});return true;}
 renderedAnchor(){const anchor=this.currentAnchor(),visible=this.visible();return meanRenderedStackAnchor(visible.map((item,index)=>({position:this.renderedPositions.get(item.id),restOffset:nativeRestOffset(anchor?.alignment??2,index,this.displaySize(item.id)),initialized:this.renderedPositions.has(item.id),contributes:true})),anchor?.point??{x:0,y:0});}
 beginDrag(id,pointer,time=this.now()){const anchor=this.currentAnchor(),visible=this.visible(),index=visible.findIndex(x=>x.id===id);if(!this.items.has(id)||!anchor||index<0)return false;const position=this.renderedPositions.get(id),rest=nativeRestOffset(anchor.alignment,index,this.displaySize(id));const startAnchor=position?sub(position,rest):anchor.point;this.drag=new DragSession({presentationID:id,pointer,anchor:startAnchor,time,wasFront:visible[0]?.id===id});return true;}
 updateDrag(pointer,time=this.now()){return this.drag?.update(pointer,time)??null;}
 endDrag(){if(!this.drag)return null;const result=this.drag.snapshot(),actualAnchor=this.renderedAnchor();this.drag=null;const target=chooseTargetAnchor({current:actualAnchor,velocity:result.velocity,currentHostID:this.hostID,anchors:this.anchors(),hasMoved:result.hasMoved});
  const shouldFocus=result.click;if(shouldFocus)this.onFocus(result.presentationID);this.promote(result.presentationID);if(target.anchor)this.setAnchor(target.anchor.id);
  const visible=this.visible(),leadIndex=Math.max(0,visible.findIndex(x=>x.id===result.presentationID));const releaseVelocities=visible.map((item,index)=>({id:item.id,velocity:snapReleaseVelocity(result.velocity,Math.abs(index-leadIndex))}));
  return {...result,actualAnchor,target:target.anchor,shouldFocus,releaseVelocities,programmaticMove:false};}
 snapshot(){this.expire();return {items:[...this.items.values()].map(x=>({...x})),order:[...this.order],visible:this.visible().map(x=>x.id),placement:this.placement,suppressed:[...this.suppressed],activeThreadID:this.activeThreadID,hostID:this.hostID,anchorID:this.anchorID,maxDisplaySize:this.maxDisplaySize,drag:this.drag?.snapshot()??null,deferredCount:[...this.deferred.values()].reduce((n,x)=>n+x.length,0)};}
}
/** Native control press may become a stack drag once movement reaches 4pt. */
export class ControlPressSession {
 constructor({controlID,presentationID,pointer,time=0}){this.controlID=controlID;this.presentationID=presentationID;this.pointer={...pointer};this.time=time;this.cancelled=false;this.dragging=false;}
 move(pointer){if(length(sub(pointer,this.pointer))>=4){this.cancelled=true;this.dragging=true;}return {dragging:this.dragging,startPointer:{...this.pointer},presentationID:this.presentationID,startTime:this.time};}
 release(hitControlID){const action=!this.cancelled&&hitControlID===this.controlID?this.controlID:null;this.cancelled=true;return action;}
}
export const resizeHandles=Object.freeze([{id:'bottom-right',fixedAlignment:0},{id:'bottom-left',fixedAlignment:1},{id:'top-left',fixedAlignment:2},{id:'top-right',fixedAlignment:3}]);
export function resizeHandleAt(point,items){for(const item of [...items].filter(x=>x.visible!==false&&!x.exiting).sort((a,b)=>(b.zIndex??0)-(a.zIndex??0))){const r=item.frame;for(const h of resizeHandles){const left=h.id.endsWith('left'),top=h.id.startsWith('top'),x=left?r.x:r.x+r.width-14,y=top?r.y:r.y+r.height-14;if(point.x>=x&&point.x<=x+14&&point.y>=y&&point.y<=y+14)return {...h,presentationID:item.id,frame:{x,y,width:14,height:14}};}}return null;}
export function fixedResizeAnchor({frame,originalAlignment,fixedAlignment}){const alignment=[4,5].includes(originalAlignment)?originalAlignment:fixedAlignment,left=[0,3].includes(alignment),top=[0,1,4].includes(alignment),center=[4,5].includes(alignment);return {alignment,point:{x:frame.x+(center?frame.width/2:left?0:frame.width),y:frame.y+(top?0:frame.height)},direction:top?1:-1};}
/** Exact recovered PIPStackItemMotion step; unlike analytic advanceSpring, this is
 * deliberately frame-step dependent semi-implicit Euler. Native uses the same
 * clamped timestep on the first and subsequent display-link frames. */
export function nativeSpringStep({position,velocity={x:0,y:0},target},seconds,{stiffness=260,damping=32}={}){
 const dt=clamp(seconds,1/120,1/30),error=sub(target,position);
 const nextVelocity={x:velocity.x+dt*(stiffness*error.x-damping*velocity.x),y:velocity.y+dt*(stiffness*error.y-damping*velocity.y)};
 const nextPosition=add(position,mul(nextVelocity,dt));
 return {position:nextPosition,velocity:nextVelocity,settled:length(error)<=.5&&length(nextVelocity)<=2,dt};
}
export function rectUnion(rectangles){const r=rectangles.filter(x=>x&&x.width>=0&&x.height>=0);if(!r.length)return null;const x=Math.min(...r.map(x=>x.x)),y=Math.min(...r.map(x=>x.y)),right=Math.max(...r.map(x=>x.x+x.width)),top=Math.max(...r.map(x=>x.y+x.height));return {x,y,width:right-x,height:top-y};}
export const expandRect=(r,padding)=>({x:r.x-padding,y:r.y-padding,width:r.width+2*padding,height:r.height+2*padding});
/** Native y-up envelope mathematics. Explicit rounding/confinement is supplied
 * by the native adapter; model tests keep the unsnapped geometry observable. */
export class MotionEnvelope {
 constructor(){this.expandedSize=null;this.frozenResize=null;}
 frame({contentFrames,expanded=false,resizing=false,visibleCount=contentFrames.length,exitingCount=0,fixedPoint,alignment=2}){
  const c=rectUnion(contentFrames);if(!c)return null;
  if(!expanded){this.expandedSize=null;this.frozenResize=null;return expandRect(c,66);}
  if(resizing){if(this.frozenResize)return {...this.frozenResize};const m=Math.max(visibleCount+exitingCount-1,0),o=246,w=Math.max(c.width+2*o,400+28*m+2*o),h=Math.max(c.height+2*o,400+22*m+2*o),f=fixedPoint??{x:c.x+c.width/2,y:c.y+c.height/2},fx=[0,3].includes(alignment)?0:[1,2].includes(alignment)?1:.5,bottom=[2,3,5].includes(alignment);const r={x:f.x-w*fx+o*(2*fx-1),y:bottom?f.y-o:f.y-h+o,width:w,height:h};this.frozenResize=rectUnion([r,expandRect(c,o)]);return {...this.frozenResize};}
  this.frozenResize=null;const desired={width:c.width+492,height:c.height+492};this.expandedSize=this.expandedSize?{width:Math.max(this.expandedSize.width,desired.width),height:Math.max(this.expandedSize.height,desired.height)}:desired;
  return {x:c.x+c.width/2-this.expandedSize.width/2,y:c.y+c.height/2-this.expandedSize.height/2,...this.expandedSize};
 }
 recordAppliedResizeFrame(frame){this.frozenResize=frame?{...frame}:null;}
}
export function snapToBacking(value,scale=1){const s=Number.isFinite(scale)&&scale>0?scale:1,n=value*s;return Math.sign(n)*Math.floor(Math.abs(n)+.5)/s;}
export function applyNativeEnvelope(frame,{mode='stationary',visibleScreen,backingScale=1}={}){
 let result={...frame,width:Math.max(1,frame.width),height:Math.max(1,frame.height)};
 if(mode==='stationary')return result;
 if(mode==='resize')result={x:snapToBacking(result.x,backingScale),y:snapToBacking(result.y,backingScale),width:snapToBacking(result.width,backingScale),height:snapToBacking(result.height,backingScale)};
 if(visibleScreen){const s=visibleScreen;result.x=Math.max(s.x,Math.min(result.x,s.x+s.width-result.width));result.y=Math.max(s.y,Math.min(result.y,s.y+s.height-result.height));}
 result.x=snapToBacking(result.x,backingScale);result.y=snapToBacking(result.y,backingScale);
 if(mode==='resize'){result.x=Math.floor(result.x);result.y=Math.floor(result.y);}
 return result;
}
/** Deterministic model of the native CVDisplayLink producer/main-queue handshake.
 * The native implementation uses atomic pending state and a weak owner; this
 * class exposes the same accept/drop/drain decisions for unit tests. */
export class DisplayLinkCoalescer {
 constructor(){this.pending=false;this.timestamp=null;}
 acceptOutputHostTime(hostTime,hostClockFrequency){if(this.pending)return false;this.pending=true;this.timestamp=hostTime/hostClockFrequency;return true;}
 drain({exists=true,running=true}={}){const timestamp=this.timestamp;this.pending=false;this.timestamp=null;return exists&&running?timestamp:null;}
 reset(){this.pending=false;this.timestamp=null;}
}

/** Native currentStackAnchorOrDefault0x2451c: mean origin-restOffset, BEFORE promotion. */
export function meanRenderedStackAnchor(items,fallback={x:0,y:0}){let x=0,y=0,count=0;for(const item of items){if(item.initialized===false||item.contributes===false||!item.position||!item.restOffset)continue;x+=item.position.x-item.restOffset.x;y+=item.position.y-item.restOffset.y;count++;}return count?{x:x/count,y:y/count}:{...fallback};}
/** Native moveStackToAnchor0x208c0..0x209d0: overwrite, not add or preserve. */
export function snapReleaseVelocity(dragVelocity,distanceFromLead=0){const factor=length(dragVelocity)>=120?.25/(1+.45*Math.abs(distanceFromLead)):0;return {x:dragVelocity.x*factor,y:dragVelocity.y*factor};}
