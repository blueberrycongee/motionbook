'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const M = require('../src/motion.js');
const advance = (state, seconds, fps = 60) => {
  for (let i = 0; i < Math.ceil(seconds * fps); i++) state = M.tick(state, 1 / fps);
  return state;
};
const near = (a, b) => assert.ok(Math.abs(a - b) < 1e-8, `${a} != ${b}`);
test('open geometry matches source; closed sheet is hidden behind Dock', () => {
  for (let n = 0; n <= 50; n++) {
    const u = n / 50, open = M.row(0, u), dock = M.row(1, u);
    near(open.x, M.WINDOW.x); near(open.w, M.WINDOW.w); near(open.y, M.WINDOW.y + u * M.WINDOW.h);
    assert.ok(dock.y >= M.DOCK_CLIP);
  }
});
test('dense mesh stays finite, positive, ordered, in bounds', () => {
  for (let n = 0; n <= 100; n++) {
    let previous = -Infinity;
    for (const r of M.outline(n / 100, 200)) {
      assert.ok(Number.isFinite(r.x + r.y + r.w));
      assert.ok(r.w > 0 && r.w <= M.WINDOW.w + 1);
      assert.ok(r.x >= 0 && r.x + r.w <= M.W);
      assert.ok(r.y > previous && r.y <= M.DOCK_CLIP + M.WINDOW.h + 2); previous = r.y;
    }
  }
});
test('first phase bends lower rows while top and height remain fixed', () => {
  const top = M.row(.2, 0), bottom = M.row(.2, 1);
  assert.ok(Math.abs(top.x - M.WINDOW.x) < .01); near(top.y, M.WINDOW.y); assert.ok(Math.abs(top.w - M.WINDOW.w) < .01);
  near(bottom.y, M.WINDOW.y + M.WINDOW.h); assert.ok(bottom.w < top.w * .8);
});
test('deformation is continuous across the stage boundaries', () => {
  for (const p of [.20, .40, .94]) for (const v of [0, .25, .5, .75, 1]) {
    const a = M.row(p - 1e-6, v), b = M.row(p + 1e-6, v);
    for (const key of ['x', 'y', 'w']) assert.ok(Math.abs(a[key] - b[key]) < .02);
  }
});
test('minimize and restore settle exactly with no overshoot', () => {
  let s = advance(M.action(M.initial(), { type: 'minimize' }), 2);
  assert.equal(s.progress, 1);
  s = advance(M.action(s, { type: 'restore' }), 2); assert.equal(s.progress, 0);
});
test('rapid reversal preserves the displayed pose, then reverses', () => {
  let s = advance(M.action(M.initial(), { type: 'toggle' }), .3), p = s.progress;
  s = M.action(s, { type: 'toggle' }); assert.equal(s.progress, p); assert.equal(s.target, 0);
  s = M.tick(s, 1 / 60); assert.ok(s.progress < p);
  for (let i = 0; i < 27; i++) s = M.action(s, { type: 'toggle' });
  s = advance(s, 2); assert.equal(s.progress, s.target);
});
test('repeated minimize is idempotent', () => {
  let s = advance(M.action(M.initial(), { type: 'minimize' }), .2);
  const p = s.progress;
  s = M.action(s, { type: 'minimize' }); assert.equal(s.progress, p); assert.equal(s.target, 1);
});
test('speed change keeps pose and slow motion takes longer', () => {
  let s = advance(M.action(M.initial(), { type: 'minimize' }), .1), p = s.progress;
  s = M.action(s, { type: 'speed', slow: true }); assert.equal(s.progress, p);
  assert.ok(advance(s, .5).progress < 1);
  assert.equal(advance(s, 4).progress, 1);
});
test('replay completes once and returns to manual open state', () => {
  const s = advance(M.action(M.initial(), { type: 'replay' }), 8);
  assert.equal(s.progress, 0); assert.equal(s.target, 0); assert.equal(s.mode, 'manual');
});
test('loop continues until an explicit manual action stops it', () => {
  let s = advance(M.action(M.initial(), { type: 'loop', enabled: true }), 40);
  assert.equal(s.mode, 'loop');
  s = M.action(s, { type: 'restore' });
  s = advance(s, 10); assert.equal(s.mode, 'manual'); assert.equal(s.progress, 0);
});
test('reduced motion snaps, cancels loops and prevents replay', () => {
  let s = M.action(M.initial(true), { type: 'toggle' }); assert.equal(s.progress, 1);
  s = M.action(s, { type: 'loop', enabled: true }); assert.equal(s.mode, 'manual');
  s = M.action(s, { type: 'replay' }); assert.equal(s.progress, 0); assert.equal(s.mode, 'manual');
  s = advance(M.action(M.initial(), { type: 'minimize' }), .4);
  s = M.action(s, { type: 'reduced', enabled: true }); assert.equal(s.progress, 1);
  s = M.action(s, { type: 'restore' }); assert.equal(s.progress, 0);
});
test('scrubbing clamps and cancels automatic playback', () => {
  let s = M.action(M.initial(), { type: 'loop', enabled: true });
  s = M.action(s, { type: 'scrub', progress: .527 }); near(s.progress, .527); assert.equal(s.mode, 'manual');
  assert.equal(M.action(s, { type: 'scrub', progress: 9 }).progress, 1);
  assert.equal(M.action(s, { type: 'scrub', progress: -1 }).progress, 0);
});
test('render loop seams match and all poses are valid', () => {
  assert.deepEqual(M.timeline(0), M.timeline(M.LOOP));
  for (let i = 0; i < 1000; i++) { const p = M.timeline(i / 100).progress; assert.ok(p >= 0 && p <= 1); }
});
test('large elapsed times are capped; hidden-tab resume cannot teleport', () => {
  let s = M.action(M.initial(), { type: 'minimize' });
  s = M.tick(s, 1000); assert.ok(s.progress <= .2);
  assert.equal(M.tick(s, -10).progress, s.progress);
});
test('state actions do not mutate the prior state', () => {
  const s = Object.freeze(M.initial()); M.action(s, { type: 'toggle' }); M.tick(s, .1);
  assert.deepEqual(s, M.initial());
});

test('toggle direction after scrubbing matches the visible button label', () => {
  for (const p of [.1, .25, .49, .5, .75, .99]) {
    const s = M.action(M.action(M.initial(), { type: 'scrub', progress: p }), { type: 'toggle' });
    assert.equal(s.target, p >= .5 ? 0 : 1);
  }
});

test('sheet remains full height even after it flows behind Dock', () => {
  for (const p of [.21, .25, .3, .35, .4]) {
    const a = M.row(p, 0), b = M.row(p, 1);
    near(b.y - a.y, M.WINDOW.h);
  }
  const later = M.row(.65, 1); assert.ok(later.y > M.DOCK_CLIP);
  near(later.y - M.row(.65, 0).y, M.WINDOW.h);
});
test('equal time intervals have accelerated then decelerated displacement', () => {
  const ys = [0,.1,.2,.3,.4,.5].map(t => M.row(M.advanceProgress(0, 1, t), 0).y);
  const deltas = ys.slice(1).map((y, i) => y - ys[i]);
  near(deltas[0], 0);
  assert.ok(deltas[2] > deltas[1] * 2);
  assert.ok(deltas[3] > deltas[4] * 2);
});
test('normal preview and runtime use exactly the same motion clock', () => {
  for (const slow of [false, true]) {
    const spec = M.previewSpec(slow);
    let s = M.action(M.initial(), { type: 'minimize' });
    if (slow) s = M.action(s, { type: 'speed', slow: true });
    for (let i = 0; i <= Math.round(spec.duration * 120); i++) {
      near(s.progress, M.timeline(spec.minimizeAt + i / 120, slow).progress);
      s = M.tick(s, 1 / 120);
    }
    s = M.action(s, { type: 'restore' });
    for (let i = 0; i <= Math.round(spec.restoreDuration * 120); i++) {
      near(s.progress, M.timeline(spec.restoreAt + i / 120, slow).progress);
      s = M.tick(s, 1 / 120);
    }
  }
});
test('normal transition is 500ms and slow study is explicitly four times slower', () => {
  assert.equal(M.previewSpec().duration, .5); assert.equal(M.previewSpec(true).duration, 2);
  assert.match(M.timeline(.8).label, /NORMAL SPEED/);
  assert.match(M.timeline(.8,true).label, /0.25× STUDY/);
});

test('restore top arrives early, leaving the final third for lateral release', () => {
  const p = M.advanceProgress(1, 0, M.RESTORE_DURATION * .69);
  assert.ok(Math.abs(M.row(p, 0, M.WINDOW, M.TARGET, {direction:'restore'}).y - M.WINDOW.y) < 1);
  assert.ok(M.row(p, 1, M.WINDOW, M.TARGET, {direction:'restore'}).w < M.WINDOW.w * .8);
  const end = M.advanceProgress(1, 0, M.RESTORE_DURATION);
  near(M.row(end, 1, M.WINDOW, M.TARGET, {direction:'restore'}).w, M.WINDOW.w);
});

test('calibrated samples use actual encoded timestamps, including gaps', () => {
  const d = M.Calibrated.Data.minimize;
  assert.ok(d.samples.some((r,i) => i && r[0]-d.samples[i-1][0] > .045));
  for (const direction of ['minimize','restore']) {
    const data=M.Calibrated.Data[direction];
    for(const r of data.samples){const p=direction==='restore'?1-r[0]/data.duration:r[0]/data.duration;const s=M.Calibrated.sample(p,direction);near(s.top,r[1]);near(s.leftAmplitude,r[2]);near(s.rightAmplitude,r[3]);}
  }
});
test('measured funnel mouth narrows then widens during minimize', () => {
  const d=M.Calibrated.Data.minimize;
  const width=t=>{const s=M.Calibrated.sample(t/d.duration);return d.intercepts[1]+s.rightAmplitude-d.intercepts[0]-s.leftAmplitude;};
  assert.ok(width(.216667)<35);assert.ok(width(.333334)>55);assert.ok(width(.466667)>80);
});
test('interrupting calibrated directions preserves the entire visible pose', () => {
  let s=advance(M.action(M.initial(),{type:'minimize'}),.25);
  const a=M.outline(s.progress,64,s);s=M.action(s,{type:'restore'});const b=M.outline(s.progress,64,s);
  for(let i=0;i<a.length;i++)for(const k of ['x','y','w'])near(a[i][k],b[i][k]);
  s=advance(s,2);assert.equal(s.progress,0);assert.equal(s.bridge,null);
});
test('restore corridor stays finite, positive and ordered through all sampled times', () => {
  for(let j=0;j<=160;j++){
    let last=-Infinity;
    for(let i=0;i<=128;i++){
      const r=M.Calibrated.nativeRow(j/160,i/128,'restore');
      assert.ok(Number.isFinite(r.x+r.y+r.w));assert.ok(r.w>0);assert.ok(r.y>last);last=r.y;
    }
  }
});
