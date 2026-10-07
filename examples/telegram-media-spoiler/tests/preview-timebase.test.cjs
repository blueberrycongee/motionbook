const {test} = require('node:test');
const assert = require('node:assert/strict');
const T = require('../tools/preview-timeline.cjs');
const M = require('../src/motion.js');
test('preview clock remains one-times speed with 3.6 seconds total', () => {
  assert.equal(T.frameCount / T.fps, 3.6);
  assert.equal(T.frameTimeMs(50), 1000);
});
test('GIF cadence has uniform representable 20 millisecond delays', () => {
  assert.equal(1000 / T.fps, 20);
  for (let i=1;i<T.frameCount;i++) assert.equal(T.frameTimeMs(i)-T.frameTimeMs(i-1),20);
});
test('re-export preserves the original 180 millisecond interaction envelope', () => {
  assert.equal(M.REVEAL_MS,180);
  const m=M.createModel();m.reveal(T.revealAtMs,T.click);
  assert.equal(m.sample(T.revealAtMs+179).phase,'revealing');
  assert.equal(m.sample(T.revealAtMs+180).phase,'revealed');
});
test('first visible export frame includes the weak center-opacity ramp', () => {
  const m=M.createModel();m.reveal(T.revealAtMs,T.click);
  const first=Math.ceil(T.revealAtMs*T.fps/1000);
  const sample=m.sample(T.frameTimeMs(first));
  const opacity=M.diskAlpha(0,sample.radius,42);
  assert.ok(opacity>.05 && opacity<.25,`first center alpha ${opacity}`);
  assert.ok(Math.abs(T.frameTimeMs(first)-T.revealAtMs-1000/120)<1e-8);
});
test('three sampled center stages progress from faint to clear', () => {
  const m=M.createModel();m.reveal(T.revealAtMs,T.click);
  const first=Math.ceil(T.revealAtMs*T.fps/1000);
  const a=[0,1,2].map(i=>M.diskAlpha(0,m.sample(T.frameTimeMs(first+i)).radius,42));
  assert.ok(a[0]<.25 && a[1]>.5 && a[1]<.9 && a[2]>.97,JSON.stringify(a));
});
test('reset stays a separately labeled instant preview loop action', () => {
  assert.equal(T.resetAtMs,3050);
  assert.ok(T.resetAtMs>T.revealAtMs+M.REVEAL_MS);
});
