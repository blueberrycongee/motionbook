import assert from 'node:assert/strict';
import { test } from 'node:test';
import { renderFrame, stateAt } from './scene.mjs';
const close = (a, b, epsilon = 1e-7) => assert(Math.abs(a - b) < epsilon, `${a} != ${b}`);

test('normal timeline selects requested view exactly at each event', () => {
  for (const [t, selected] of [[0,0],[.499,0],[.5,1],[2.099,1],[2.1,2],[3.799,2],[3.8,0],[6,0]]) {
    assert.equal(stateAt(t).selected, selected);
  }
});
test('interrupted timeline selects exact requested view and duplicate is no new navigation', () => {
  const options = {scenario:'interrupted'};
  for (const [t, selected, count] of [[.5,1,1],[.65,2,2],[.85,0,3],[2.1,2,4],[2.5,2,4],[3.8,0,5],[6,0,5]]) {
    const s=stateAt(t,options); assert.equal(s.selected,selected); assert.equal(s.navigationCount,count);
  }
});
test('all redirect events retain current visible weights, including rapid reversal', () => {
  for (const scenario of ['normal','interrupted']) {
    const events = scenario === 'normal' ? [.5,2.1,3.8] : [.5,.65,.85,2.1,2.5,3.8];
    for (const t of events) {
      const before=stateAt(t-1e-9,{scenario}).weights;
      const at=stateAt(t,{scenario}).weights;
      before.forEach((v,i)=>close(v,at[i]));
    }
  }
  const at=.65, s=stateAt(at,{scenario:'interrupted'}).weights;
  assert(s[0]>0 && s[1]>0 && s[2]===0);
  const r=stateAt(.85,{scenario:'interrupted'}).weights;
  assert(r.every(v=>v>0));
});
test('duplicate Archive continues exact analytical trajectory rather than restarting', () => {
  const a=stateAt(2.49,{scenario:'interrupted'}).weights;
  const b=stateAt(2.51,{scenario:'interrupted'}).weights;
  for(let i=0;i<3;i++) close(b[i],+(i===2)+(a[i]-+(i===2))*Math.exp(-9*.02));
});
test('reduced motion is immediate one-hot and unchanged between navigation events', () => {
  for(const scenario of ['normal','interrupted']) {
    for(const t of [0,.5,.65,.85,2.1,2.5,3.8,6]) {
      const s=stateAt(t,{scenario,reducedMotion:true});
      assert.deepEqual(s.weights,[0,1,2].map(i=>+(i===s.selected)));
    }
    assert.equal(renderFrame(4,{scenario,reducedMotion:true}),renderFrame(6,{scenario,reducedMotion:true}));
  }
});
test('weights remain finite, bounded, sum to one; all labels are always rendered; no forbidden assets', () => {
  for(const scenario of ['normal','interrupted']) for(const reducedMotion of [false,true]) {
    for(let frame=0;frame<=720;frame++) {
      const t=frame/120, options={scenario,reducedMotion};
      const {weights}=stateAt(t,options);
      assert(weights.every(v=>Number.isFinite(v)&&v>=0&&v<=1));
      close(weights.reduce((a,b)=>a+b),1);
      const svg=renderFrame(t,options);
      assert(!/NaN|Infinity|<image\b|<script\b|<foreignObject\b|https?:\/\/(?!www\.w3\.org)/i.test(svg));
      for(const label of ['Overview','Activity','Archive']) assert(svg.includes(`>${label}</text>`));
      assert(svg.includes('viewBox="0 0 800 600"'));
      assert.equal((svg.match(/data-selected="true"/g)||[]).length,1);
    }
  }
});
test('rendering is order-independent, deterministic, defaults work, requested dimensions preserved', () => {
  const baseline=renderFrame(.72,{scenario:'interrupted'});
  renderFrame(5);renderFrame(.1);
  assert.equal(renderFrame(.72,{scenario:'interrupted'}),baseline);
  assert.equal(renderFrame(),renderFrame(0,{}));
  assert.match(renderFrame(0,{width:400,height:300}),/width="400" height="300" viewBox="0 0 800 600"/);
  assert.equal(stateAt(-1).selected,0);
  assert.equal(stateAt(7).selected,0);
});
