import assert from 'node:assert/strict';
import { renderFrame, sampleState } from './scene.mjs';
const scenarios=['normal','interrupted'];
let frames=0;
for (const scenario of scenarios) for (const reducedMotion of [false,true]) {
  for(let i=0;i<=600;i++) {
    const t=i/100, opts={scenario,reducedMotion};
    const svg=renderFrame(t,opts); frames++;
    assert.equal(svg,renderFrame(t,opts),'deterministic');
    assert.ok(svg.startsWith('<svg'));
    assert.match(svg,/viewBox="0 0 800 600"/);
    assert.doesNotMatch(svg,/<(?:image|script|foreignObject)\b|(?:NaN|Infinity)|(?:href|src)=/);
    assert.match(svg,/P-204/);
    const s=sampleState(t,opts);
    assert.ok(s.p>=-1e-9&&s.p<=1.00001);
  }
}
for(const scenario of scenarios) {
  for(const t of [0,.1,.49])assert.equal(sampleState(t,{scenario}).p,0);
  for(const at of scenario==='interrupted'?[.5,.85,1.4,3.5]:[.5,3.5]){
    const a=sampleState(at-1e-7,{scenario}), b=sampleState(at+1e-7,{scenario});
    assert.ok(Math.abs(a.p-b.p)<1e-5,'position continuous at event');
    assert.ok(Math.abs(a.v-b.v)<1e-4,'velocity continuous at event');
  }
  assert.ok(sampleState(6,{scenario}).p<1e-12,'settled compact');
  assert.equal(sampleState(.5,{scenario,reducedMotion:true}).p,1);
  assert.equal(sampleState(3.5,{scenario,reducedMotion:true}).p,0);
  assert.equal(renderFrame(4,{scenario,reducedMotion:true}),renderFrame(5,{scenario,reducedMotion:true}));
}
assert.equal(sampleState(.85,{scenario:'interrupted',reducedMotion:true}).p,0);
assert.equal(sampleState(1.4,{scenario:'interrupted',reducedMotion:true}).p,1);
assert.ok(sampleState(.86,{scenario:'interrupted'}).p>0.7,'interrupted surface does not teleport closed');
assert.ok(sampleState(1.39,{scenario:'interrupted'}).p<.01,'interrupted close responds');
assert.ok(sampleState(2.4,{scenario:'interrupted'}).p>.99,'interrupted reopen settles');
assert.match(renderFrame(),/width="800" height="600"/);
assert.match(renderFrame(1,{width:400,height:300}),/width="400" height="300" viewBox="0 0 800 600"/);
console.log(`PASS: ${frames} frames; deterministic SVG contract, default/custom dimensions, event timing, position and velocity continuity, interruption recovery, reduced-motion state changes.`);
