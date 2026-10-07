import assert from 'node:assert/strict';
import {renderFrame, stateAt} from './scene.mjs';
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-7, `${a} != ${b}`);
for(const scenario of ['normal','interrupted']) {
  for(let i=0;i<=600;i++) {
    const t=i/100, s=stateAt(t,scenario);
    assert.ok(s.value>=0&&s.value<=100);
    for(const reducedMotion of [false,true]) {
      const svg=renderFrame(t,{scenario,reducedMotion});
      assert.equal(svg,renderFrame(t,{scenario,reducedMotion}));
      assert.match(svg,/viewBox="0 0 800 600"/);
      assert.match(svg,/Sound check/); assert.match(svg,/Tune the room to your mood\./);
      assert.match(svg,new RegExp(`data-value="${Number(s.value.toFixed(4))}"`));
      assert.ok(!/(NaN|Infinity|<script|<image|foreignObject|https?:\/\/(?!www.w3.org))/.test(svg));
      if(reducedMotion) assert.ok(!svg.includes('data-decoration='));
    }
  }
}
for(const [t,v] of [[0,40],[.5,40],[1.1,51.25],[2.1,70],[3.4,70],[4.5,25],[6,25]]) near(stateAt(t).value,v);
for(const [t,v] of [[0,40],[.5,40],[1.1,51.25],[1.45,40.625],[1.8,40],[2.6,40],[4,55],[6,55]]) near(stateAt(t,'interrupted').value,v);
assert.ok(stateAt(1.799999,'interrupted').value<30.001);
for(const [scenario,start,end,direction] of [['normal',.5,2.1,1],['normal',3.4,4.5,-1],['interrupted',.5,1.1,1],['interrupted',1.1,1.799,-1],['interrupted',2.6,4,1]]) {
  let prev=stateAt(start,scenario).value;
  for(let i=1;i<=100;i++){const v=stateAt(start+(end-start)*i/100,scenario).value;assert.ok((v-prev)*direction>=-1e-8);prev=v;}
}
assert.equal(stateAt(1.8,'interrupted').down,false);
assert.equal(stateAt(1.8,'interrupted').cancel,true);
assert.equal(renderFrame(),renderFrame(0,{}));
assert.match(renderFrame(0,{width:400,height:300}),/width="400" height="300"/);
assert.equal(renderFrame(2.5),renderFrame(3.1));
assert.equal(renderFrame(5),renderFrame(6));
assert.equal(renderFrame(4.4,{scenario:'interrupted'}),renderFrame(6,{scenario:'interrupted'}));
console.log('PASS: 2,404 deterministic frame checks; timeline endpoints, cancellation, reversal, monotonicity, held states, dimensions, reduced-motion, and SVG contract.');
