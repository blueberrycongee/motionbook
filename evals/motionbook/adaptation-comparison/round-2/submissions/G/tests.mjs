import assert from 'node:assert/strict';
import {renderFrame,stateAt} from './scene.mjs';
let assertions = 0;
const check = (value,message) => {assert.ok(value,message);assertions++;};
const expect = (t,scenario,mode,created,open) => {
  const s=stateAt(t,scenario);
  assert.equal(s.mode,mode); assert.equal(s.created,created); assert.equal(s.open,open); assertions+=3;
  assert.deepEqual(s.selected,created?['Research','Review']:['Research']);assertions++;
  check(s.labels.includes('Review')===created,`Review persistence at ${scenario} ${t}`);
};
for(const [t,mode,created,open] of [[0,'closed',false,false],[.49999,'closed',false,false],[.5,'list',false,true],[.9,'search',false,true],[1.5,'color',false,true],[2.1,'amber',false,true],[2.59999,'amber',false,true],[2.6,'created',true,true],[3.6,'done',true,false],[6,'done',true,false]])expect(t,'normal',mode,created,open);
for(const [t,mode,created,open] of [[1.5,'color',false,true],[1.7999,'color',false,true],[1.8,'cancelled',false,false],[2.3999,'cancelled',false,false],[2.4,'list',false,true],[2.8,'search',false,true],[3.2,'color',false,true],[3.7,'amber',false,true],[4.1999,'amber',false,true],[4.2,'created',true,true],[5,'done',true,false],[6,'done',true,false]])expect(t,'interrupted',mode,created,open);
check(stateAt(2.4,'interrupted').query===''&&stateAt(2.4,'interrupted').draft==='','Reopening discards cancelled draft and query');
for(const scenario of ['normal','interrupted'])for(const reducedMotion of [false,true])for(let i=0;i<=600;i++){
 const options={width:800,height:600,scenario,reducedMotion};
 const svg=renderFrame(i/100,options);
 check(svg===renderFrame(i/100,options),'Deterministic rendering');
 check(!/NaN|Infinity|undefined|<script|<image|<foreignObject/.test(svg),'Finite, inline-only safe SVG');
 check(svg.includes('viewBox="0 0 800 600"'),'Required viewBox');
 check(svg.includes('data-chip="Research"'),'Original selection always rendered');
}
for(const [scenario,a,b] of [['normal',.5,.8],['normal',.9,1.49],['normal',1.5,2.09],['normal',2.1,2.59],['normal',2.6,3.59],['interrupted',1.8,2.39],['interrupted',2.4,2.79],['interrupted',3.2,3.69],['interrupted',4.2,4.99]]){
 check(renderFrame(a,{scenario,reducedMotion:true})===renderFrame(b,{scenario,reducedMotion:true}),'Reduced motion has no interpolated movement');
}
check(renderFrame().startsWith('<svg'),'Default arguments work');
check(renderFrame(1,{width:400,height:300}).includes('width="400" height="300" viewBox="0 0 800 600"'),'Requested dimensions preserve viewBox');
console.log(JSON.stringify({passed:true,assertions,frame_samples:2404,coverage:['normal event boundaries','interrupted cancellation and retry','selection persistence','determinism','finite inline SVG','reduced motion state snapshots','default arguments','custom dimensions']},null,2));
