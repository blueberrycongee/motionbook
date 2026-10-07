import assert from 'node:assert/strict';
import { renderFrame, stateAt } from './scene.mjs';
const states = [
 ['normal', 0, 'idle'], ['normal', .499999, 'idle'], ['normal', .5, 'saving'],
 ['normal', 2.999999, 'saving'], ['normal', 3, 'saved'], ['normal', 6, 'saved'],
 ['interrupted', .5, 'saving'], ['interrupted', 1.399999, 'saving'],
 ['interrupted', 1.4, 'cancelled'], ['interrupted', 2.099999, 'cancelled'],
 ['interrupted', 2.1, 'saving'], ['interrupted', 3.799999, 'saving'],
 ['interrupted', 3.8, 'saved'], ['interrupted', 6, 'saved']
];
for (const [scenario, t, expected] of states) {
 for (const reducedMotion of [false, true]) {
  assert.equal(stateAt(t, scenario, reducedMotion).state, expected);
  const svg = renderFrame(t, {scenario, reducedMotion});
  assert(svg.includes(`data-state="${expected}"`));
  assert(svg.includes('viewBox="0 0 800 600"'));
  assert(!/NaN|Infinity|<script|<image|foreignObject|https?:\/\/(?!www.w3.org\/2000\/svg)/.test(svg));
  assert.equal(svg, renderFrame(t, {scenario, reducedMotion}));
 }
}
for (const scenario of ['normal', 'interrupted']) {
 for (let i=0; i<=600; i++) {
  const s=stateAt(i/100,scenario);
  assert(s.extension>=-.055 && s.extension<=1.075);
  assert(s.progress>=0 && s.progress<=1);
  const svg=renderFrame(i/100,{scenario});
  assert(!/NaN|Infinity|undefined/.test(svg));
 }
}
// Reduced-motion frames stay identical throughout each semantic state.
for (const [scenario, times] of [
 ['normal', [0,.49]], ['normal', [.5, 1, 2.99]], ['normal',[3,4,6]],
 ['interrupted',[1.4,1.8,2.099]], ['interrupted',[2.1,2.7,3.79]], ['interrupted',[3.8,4,6]]
]) {
 const reference=renderFrame(times[0],{scenario,reducedMotion:true});
 for(const t of times) assert.equal(renderFrame(t,{scenario,reducedMotion:true}),reference);
}
for (const scenario of ['normal','interrupted']) {
 const events=scenario==='normal'?[.5,3]:[.5,1.4,2.1,3.8];
 for(const t of events) assert(Math.abs(stateAt(t-1e-6,scenario).extension-stateAt(t+1e-6,scenario).extension)<.001);
}
assert.equal(stateAt(2.1,'interrupted').progress,0);
assert(renderFrame(1.4,{scenario:'interrupted'}).includes('Retry save'));
assert(renderFrame(3,{scenario:'normal'}).includes('All changes are up to date.'));
assert(renderFrame().includes('width="800" height="600"'));
assert(renderFrame(0,{width:1600,height:1200}).includes('width="1600" height="1200"'));
console.log('PASS: 28 event-boundary checks; 1,202 sampled states; determinism; self-contained SVG; continuity; retry reset; reduced-motion invariance; dimensions.');
