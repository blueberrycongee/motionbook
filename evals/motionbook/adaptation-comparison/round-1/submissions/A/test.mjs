import assert from 'node:assert/strict';
import { renderFrame, stateAt } from './scene.mjs';
const checks=[];
for (const scenario of ['normal','interrupted']) {
  for (const reducedMotion of [false,true]) {
    for (let i=0;i<=120;i++) {
      const t=i/20, opts={scenario,reducedMotion};
      const a=renderFrame(t,opts);
      assert.equal(a,renderFrame(t,opts));
      assert.ok(a.startsWith('<svg'));
      assert.ok(!/NaN|Infinity|<image\b|<script\b|<foreignObject\b|href=/.test(a));
      const s=stateAt(t,opts);
      assert.ok(s.p>=0 && s.p<=1);
      assert.ok(s.x>0 && s.y>0 && s.x+s.w<800 && s.y+s.h<600);
    }
  }
  assert.equal(stateAt(.499,{scenario}).p,0);
  assert.equal(stateAt(6,{scenario}).p,0);
  for (const e of scenario==='normal'?[.5,3.5]:[.5,.85,1.4,3.5]) {
    const a=stateAt(e-1e-7,{scenario}), b=stateAt(e+1e-7,{scenario});
    assert.ok(Math.abs(a.w-b.w)<.001,`width continuous at ${e}`);
    assert.ok(Math.abs(a.h-b.h)<.001,`height continuous at ${e}`);
    assert.ok(Math.abs(a.v-b.v)<.001,`velocity continuous at ${e}`);
  }
  checks.push(`${scenario}: 484 deterministic/finite/vector checks; geometry and velocity continuous at every requested event`);
}
assert.ok(stateAt(.85,{scenario:'interrupted'}).p>0 && stateAt(.85,{scenario:'interrupted'}).p<1);
assert.ok(stateAt(1.15,{scenario:'interrupted'}).p<stateAt(.85,{scenario:'interrupted'}).p);
assert.ok(stateAt(1.8,{scenario:'interrupted'}).p>stateAt(1.4,{scenario:'interrupted'}).p);
for (const [t,p] of [[.49,0],[.5,1],[.85,0],[1.4,1],[3.5,0],[6,0]]) assert.equal(stateAt(t,{scenario:'interrupted',reducedMotion:true}).p,p);
assert.equal(renderFrame(.9,{reducedMotion:true}),renderFrame(3.4,{reducedMotion:true}));
assert.equal(renderFrame(0),renderFrame(6));
checks.push('Reduced-motion event states are immediate and static between events. First and last normal frames match exactly.');
console.log(JSON.stringify({pass:true,checks},null,2));
