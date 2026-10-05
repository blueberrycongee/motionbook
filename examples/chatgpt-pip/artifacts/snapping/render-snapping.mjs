import {gzipSync} from 'node:zlib';
/** Effect-only offline render of the approved v4 snap sequence.
 * Scripted pointer inputs + 60Hz source solver; no tween/easing replaces the spring.
 */
import {createRequire} from 'node:module';import fs from 'node:fs/promises';import path from 'node:path';import assert from 'node:assert/strict';
import {fallbackAnchors,DragSession,chooseTargetAnchor,motionSpring,nativeSpringStep,nativeRestOffset} from '../../src/stack-behavior.mjs';
const require=createRequire(import.meta.url),sharp=require('sharp'),here=import.meta.dirname,root=path.resolve(here,'../..');
const contract=JSON.parse(await fs.readFile(path.join(root,'test/fixtures/snap-reference-vector.json'),'utf8'));
const img='data:image/png;base64,'+(await fs.readFile(path.join(root,'public/fixtures/initial.png'))).toString('base64');
const host={id:'fixture-host',frame:{x:46,y:214,width:1188,height:478}};
const anchors=fallbackAnchors(host),initial=anchors.find(a=>a.alignment===2),releaseAnchor={x:760,y:492};
const size={width:240,height:150},cursorOffset={x:-120,y:-75},dt=1/60,chapterSeconds=6.5;
const add=(a,b)=>({x:a.x+b.x,y:a.y+b.y}),mix=(a,b,t)=>({x:a.x+(b.x-a.x)*t,y:a.y+(b.y-a.y)*t});
const magnitude=p=>Math.hypot(p.x,p.y),round=n=>Math.round(n*100)/100;
const pointName={0:'Top left',1:'Top right',2:'Bottom right',3:'Bottom left'};
function simulate(kind){const start=.7,dragDuration=kind==='slow'?2.2:1.4,release=start+dragDuration;
 const items=Array.from({length:3},(_,index)=>({index,position:add(initial.point,nativeRestOffset(2,index,size)),velocity:{x:0,y:0},target:null}));
 let drag=null,choice=null,alignment=2,anchor={...initial.point},running=false,settledAt=null,releaseState=null;const history=[];
 for(let frame=0;frame<=chapterSeconds*60;frame++){const time=frame*dt;let held=false,pointer=null;
  if(time>=start-1e-9&&time<=release+1e-9){held=true;if(!drag)drag=new DragSession({presentationID:'front',pointer:add(initial.point,cursorOffset),anchor:initial.point,time:start});
   const elapsed=Math.max(0,time-start);let commanded;
   if(kind==='slow')commanded=mix(initial.point,releaseAnchor,Math.min(1,elapsed/dragDuration));
   else {const pre={x:1100,y:612},preDuration=1.2;commanded=elapsed<=preDuration?mix(initial.point,pre,elapsed/preDuration):mix(pre,releaseAnchor,Math.min(1,(elapsed-preDuration)/.2));}
   pointer=add(commanded,cursorOffset);drag.update(pointer,time);anchor={...commanded};running=true;
  }
  if(!choice&&time>=release-1e-9){held=false;const d=drag.snapshot(),commandedAnchor={...anchor};const meanAnchor=items.reduce((sum,item)=>{const offset=nativeRestOffset(alignment,item.index,size);return {x:sum.x+(item.position.x-offset.x)/items.length,y:sum.y+(item.position.y-offset.y)/items.length}},{x:0,y:0});choice=chooseTargetAnchor({current:meanAnchor,velocity:d.velocity,currentHostID:host.id,anchors,hasMoved:d.hasMoved});
   releaseState={time,anchor:meanAnchor,commandedAnchor,pointer:add(commandedAnchor,cursorOffset),velocity:{...d.velocity},speed:magnitude(d.velocity),projection:choice.projected,projectionTime:choice.projectionTime,target:choice.anchor,score:choice.score};
   alignment=choice.anchor.alignment;anchor={...choice.anchor.point};running=true;
   // Recovered moveStackToAnchor release rule: quarter-speed impulse, then distance attenuation.
   for(const item of items){const factor=magnitude(d.velocity)>=120?.25/(1+.45*item.index):0;item.velocity={x:d.velocity.x*factor,y:d.velocity.y*factor};}
   releaseState.injectedVelocities=items.map(item=>({...item.velocity}));
  }
  if(running){let allSettled=true;for(const item of items){item.target=add(anchor,nativeRestOffset(alignment,item.index,size));const state=nativeSpringStep({position:item.position,velocity:item.velocity,target:item.target},dt,motionSpring({index:item.index,dragging:held}));item.position=state.position;item.velocity=state.velocity;allSettled&&=state.settled;}
   if(choice&&allSettled){running=false;settledAt??=time;}
  }
  history.push({time,held,pointer,anchor:{...anchor},alignment,released:!!choice,running,settledAt,items:items.map(i=>({index:i.index,position:{...i.position},velocity:{...i.velocity},target:i.target?{...i.target}:null})),releaseState:releaseState?structuredClone(releaseState):null});
 }
 return {kind,start,release,settledAt,releaseState,history};
}
const slow=simulate('slow'),fast=simulate('fast');
assert.deepEqual(slow.releaseState.commandedAnchor,fast.releaseState.commandedAnchor);assert.deepEqual(slow.releaseState.pointer,fast.releaseState.pointer);
for(const test of [slow,fast])for(let i=0;i<3;i++){assert.ok(Math.abs(test.releaseState.injectedVelocities[i].x-test.releaseState.velocity.x*.25/(1+.45*i))<1e-9);assert.ok(Math.abs(test.releaseState.injectedVelocities[i].y-test.releaseState.velocity.y*.25/(1+.45*i))<1e-9);}
assert.equal(slow.releaseState.target.alignment,2);assert.equal(fast.releaseState.target.alignment,0);
assert.ok(slow.settledAt!==null&&fast.settledAt!==null);
// Direct source regression vector from static disassembly, independent of scripted cases.
const vector=contract.motion_integrator.test_vector;
const v=nativeSpringStep({position:{x:vector.origin[0],y:vector.origin[1]},velocity:{x:vector.velocity[0],y:vector.velocity[1]},target:{x:vector.target[0],y:vector.target[1]}},vector.dt,{stiffness:vector.stiffness,damping:vector.damping});
assert.ok(Math.abs(v.position.x-vector.new_origin_approx[0])<1e-10);assert.ok(Math.abs(v.velocity.x-vector.new_velocity_approx[0])<1e-10);assert.equal(v.settled,true);
const traceJSON=JSON.stringify({sourceVersion:contract.version,simulationHz:60,renderFps:30,pointerInput:'explicit piecewise-linear fixture only',animation:'source semi-implicit Euler; no tween',releaseRule:'source corrections applied in this new renderer: mean lagged anchor; quarter-speed thresholded impulse; follower attenuation; held target follows sub4pt inputs. Approved v4 behavior preserved',slow,fast},null,2);
await fs.writeFile(path.join(here,'trajectory-trace.json.gz.b64'),gzipSync(Buffer.from(traceJSON)).toString('base64')+'\n');
console.log(JSON.stringify({slow:{speed:slow.releaseState.speed,target:slow.releaseState.target.id,settleSeconds:slow.settledAt-slow.release},fast:{speed:fast.releaseState.speed,target:fast.releaseState.target.id,settleSeconds:fast.settledAt-fast.release},sourceVectorPassed:true,sourceReleaseAssertionsPassed:true}));
function tile(item){const {x,y}=item.position,id=item.index;return `<g transform="translate(${x} ${y})"><rect width="240" height="150" rx="8" fill="#f0f0f0" filter="url(#shadow)"/><clipPath id="tile${id}"><rect width="240" height="150" rx="8"/></clipPath><g clip-path="url(#tile${id})"><image href="${img}" width="240" height="150"/></g></g>`;}
function cursor(p,held){return `<g transform="translate(${p.x} ${p.y})"><circle r="${held?18:12}" fill="${held?'#70b69826':'#70b69810'}"/><path d="M0 0L0 22l6-6 5 10 4-2-4-10 9-1Z" fill="#263a2d" stroke="white" stroke-width="1.3"/></g>`;}
function render(caseData,localTime,{slowMotion=false}={}){const f=caseData.history[Math.min(caseData.history.length-1,Math.round(localTime*60))],release=f.releaseState;
 let b='<rect x="0" y="178" width="1280" height="560" fill="#f7f9f7"/><rect x="46" y="214" width="1188" height="478" rx="18" fill="#edf2ed" stroke="#dce7dc"/>';
 for(const item of [...f.items].reverse())b+=tile(item);
 if(f.held&&f.pointer)b+=cursor(f.pointer,true);else if(release&&localTime-caseData.release<1)b+=cursor(release.pointer,false);else if(!release)b+=cursor(add(initial.point,cursorOffset),false);
 return `<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="560" viewBox="0 178 1280 560"><defs><filter id="shadow" x="-35%" y="-40%" width="170%" height="200%"><feDropShadow dx="0" dy="6" stdDeviation="10" flood-color="black" flood-opacity=".16"/></filter></defs>${b}</svg>`;
}
const renderFps=30,totalSeconds=16;await fs.mkdir(path.join(here,'frames'),{recursive:true});
for(let i=0;i<totalSeconds*renderFps;i++){const t=i/renderFps;let which,localTime,slowMotion=false;if(t<6.5){which=slow;localTime=t;}else if(t<13){which=fast;localTime=t-6.5;}else{which=fast;localTime=fast.release+(t-13)/2;slowMotion=true;}const buffer=Buffer.from(render(which,localTime,{slowMotion}));await sharp(buffer).png().toFile(path.join(here,`frames/frame-${String(i).padStart(4,'0')}.png`));if([108,261,420].includes(i))await sharp(buffer).png().toFile(path.join(here,`snap-state-${i}.png`));}
console.log('480 frames rendered at 30fps from 60Hz source-physics history.');
