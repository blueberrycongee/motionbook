'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const M = require('../src/motion.js');
const D = require('../src/calibration-data.js');
const { start, end } = M.referenceSpec;
const span = end - start;
const mid = start + span * .5;
const near = (a, b, message = '', eps = 1e-8) => assert.ok(Math.abs(a - b) <= eps, `${message}: ${a} ≉ ${b}`);
const fields = ['x', 'y', 'w', 'h', 'opacity', 'litOpacity', 'blur', 'scale', 'highlight'];
function pose(state) { return state.lines.map(line => Object.fromEntries(['id', ...fields].map(key => [key, line[key]]))); }
function nearPose(actual, expected) {
  assert.equal(actual.lines.length, expected.lines.length);
  for (let n = 0; n < actual.lines.length; n++) {
    assert.equal(actual.lines[n].id, expected.lines[n].id);
    for (const key of fields) near(actual.lines[n][key], expected.lines[n][key], `line ${n} ${key}`);
  }
}
function valid(state) {
  assert.ok(Number.isFinite(state.time));
  assert.ok(state.time >= start && state.time <= end);
  const ids = new Set();
  for (const line of state.lines) {
    assert.ok(!ids.has(line.id)); ids.add(line.id);
    for (const key of fields) assert.ok(Number.isFinite(line[key]), `${line.id}.${key} = ${line[key]}`);
    assert.ok(line.opacity >= 0 && line.opacity <= 1, 'bounded opacity');
    assert.ok(line.litOpacity >= 0 && line.litOpacity <= 1, 'bounded highlight-layer opacity');
    assert.ok(line.highlight >= 0 && line.highlight <= 1, 'bounded highlight');
    assert.ok(line.blur >= 0 && line.scale > 0 && line.w >= 0 && line.h >= 0);
  }
  return state;
}

test('line activation uses exact half-open boundaries, gaps, and final termination', () => {
  const items = [{ begin: 3, end: 5 }, { begin: 5, end: 8 }, { begin: 9, end: 10 }];
  for (const [t, index] of [[2.999999, -1], [3, 0], [4.999999, 0], [5, 1], [5.000001, 1],
    [7.999999, 1], [8, -1], [8.000001, -1], [9, 2], [9.999999, 2], [10, -1]])
    assert.equal(M.activeAt(items, t), index, `time ${t}`);
  assert.equal(M.activeAt([], 0), -1);
});

test('timed span progress clamps at exact boundaries and does not leak into adjacent spans', () => {
  const one = { begin: 2, end: 4 }, two = { begin: 4, end: 6 };
  for (const [t, p] of [[1, 0], [2, 0], [2.000001, .0000005], [3, .5], [4, 1], [5, 1]])
    near(M.spanProgress(one, t), p, `time ${t}`);
  assert.equal(M.spanProgress(two, 4), 0);
  assert.equal(M.spanProgress({ begin: 4, end: 4 }, 3.9), 0);
  assert.equal(M.spanProgress({ begin: 4, end: 4 }, 4), 1);
  for (const bad of [NaN, Infinity, -Infinity]) {
    assert.throws(() => M.activeAt([one], bad), /finite/);
    assert.throws(() => M.spanProgress(one, bad), /finite/);
  }
});

test('piecewise sampling retains every native-time knot and independent channels', () => {
  const samples = [{ t: 1, y: 300, scale: .8 }, { t: 1.08, y: 180, scale: .99 },
    { t: 1.43, y: 185, scale: 1.01 }, { t: 2.9, y: -40, scale: 1 }];
  for (const row of samples) assert.deepEqual(M.sampleSeries(samples, row.t), row);
  near(M.sampleSeries(samples, 1.04).y, 240);
  near(M.sampleSeries(samples, 1.04).scale, .895);
  assert.deepEqual(M.sampleSeries(samples, -10), samples[0]);
  assert.deepEqual(M.sampleSeries(samples, 10), samples.at(-1));
  const altered = M.sampleSeries(samples, 1); altered.y = -999;
  assert.equal(samples[0].y, 300);
  for (const t of [1.43, 1.04, 2.8, 1.43, 1.08]) {
    const a = M.sampleSeries(samples, t);
    M.sampleSeries(samples, 2.1); M.sampleSeries(samples, -10);
    assert.deepEqual(M.sampleSeries(samples, t), a);
  }
});

test('reference states are fresh, order independent, and do not mutate calibration data', () => {
  const original = JSON.stringify(D), expected = M.referenceAt(mid);
  const other = M.referenceAt(mid); other.lines[0].y = -999;
  for (const t of [end, start, mid, start + .1, end - .1]) valid(M.referenceAt(t));
  assert.deepEqual(M.referenceAt(mid), expected);
  assert.equal(JSON.stringify(D), original);
  assert.equal(M.referenceAt(start - 99).time, start);
  assert.equal(M.referenceAt(end + 99).time, end);
  for (const bad of [NaN, Infinity, -Infinity]) assert.throws(() => M.referenceAt(bad), /finite/);
});

test('every authored track has sorted finite samples and evaluates its own observations', () => {
  assert.ok(D.tracks.length >= 2);
  for (const track of D.tracks) {
    assert.ok(track.samples.length > 0, track.id);
    for (let n = 0; n < track.samples.length; n++) {
      const row = track.samples[n]; assert.ok(Number.isFinite(row.t));
      if (n) assert.ok(row.t > track.samples[n - 1].t, `${track.id}: strictly increasing knots`);
      if (row.t < start || row.t > end) continue;
      const actual = M.referenceAt(row.t).lines.find(line => line.id === track.id);
      for (const key of ['x', 'y', 'w', 'h']) if (Number.isFinite(row[key])) near(actual[key], row[key], `${track.id}.${key}`);
    }
  }
});

test('all line transforms remain finite under dense, reverse, and irregular timeline sampling', () => {
  for (let i = 0; i <= 1000; i++) valid(M.referenceAt(start + span * i / 1000));
  for (let i = 1000; i >= 0; i -= 7) valid(M.referenceAt(start + span * i / 1000));
  for (const track of D.tracks) for (const event of [...(track.active || []), ...(track.spans || [])]) {
    for (const t of [event.begin - 1e-7, event.begin, event.begin + 1e-7, event.end - 1e-7, event.end, event.end + 1e-7]) valid(M.referenceAt(t));
  }
});

test('seek forward, backward, and exact source endpoints ignores previous sampling history', () => {
  const c = new M.Controller({ time: 2 });
  for (const t of [mid, start, end, start + span * .2, start - 8, end + 8, mid]) {
    c.seek(t, 2); assert.deepEqual(pose(c.state()), pose(M.referenceAt(t)));
    valid(c.tick(5));
  }
});

test('playback is analytically anchored and independent of callback cadence', () => {
  const a = new M.Controller({ time: 10, mediaTime: start + .1, playing: true });
  const b = new M.Controller({ time: 10, mediaTime: start + .1, playing: true });
  const elapsed = Math.min(span * .5, 1.1);
  for (let n = 1; n <= 240; n++) a.tick(10 + elapsed * n / 240);
  b.tick(10 + elapsed);
  assert.deepEqual(a.state(), b.state());
  near(b.state().time, start + .1 + elapsed);
});

test('pause freezes media time and resumption starts at the held frame', () => {
  const c = new M.Controller({ mediaTime: start + span * .25, playing: true });
  c.setPlaying(false, .2); const before = c.state();
  assert.deepEqual(c.tick(900), before); assert.equal(c.needsFrame(), false);
  c.setPlaying(true, 900); assert.deepEqual(pose(c.state()), pose(before));
  near(c.tick(900.1).time, before.time + .1);
});

test('rate reversal preserves current pose and subsequently samples the earlier absolute time', () => {
  const c = new M.Controller({ mediaTime: mid, playing: true });
  c.tick(.15); const before = c.state();
  c.setRate(-1, .15); assert.deepEqual(pose(c.state()), pose(before));
  const reverse = c.tick(.25); near(reverse.time, before.time - .1);
  nearPose(reverse, M.referenceAt(before.time - .1));
  c.setRate(0, .25); const zero = c.state();
  assert.deepEqual(c.tick(20), zero); assert.equal(c.needsFrame(), false);
});

test('both playback directions clamp at their endpoint and stop their frame clock', () => {
  for (const rate of [-1, 1]) {
    const c = new M.Controller({ mediaTime: mid, playing: true, rate });
    const s = c.tick(span + 10); near(s.time, rate < 0 ? start : end);
    assert.equal(s.playing, false); assert.equal(c.needsFrame(), false);
    assert.deepEqual(c.tick(span + 100), s);
  }
});

test('the exclusive timeline end holds the last visible source frame instead of blanking lyrics', () => {
  const lastObservedTime = Math.max(...D.tracks.flatMap(track => track.samples.map(sample => sample.t)));
  const visible = M.referenceAt(lastObservedTime).lines.filter(line => line.visible).map(line => line.id);
  assert.ok(visible.length > 0, 'the acquired clip ends with visible lyric lines');
  const endpoint = M.referenceAt(end);
  assert.deepEqual(endpoint.lines.filter(line => line.visible).map(line => line.id), visible);
  const c = new M.Controller({ mediaTime: mid, playing: true });
  const stopped = c.tick(span + 1);
  assert.equal(stopped.playing, false);
  assert.deepEqual(stopped.lines.filter(line => line.visible).map(line => line.id), visible);
});

test('zero-delta manual takeover preserves the current pose while playback time keeps running', () => {
  const c = new M.Controller({ mediaTime: mid, playing: true });
  c.tick(.1); const before = c.state();
  c.beginManual(300, .1); nearPose(c.state(), before);
  c.moveManual(300, .1); nearPose(c.state(), before);
  const moved = c.moveManual(420, .2);
  moved.lines.forEach((line, n) => near(line.y, before.lines[n].y + 120));
  near(moved.time, before.time + .1);
  c.endManual(.2); assert.equal(c.state().follow, false);
  const later = c.tick(.4);
  later.lines.forEach((line, n) => near(line.y, before.lines[n].y + 120));
  near(later.time, before.time + .3);
});

test('manual cancel and follow resume start continuously and finish at the current media pose', () => {
  for (const command of ['cancelManual', 'resumeFollow']) {
    const c = new M.Controller({ mediaTime: mid, playing: true });
    c.beginManual(300, 0); c.moveManual(430, .1); c.endManual(.1);
    const before = c.state(); c[command](.1); nearPose(c.state(), before);
    assert.equal(c.needsFrame(), true);
    const during = c.tick(.25); assert.equal(during.follow, false); valid(during);
    const final = c.tick(.55); assert.equal(final.follow, true);
    nearPose(final, M.referenceAt(final.time));
  }
});

test('follow return is independently evaluated rather than numerically integrated', () => {
  const a = new M.Controller({ mediaTime: mid, playing: true });
  const b = new M.Controller({ mediaTime: mid, playing: true });
  for (const c of [a, b]) { c.beginManual(300, 0); c.moveManual(430, .1); c.resumeFollow(.1); }
  for (let i = 1; i <= 120; i++) a.tick(.1 + .21 * i / 120);
  b.tick(.31); nearPose(a.state(), b.state());
});

test('interruption of follow return preserves every line and repeated resume commands stay continuous', () => {
  const c = new M.Controller({ mediaTime: mid, playing: true });
  c.beginManual(300, 0); c.moveManual(500, .1); c.resumeFollow(.1); c.tick(.24);
  const before = c.state(); c.beginManual(300, .24); nearPose(c.state(), before);
  c.moveManual(300, .24); nearPose(c.state(), before);
  c.resumeFollow(.24); nearPose(c.state(), before);
  c.tick(.32); const second = c.state(); c.resumeFollow(.32); nearPose(c.state(), second);
  const final = c.tick(1); assert.equal(final.follow, true); nearPose(final, M.referenceAt(final.time));
});

test('seek during manual/return mode clears displaced poses and resumes source following', () => {
  for (const returning of [false, true]) {
    const c = new M.Controller({ mediaTime: mid });
    c.beginManual(300, 0); c.moveManual(500, .1);
    if (returning) { c.resumeFollow(.1); c.tick(.2); }
    c.seek(start + span * .2, .2);
    assert.equal(c.state().follow, true); assert.equal(c.pointer, null);
    nearPose(c.state(), M.referenceAt(start + span * .2));
    c.moveManual(999, .3); nearPose(c.state(), M.referenceAt(start + span * .2));
    assert.equal(c.needsFrame(), false);
  }
});

test('freeze/thaw preserves both playback and in-progress follow-return clocks', () => {
  const a = new M.Controller({ mediaTime: mid, playing: true });
  const b = new M.Controller({ mediaTime: mid, playing: true });
  for (const c of [a, b]) { c.beginManual(300, 0); c.moveManual(430, .1); c.resumeFollow(.1); c.tick(.2); }
  const before = a.state(); a.freeze(.2); assert.equal(a.needsFrame(), false);
  assert.deepEqual(a.tick(100), before); a.freeze(100);
  a.thaw(100.2); nearPose(a.state(), before);
  nearPose(a.tick(100.3), b.tick(.3)); near(a.state().time, b.state().time);
  a.tick(100.6); b.tick(.6); nearPose(a.state(), b.state());
  assert.equal(a.state().follow, true);
});

test('reduced motion removes blur and snaps follow return without stranded animation', () => {
  const c = new M.Controller({ mediaTime: mid, reducedMotion: true });
  assert.ok(c.state().lines.every(l => l.blur === 0));
  c.beginManual(300, 0); c.moveManual(500, .1); c.resumeFollow(.1);
  assert.equal(c.state().follow, true); assert.equal(c.needsFrame(), false);
  c.state().lines.forEach((l, n) => near(l.y, M.referenceAt(mid).lines[n].y));
  c.setReducedMotion(false, .2); c.beginManual(300, .2); c.moveManual(500, .3); c.resumeFollow(.3);
  assert.equal(c.needsFrame(), true); c.setReducedMotion(true, .4);
  assert.equal(c.state().follow, true); assert.equal(c.needsFrame(), false);
  assert.ok(c.state().lines.every(l => l.blur === 0));
});

test('invalid commands throw before corrupting state and alternating interruptions stay finite', () => {
  const c = new M.Controller({ mediaTime: mid });
  const before = c.state();
  for (const bad of [NaN, Infinity, -Infinity]) for (const method of ['seek', 'setRate', 'beginManual', 'moveManual']) {
    assert.throws(() => c[method](bad, 0), /finite/); assert.deepEqual(c.state(), before);
  }
  for (let n = 0; n < 100; n++) {
    const t = n * .03;
    c.setPlaying(true, t); c.setRate(n % 2 ? 1 : -1, t);
    if (n % 3 === 0) { c.beginManual(100, t); c.moveManual(n * 10, t); }
    if (n % 5 === 0) c.resumeFollow(t);
    if (n % 7 === 0) c.seek(start + span * (n % 13) / 13, t);
    valid(c.tick(t));
  }
  c.setPlaying(false, 3); c.resumeFollow(3); valid(c.tick(4));
  assert.equal(c.state().follow, true); assert.equal(c.needsFrame(), false);
});
