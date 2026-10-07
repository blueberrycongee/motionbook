import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {renderFrame, sampleState} from './scene.mjs';

const epsilon = 1e-7;
const expectedNormal = [[0,0],[.4999,0],[.5,1],[2.0999,1],[2.1,2],[3.7999,2],[3.8,0],[6,0]];
const expectedInterrupted = [[0,0],[.5,1],[.65,2],[.85,0],[2.1,2],[2.5,2],[3.8,0],[6,0]];

test('selection follows every exact normal and interrupted event', () => {
  for (const [scenario, cases] of [['normal',expectedNormal],['interrupted',expectedInterrupted]]) {
    for (const [t, selected] of cases) assert.equal(sampleState(t,scenario).selected,selected,`${scenario}, ${t}`);
  }
});
test('redirection preserves the current visual state at every boundary', () => {
  for (const t of [.5,.65,.85,2.1,2.5,3.8]) {
    const before=sampleState(t-epsilon,'interrupted').weights;
    const exact=sampleState(t,'interrupted').weights;
    const after=sampleState(t+epsilon,'interrupted').weights;
    before.forEach((v,i)=>assert.ok(Math.abs(v-exact[i])<2e-6));
    after.forEach((v,i)=>assert.ok(Math.abs(v-exact[i])<2e-6));
  }
  const redirected=sampleState(.65,'interrupted');
  assert.ok(redirected.weights[0]>.2 && redirected.weights[1]>.7 && redirected.weights[2]===0);
});
test('repeated selection is a no-op, including the existing decay', () => {
  const prior=sampleState(2.49,'interrupted');
  const at=sampleState(2.5,'interrupted');
  const later=sampleState(2.6,'interrupted');
  assert.equal(prior.navigationCount,4);
  assert.equal(at.navigationCount,4);
  assert.equal(later.navigationCount,4);
  prior.weights.forEach((v,i)=> {
    const goal=Number(i===2);
    assert.ok(Math.abs(later.weights[i]-(goal+(v-goal)*Math.exp(-10*.11)))<1e-12);
  });
});
test('weights are finite, bounded, normalized, and target state settles', () => {
  for (const scenario of ['normal','interrupted']) {
    for (let j=0;j<=6000;j++) {
      const {weights}=sampleState(j/1000,scenario);
      assert.ok(weights.every(w=>Number.isFinite(w) && w>=0 && w<=1));
      assert.ok(Math.abs(weights.reduce((a,b)=>a+b,0)-1)<1e-12);
    }
    assert.ok(sampleState(6,scenario).weights[0]>.99999999);
  }
});
test('reduced motion is exact target state and has no decorative time dependence', () => {
  for (const [scenario,cases] of [['normal',expectedNormal],['interrupted',expectedInterrupted]]) {
    for (const [t,selected] of cases) {
      assert.deepEqual(sampleState(t,scenario,true).weights,[0,1,2].map(i=>Number(i===selected)));
    }
  }
  assert.equal(renderFrame(2.49,{scenario:'interrupted',reducedMotion:true}),renderFrame(2.6,{scenario:'interrupted',reducedMotion:true}));
  assert.equal(renderFrame(4,{reducedMotion:true}),renderFrame(6,{reducedMotion:true}));
});
test('all labels remain present; one target selected; pure deterministic SVG at 6001 timestamps', () => {
  for (let j=0;j<=6000;j++) {
    const t=j/1000, options={scenario:j%2?'normal':'interrupted'};
    const svg=renderFrame(t,options);
    assert.equal((svg.match(/aria-selected="true"/g)||[]).length,1);
    for (const label of ['Overview','Activity','Archive']) assert.ok(svg.includes(`>${label}</text>`));
    assert.ok(!/NaN|Infinity|undefined/.test(svg));
    assert.ok(!/<(?:image|script|foreignObject)\b/i.test(svg));
    assert.ok(!/(?:href|xlink:href)=/.test(svg));
    if(j%500===0) assert.equal(svg,renderFrame(t,options));
  }
  assert.ok(renderFrame().includes('viewBox="0 0 800 600"'));
  assert.ok(renderFrame(1,{width:400,height:300}).includes('width="400" height="300"'));
  assert.equal(renderFrame(-10),renderFrame(0));
  assert.equal(renderFrame(99),renderFrame(6));
});
test('source contains no environmental reads, assets, or animation runtime', () => {
  const source=fs.readFileSync(new URL('./scene.mjs',import.meta.url),'utf8');
  assert.ok(!/\b(?:Date|performance|document|window|fetch|requestAnimationFrame|setTimeout)\b/.test(source));
  assert.ok(!/Math\.random|\bimport\s|https?:/.test(source.replace('http://www.w3.org/2000/svg','')));
});
