'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const M = require('../src/motion.js');

// These are engineering tests of the supplemental interaction model. They do
// not establish that Apple's unrecorded interruption/gesture branches match it.
const near = (actual, expected, tolerance = 1e-9) =>
  assert.ok(Math.abs(actual - expected) <= tolerance,
    `Expected ${actual} to be within ${tolerance} of ${expected}`);
function valid(state) {
  assert.ok(Number.isFinite(state.progress), 'finite progress');
  assert.ok(Number.isFinite(state.velocity), 'finite velocity');
  assert.ok(state.progress >= 0 && state.progress <= 1, 'renderable progress');
  assert.ok(['idle', 'settling', 'dragging'].includes(state.mode));
  assert.ok(state.target === 0 || state.target === 1);
  return state;
}
function endpoint(c, target, time = 10) {
  const state = valid(c.tick(time));
  near(state.progress, target);
  near(state.velocity, 0);
  assert.equal(state.target, target);
  assert.equal(state.mode, 'idle');
}

test('controller starts at a finite, exact, idle endpoint', () => {
  for (const progress of [0, 1]) {
    const c = new M.Controller({ progress, time: 0 });
    const state = valid(c.state());
    near(state.progress, progress);
    near(state.velocity, 0);
    assert.equal(state.mode, 'idle');
    assert.equal(state.target, progress);
  }
});

test('open and close both settle to exact endpoints without residual motion', () => {
  const c = new M.Controller();
  c.settle(1, 0);
  endpoint(c, 1, 4);
  c.settle(0, 4);
  endpoint(c, 0, 8);
  assert.deepEqual(c.tick(20), c.state());
});

test('time is in seconds: one 60 Hz sample advances but does not finish the transition', () => {
  const c = new M.Controller();
  c.settle(1, 0);
  const state = valid(c.tick(1 / 60));
  assert.ok(state.progress > 0 && state.progress < 1);
  assert.equal(state.mode, 'settling');
  endpoint(c, 1, 4);
});

test('retarget samples the current time and preserves position and spring velocity', () => {
  const expected = new M.Controller();
  const actual = new M.Controller();
  expected.settle(1, 0);
  actual.settle(1, 0);
  const before = expected.tick(.13);
  assert.ok(before.progress > 0 && before.progress < 1);
  actual.settle(0, .13);
  const after = valid(actual.state());
  near(after.progress, before.progress);
  near(after.velocity, before.velocity);
  assert.equal(after.target, 0);
  endpoint(actual, 0, 4);
});

test('close-to-open reversal preserves position and velocity too', () => {
  const expected = new M.Controller({ progress: 1 });
  const actual = new M.Controller({ progress: 1 });
  expected.settle(0, 0);
  actual.settle(0, 0);
  const before = expected.tick(.12);
  actual.settle(1, .12);
  near(actual.state().progress, before.progress);
  near(actual.state().velocity, before.velocity);
  endpoint(actual, 1, 4);
});

test('repeating the same target does not restart or duplicate a transition', () => {
  const repeated = new M.Controller();
  const plain = new M.Controller();
  plain.settle(1, 0);
  repeated.settle(1, 0);
  for (const t of [.03, .08, .13, .2]) repeated.settle(1, t);
  const expected = plain.tick(.32);
  const actual = repeated.tick(.32);
  near(actual.progress, expected.progress, 1e-7);
  near(actual.velocity, expected.velocity, 1e-7);
  endpoint(repeated, 1, 4);
  repeated.settle(1, 4);
  endpoint(repeated, 1, 4);
});

test('zero elapsed time is stable, and sampling cadence does not change the spring path', () => {
  const single = new M.Controller();
  const frequent = new M.Controller();
  single.settle(1, 0);
  frequent.settle(1, 0);
  const initial = frequent.state();
  assert.deepEqual(frequent.tick(0), initial);
  for (let n = 1; n <= 30; n++) valid(frequent.tick(n / 100));
  const actual = frequent.tick(.31);
  const expected = single.tick(.31);
  near(actual.progress, expected.progress, 1e-7);
  near(actual.velocity, expected.velocity, 1e-7);
});

test('drag takeover samples the in-flight pose without a position discontinuity', () => {
  const control = new M.Controller();
  const c = new M.Controller();
  control.settle(1, 0);
  c.settle(1, 0);
  const expected = control.tick(.14);
  c.dragStart(500, .14);
  near(c.state().progress, expected.progress);
  assert.equal(c.state().mode, 'dragging');
  c.dragMove(500, .15);
  near(c.state().progress, expected.progress);
});

test('drag displacement follows source-pixel direction and remains bounded', () => {
  const c = new M.Controller({ progress: 1 });
  c.dragStart(100, 0);
  c.dragMove(300, .3);
  const partial = valid(c.state());
  assert.ok(partial.progress > 0 && partial.progress < 1);
  assert.ok(partial.velocity < 0);
  c.dragMove(-10000, .6);
  near(valid(c.state()).progress, 1);
  c.dragMove(10000, .9);
  near(valid(c.state()).progress, 0);
});

test('animation sampling between pointer moves does not change input velocity or release target', () => {
  const plain = new M.Controller({ progress: 1 });
  const sampled = new M.Controller({ progress: 1 });
  plain.dragStart(0, 0); sampled.dragStart(0, 0);
  for (const t of [.1, .2, .29]) sampled.tick(t);
  plain.dragMove(100, .3); sampled.dragMove(100, .3);
  near(sampled.state().progress, plain.state().progress);
  near(sampled.state().velocity, plain.state().velocity);
  plain.dragEnd(.3); sampled.dragEnd(.3);
  assert.equal(sampled.state().target, plain.state().target);
  assert.equal(sampled.state().target, 1, 'a slow short downward drag returns to open');
});

test('gesture reversal updates velocity without a jump on release', () => {
  const c = new M.Controller({ progress: 1 });
  c.dragStart(100, 0);
  c.dragMove(450, .35);
  c.dragMove(300, .5);
  const before = valid(c.state());
  assert.ok(before.velocity > 0);
  c.dragEnd(.5);
  const released = valid(c.state());
  near(released.progress, before.progress);
  near(released.velocity, before.velocity);
  endpoint(c, released.target, 4);
});

test('canceling a drag returns to the pre-drag target regardless of displacement', () => {
  for (const progress of [0, 1]) {
    const c = new M.Controller({ progress });
    c.dragStart(400, 0);
    c.dragMove(progress ? 950 : -150, .8);
    const before = c.state();
    c.cancelDrag(.8);
    near(c.state().progress, before.progress);
    assert.equal(c.state().target, progress);
    endpoint(c, progress, 4);
  }
});

test('dragEnd cancel option and explicit cancelDrag have equivalent results', () => {
  const a = new M.Controller({ progress: 1 });
  const b = new M.Controller({ progress: 1 });
  for (const c of [a, b]) {
    c.dragStart(0, 0);
    c.dragMove(350, .4);
  }
  a.dragEnd(.4, { cancel: true });
  b.cancelDrag(.4);
  assert.deepEqual(a.state(), b.state());
  assert.deepEqual(a.tick(.7), b.tick(.7));
});

test('canceling a drag that interrupted opening restores the prior target', () => {
  const c = new M.Controller();
  c.settle(1, 0);
  c.dragStart(0, .12);
  c.dragMove(600, .8);
  c.cancelDrag(.8);
  assert.equal(c.state().target, 1);
  endpoint(c, 1, 4);
});

test('quarter, half, and three-quarter drag cancellation returns each original endpoint', () => {
  for (const start of [0, 1]) for (const fraction of [.25, .5, .75]) {
    const c = new M.Controller({ progress: start });
    c.dragStart(400, 0);
    c.dragMove(400 + (start - fraction) * M.TRAVEL, .7);
    near(c.state().progress, fraction);
    c.cancelDrag(.7);
    near(c.state().progress, fraction);
    endpoint(c, start, 4);
  }
});

test('fast gestures can complete the requested direction before crossing the midpoint', () => {
  const opening = new M.Controller();
  opening.dragStart(400, 0);
  opening.dragMove(400 - .2 * M.TRAVEL, .02);
  opening.dragEnd(.02);
  assert.equal(opening.state().target, 1);
  endpoint(opening, 1, 4);
  const closing = new M.Controller({ progress: 1 });
  closing.dragStart(400, 0);
  closing.dragMove(400 + .2 * M.TRAVEL, .02);
  closing.dragEnd(.02);
  assert.equal(closing.state().target, 0);
  endpoint(closing, 0, 4);
});

test('duplicate releases and cancellations do not change a finished gesture', () => {
  const c = new M.Controller({ progress: 1 });
  c.dragStart(0, 0);
  c.dragMove(150, .5);
  c.dragEnd(.5);
  const released = c.state();
  c.dragEnd(.5);
  c.cancelDrag(.5);
  assert.deepEqual(c.state(), released);
});

test('reduced motion snaps requested endpoints and leaves no settling state', () => {
  const c = new M.Controller({ reducedMotion: true });
  c.settle(1, 0);
  endpoint(c, 1, 0);
  c.settle(0, .1);
  endpoint(c, 0, .1);
  c.settle(1, .2);
  endpoint(c, 1, .2);
});

test('reduced-motion drag cancellation and release leave exact endpoints', () => {
  const c = new M.Controller({ reducedMotion: true, progress: 1 });
  c.dragStart(0, 0);
  c.dragMove(400, .4);
  c.cancelDrag(.4);
  endpoint(c, 1, .4);
  c.dragStart(0, .5);
  c.dragMove(750, 1.5);
  c.dragEnd(1.5);
  endpoint(c, c.state().target, 1.5);
});

test('long alternating input sequence does not create NaN or stranded motion', () => {
  const c = new M.Controller();
  let t = 0;
  for (let n = 0; n < 100; n++) {
    t += .037;
    c.settle(n % 2, t);
    valid(c.state());
    if (n % 7 === 0) {
      c.dragStart(300, t);
      c.dragMove(300 + (n % 3 - 1) * 140, t += .027);
      valid(c.state());
      c.dragEnd(t, { cancel: n % 14 === 0 });
    }
    valid(c.tick(t += .011));
  }
  endpoint(c, c.state().target, t + 4);
});

test('stale, invalid, and repeated tick timestamps do not run the spring backward', () => {
  const c = new M.Controller();
  c.settle(1, 0);
  const before = c.tick(.2);
  for (const t of [.1, .2, NaN, Infinity]) assert.deepEqual(c.tick(t), before);
  endpoint(c, 1, 4);
});

test('pausing before release discards old fling velocity', () => {
  const c = new M.Controller({ progress: 1 });
  c.dragStart(0, 0);
  c.dragMove(250, .05);
  assert.ok(c.state().progress > .5);
  assert.ok(c.state().velocity < 0);
  c.dragEnd(.3);
  assert.equal(c.state().target, 1);
  near(c.state().velocity, 0);
  endpoint(c, 1, 4);
});

test('live reduced motion finishes the current target and can subsequently be disabled', () => {
  const c = new M.Controller();
  c.settle(1, 0);
  c.tick(.1);
  c.setReducedMotion(true, .1);
  endpoint(c, 1, .1);
  c.setReducedMotion(false, .2);
  c.settle(0, .2);
  const state = c.tick(.22);
  assert.ok(state.progress > 0 && state.progress < 1);
  endpoint(c, 0, 4);
});

test('measured replay has source-second bounds and the actual video sample cadence', () => {
  assert.ok(M.referenceSpec.start > 500, 'absolute source seconds, not normalized progress');
  assert.ok(M.referenceSpec.end > M.referenceSpec.start);
  near(M.referenceSpec.fps, 30000 / 1001);
  assert.ok(M.data.samples.length >= 2);
  for (let n = 1; n < M.data.samples.length; n++) {
    assert.ok(M.data.samples[n].t > M.data.samples[n - 1].t, 'strictly increasing observations');
  }
});

test('reference replay is deterministic, returns fresh state, and does not mutate observations', () => {
  const original = JSON.stringify(M.data);
  const t = (M.referenceSpec.start + M.referenceSpec.end) / 2;
  const expected = M.referenceAt(t);
  const changed = M.referenceAt(t);
  changed.cover.x = -999;
  changed.card.y = -999;
  assert.deepEqual(M.referenceAt(t), expected);
  assert.equal(JSON.stringify(M.data), original);
});

test('reference replay exactly interpolates each supplied geometry observation', () => {
  for (const sample of M.data.samples) {
    const state = M.referenceAt(sample.t);
    for (const [key, actual] of [
      ['cardY', state.card.y], ['cardX', state.card.x], ['cardW', state.card.w],
      ['cardR', state.card.r], ['cardH', state.card.h], ['coverX', state.cover.x], ['coverY', state.cover.y],
      ['coverSize', state.cover.size], ['coverR', state.cover.r],
      ['backgroundScale', state.background.scale], ['backgroundX', state.background.tx],
      ['backgroundY', state.background.ty], ['backgroundDim', state.background.dim],
      ['expandedOpacity', state.expandedOpacity], ['miniOpacity', state.miniOpacity],
      ['barOpacity', state.barOpacity], ['handleOpacity', state.handleOpacity],
      ['statusOpacity', state.statusOpacity], ['controlsY', state.controlsY],
      ['titleY', state.titleY], ['backgroundOpacity', state.backgroundOpacity],
    ]) if (Number.isFinite(sample[key])) near(actual, sample[key], 1e-7);
  }
});

test('geometry channels retain their own samples rather than deriving all layers from card progress', () => {
  const c = M.fromChannels({
    t: 1, cardY: 300, cardX: 7, cardW: 410, cardR: 16,
    coverX: 80, coverY: 260, coverSize: 137, coverR: 6,
    backgroundScale: .97, backgroundX: 4, backgroundY: 12, backgroundDim: .11,
    expandedOpacity: .24, miniOpacity: .41, barOpacity: .77,
    controlsY: 29, titleY: 75,
  });
  assert.deepEqual(c.cover, { x: 80, y: 260, size: 137, r: 6 });
  assert.equal(c.card.x, 7);
  assert.equal(c.card.w, 410);
  assert.equal(c.card.r, 16);
  assert.deepEqual(c.background, { scale: .97, tx: 4, ty: 12, dim: .11 });
  assert.equal(c.expandedOpacity, .24);
  assert.equal(c.miniOpacity, .41);
  assert.equal(c.barOpacity, .77);
  assert.equal(c.controlsY, 29);
  assert.equal(c.titleY, 75);
});

test('interactive compact endpoint preserves the calibrated mini-player and visible tab-bar geometry', () => {
  const reference = M.referenceAt(M.referenceSpec.start);
  const interactive = M.stateForProgress(0);
  assert.equal(reference.progress, 0);
  for (const key of ['x', 'y', 'w', 'h', 'r']) near(interactive.card[key], reference.card[key]);
  for (const key of ['x', 'y', 'size', 'r']) near(interactive.cover[key], reference.cover[key]);
  assert.ok(interactive.card.y + interactive.card.h <= 843, 'compact card does not cover the tab bar');
});

test('supplemental handoff preserves each numeric layer immediately without mutating either pose', () => {
  for (const row of M.data.samples.filter(s => s.t >= M.referenceSpec.start && s.t <= M.referenceSpec.end)) {
    const source = M.referenceAt(row.t), base = M.stateForProgress(source.progress);
    const before = JSON.stringify({ source, base });
    const handoff = M.createPoseHandoff(source, 10);
    const actual = M.applyPoseHandoff(base, handoff, 10);
    for (const [key, value] of Object.entries(source)) {
      if (key === 'time') continue;
      if (typeof value === 'object') {
        for (const [subkey, subvalue] of Object.entries(value)) near(actual[key][subkey], subvalue, 1e-7);
      } else if (Number.isFinite(value)) near(actual[key], value, 1e-7);
    }
    assert.equal(JSON.stringify({ source, base }), before);
    assert.deepEqual(M.applyPoseHandoff(base, handoff, 12), base);
  }
});

test('supplemental handoff correction decays monotonically to zero in seconds', () => {
  const handoff = M.createPoseHandoff(M.referenceAt(M.referenceSpec.start), 7);
  assert.equal(M.handoffWeight(handoff, 7), 1);
  let previous = 1;
  for (let step = 1; step <= 120; step++) {
    const weight = M.handoffWeight(handoff, 7 + step / 60);
    assert.ok(weight >= 0 && weight <= previous);
    previous = weight;
  }
  assert.equal(previous, 0);
  assert.equal(M.handoffWeight(null, 10), 0);
});

test('independently sampled close path is preserved and not replaced by reversed opening', () => {
  const observations = [
    { t: 0, y: 1 }, { t: 1, y: .4 }, { t: 2, y: 0 },
    { t: 3, y: 0 }, { t: 4, y: .1 }, { t: 5, y: 1 },
  ];
  near(M.channel(observations, 'y', 1), .4);
  near(M.channel(observations, 'y', 4), .1);
  assert.notEqual(M.channel(observations, 'y', 1), M.channel(observations, 'y', 4));
});

test('shape-preserving interpolation remains within each neighboring observation pair', () => {
  const values = [
    { t: 0, x: 0 }, { t: .1, x: 20 }, { t: .9, x: 21 },
    { t: 1.0, x: 21 }, { t: 1.1, x: 5 }, { t: 2.7, x: 0 },
  ];
  for (let n = 0; n < values.length - 1; n++) {
    const a = values[n], b = values[n + 1];
    for (let f = 0; f <= 100; f++) {
      const actual = M.channel(values, 'x', a.t + (b.t - a.t) * f / 100);
      assert.ok(actual >= Math.min(a.x, b.x) - 1e-9 && actual <= Math.max(a.x, b.x) + 1e-9);
    }
  }
  assert.equal(M.channel(values, 'x', -10), 0);
  assert.equal(M.channel(values, 'x', 10), 0);
});
