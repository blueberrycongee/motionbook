'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const M = require('../src/motion.js');
const S = require('../src/scene.js');
const D = require('../src/calibration-data.js');
const O = require('../validation/highlight-observations.json');
const R = require('../tools/render.cjs');
const near = (a, b, eps = 1e-9, label = '') => assert.ok(Math.abs(a - b) <= eps, `${label}: ${a} != ${b}`);
const sourceTimes = R.timeline(M.referenceSpec.start, M.referenceSpec.end, M.referenceSpec).map(f => f.time);
const fronts = state => state.lines.map(({ id, highlight, highlightFeather, highlightGain, sourceFront50, sourceFeather, sourceGain }) =>
  ({ id, highlight, highlightFeather, highlightGain, sourceFront50, sourceFeather, sourceGain }));

// Pixel tests deliberately freeze geometry/opacity/blur. A scroll, line fade, or
// global scene mask may otherwise change RGB even when the sweep is monotone.
function isolatedState(id, progress, { base = 0, lit = 1 } = {}) {
  const state = M.referenceAt(M.referenceSpec.start);
  for (const line of state.lines) line.visible = line.id === id;
  const line = state.lines.find(line => line.id === id);
  Object.assign(line, { x: 40, y: 300, scale: 1, blur: 0, opacity: base, litOpacity: lit,
    visible: true, highlight: progress, highlightGain: 1, highlightFeather: .12 });
  return state;
}
async function pixels(state) {
  return R.sharp(Buffer.from(S.render(state)))
    .extract({ left: 35, top: 292, width: 365, height: 75 }).raw().toBuffer();
}

test('all retained source highlight samples correspond to distinct original integer PTS', () => {
  assert.equal(M.referenceSpec.timeBase, '1/30000');
  assert.equal(M.referenceSpec.fps, '30000/1001');
  assert.equal(O.samples.length, 270);
  for (let i = 0; i < O.samples.length; i++) {
    const frame = O.samples[i];
    assert.equal(frame.source_frame, 390 + i, 'complete original frame sequence, including excluded frames');
    const integerPts = frame.source_frame * 1001;
    near(frame.source_pts, integerPts / 30000, .0000005001, `frame ${frame.source_frame} rounded source seconds`);
  }
});

test('highlight sampling and reverse seeking are independent of evaluation order at every source frame', () => {
  const before = JSON.stringify(D);
  const expected = new Map(sourceTimes.map(t => [t, fronts(M.referenceAt(t))]));
  const controller = new M.Controller({ playing: false });
  for (const t of [...sourceTimes].reverse()) {
    assert.deepEqual(fronts(M.referenceAt(t)), expected.get(t));
    controller.seek(t, 0);
    assert.deepEqual(fronts(controller.state()), expected.get(t));
    assert.deepEqual(S.attributes(controller.state()), S.attributes(M.referenceAt(t)));
  }
  // Interleave non-knot positions with late/early jumps, rather than checking
  // only a cached forward sequence.
  for (let i = 1; i < sourceTimes.length; i++) {
    const t = (sourceTimes[i - 1] + sourceTimes[i]) / 2;
    const expectedAttributes = S.attributes(M.referenceAt(t));
    M.referenceAt(M.referenceSpec.end); M.referenceAt(M.referenceSpec.start);
    controller.seek(t, 0);
    assert.deepEqual(S.attributes(controller.state()), expectedAttributes);
  }
  assert.equal(JSON.stringify(D), before, 'sampling cannot mutate evidence or fitted controls');
});

test('zero and full sweep endpoints reveal none and all of each authored row ink', async () => {
  for (const id of ['A1', 'A2', 'A3', 'A4', 'B1', 'B2', 'B3', 'B4']) {
    const dark = await pixels(isolatedState(id, 0, { lit: 0 }));
    assert.deepEqual(await pixels(isolatedState(id, 0)), dark, `${id}: zero must not paint bright ink`);
    const unmasked = await pixels(isolatedState(id, 0, { base: 1, lit: 0 }));
    assert.notDeepEqual(unmasked, dark, `${id}: test crop contains actual authored glyphs`);
    assert.deepEqual(await pixels(isolatedState(id, 1)), unmasked, `${id}: full sweep must cover the complete authored ink`);
  }
});

test('increasing sweep progress produces a nested raster mask on narrow and wide authored rows', async () => {
  for (const id of ['A4', 'B2']) {
    let previous = await pixels(isolatedState(id, 0));
    const full = await pixels(isolatedState(id, 1));
    for (let step = 1; step <= 20; step++) {
      const actual = await pixels(isolatedState(id, step / 20));
      for (let i = 0; i < actual.length; i += 4) for (let channel = 0; channel < 3; channel++) {
        const at = i + channel;
        // One 8-bit level is only raster compositing roundoff, not a temporal
        // smoothing or native-image accuracy allowance.
        assert.ok(actual[at] >= previous[at] - 1, `${id}: bright pixel retracted at progress ${step / 20}`);
        assert.ok(actual[at] <= full[at] + 1, `${id}: mask exceeded its unmasked glyph`);
      }
      previous = actual;
    }
  }
});

test('equal dim and lit alpha paints each glyph once, including antialiased edges', async () => {
  for (const opacity of [.352, .5, 1]) {
    const expected = await pixels(isolatedState('B2', 0, { base: opacity, lit: opacity }));
    for (const progress of [.25, .5, .75, 1]) {
      const actual = await pixels(isolatedState('B2', progress, { base: opacity, lit: opacity }));
      let largestDifference = 0;
      for (let i = 0; i < actual.length; i++) largestDifference = Math.max(largestDifference, Math.abs(actual[i] - expected[i]));
      assert.ok(largestDifference <= 1,
        `alpha ${opacity}, progress ${progress}: duplicate glyph compositing changed pixels by ${largestDifference}/255`);
    }
  }
});

async function inkBounds(state) {
  const darkState = structuredClone(state);
  const id = state.lines.find(l => l.visible).id;
  Object.assign(darkState.lines.find(l => l.id === id), { opacity: 0, litOpacity: 0 });
  const dark = await pixels(darkState), actual = await pixels(state);
  let left = Infinity, right = -Infinity;
  for (let pixel = 0; pixel < actual.length / 4; pixel++) {
    const index = pixel * 4;
    if (Math.max(...[0, 1, 2].map(c => actual[index + c] - dark[index + c])) <= 3) continue;
    const x = pixel % 365 + 35 - 40;
    left = Math.min(left, x); right = Math.max(right, x);
  }
  assert.ok(Number.isFinite(left) && right >= left, 'visible authored ink is required');
  return { left, right, width: right - left + 1 };
}

test('authored ink actually follows target width in the offline renderer', async () => {
  for (const id of ['A1', 'A3', 'B2', 'B4']) {
    const first = isolatedState(id, 1, { base: 1, lit: 1 });
    const line = first.lines.find(l => l.id === id);
    const natural = await inkBounds(first);
    const second = structuredClone(first);
    second.lines.find(l => l.id === id).w = 8 + (line.w - 8) * .6;
    const smaller = await inkBounds(second);
    // This bound comes from quantizing two measured raster endpoints. Merely
    // changing textLength (ignored by this librsvg version) must fail it.
    near(smaller.width, natural.width * .6, 2, `${id}: actual glyph resize`);
    assert.ok(smaller.width < natural.width, `${id}: target width reaches rendered ink`);
  }
});

test('quarter-speed review preserves the complete native frame set and quantizes only presentation time', () => {
  const H = require('../tools/render-highlight-review.cjs');
  const frames = R.timeline(548 * 1001 / 30000, 615 * 1001 / 30000, M.referenceSpec);
  const interval = 4004 / 30000;
  const delays = frames.map((_, i) => Math.round((i + 1) * interval * 100) - Math.round(i * interval * 100));
  const media = {
    mp4: { decodedFrameCount: frames.length, durationSeconds: frames.length * interval },
    gif: { decodedFrameCount: frames.length, durationSeconds: delays.reduce((a, b) => a + b, 0) / 100,
      packets: delays.map(cs => ({ duration_time: (cs / 100).toFixed(6) })) },
  };
  const before = JSON.stringify(frames), timing = H.outputTiming(frames, media);
  assert.equal(timing.playbackRate, .25);
  assert.equal(timing.sourceFrameCount, 67);
  assert.equal(timing.syntheticFrames, 0); assert.equal(timing.duplicatedFrames, 0);
  assert.equal(JSON.stringify(frames), before, 'review timing must not rewrite original PTS');
  for (let i = 0; i < frames.length; i++) assert.equal(frames[i].pts, (548 + i) * 1001);
  assert.ok(delays.every(cs => cs === 13 || cs === 14));
  assert.ok(timing.gifMaximumBoundaryErrorSeconds <= .005000001, 'nearest-centisecond quantization bound');
  const dropped = structuredClone(media); dropped.mp4.decodedFrameCount--;
  assert.throws(() => H.outputTiming(frames, dropped), /correspondence/);
  const speedChanged = structuredClone(media); speedChanged.mp4.durationSeconds /= 4;
  assert.throws(() => H.outputTiming(frames, speedChanged), /0.25/);
  const wrongDelay = structuredClone(media); wrongDelay.gif.packets[20].duration_time = '.12';
  assert.throws(() => H.outputTiming(frames, wrongDelay), /delays/);
});

const F = require('../validation/highlight-field-fit.json');
const fittedLine = (sample, time = sample.pts / 30000) => M.referenceAt(time).lines.find(l => l.id === sample.line);
const partialSamples = id => F.samples.filter(s => s.line === id && Array.isArray(s.modelAdmissibleCenterInterval));

test('new field measurements retain all four row records at every original source PTS, including censoring', () => {
  const ids = Object.keys(F.lines).sort();
  assert.deepEqual(ids, ['A3', 'A4', 'B1', 'B2']);
  assert.equal(F.coverage.timeBase, M.referenceSpec.timeBase);
  assert.equal(F.coverage.startFrame, 500); assert.equal(F.coverage.endFrameInclusive, 614);
  assert.equal(F.coverage.frameCount, 115); assert.equal(F.samples.length, 460);
  const seen = new Set();
  for (const s of F.samples) {
    assert.ok(Number.isInteger(s.frame) && s.frame >= 500 && s.frame <= 614);
    assert.equal(s.pts, s.frame * 1001);
    near(s.t, s.pts / 30000, .00000000051, `${s.line} frame ${s.frame}`);
    const key = `${s.frame}:${s.line}`; assert.ok(!seen.has(key), `duplicate ${key}`); seen.add(key);
    assert.ok(ids.includes(s.line)); assert.equal(typeof s.state, 'string');
    if (s.state === 'measured' || s.state.endsWith('_censored')) {
      assert.ok(Array.isArray(s.modelAdmissibleCenterInterval), `${key}: uncertainty is required`);
      assert.ok(s.spatialUncertaintyPx > 0);
    } else {
      // Occlusion, blur, undetectable onset, and complete ink cannot establish
      // a precise moving-front observation at that time.
      assert.ok(!Array.isArray(s.modelAdmissibleCenterInterval), `${key}: unidentifiable edge must not become a numeric constraint`);
    }
  }
  for (let frame = 500; frame <= 614; frame++) for (const id of ids) assert.ok(seen.has(`${frame}:${id}`));
});

test('each partial sweep stays inside the measured or explicitly censored source-center interval', () => {
  for (const id of Object.keys(F.lines)) for (const s of partialSamples(id)) {
    const line = fittedLine(s), [lo, hi] = s.modelAdmissibleCenterInterval;
    assert.ok(line.sourceFront50 >= lo - .00051 && line.sourceFront50 <= hi + .00051,
      `${id} frame ${s.frame}: ${line.sourceFront50} outside conditional fit interval [${lo},${hi}]`);
    assert.ok(line.sourceFeather > 0 && Number.isFinite(line.sourceGain));
    const [inkLeft, inkRight] = F.lines[id].inkSpanEdges;
    near(line.sourceInkLeft, inkLeft); near(line.sourceInkWidth, inkRight - inkLeft);
    const p = M.clamp((line.sourceFront50 + line.sourceFeather / 2 - inkLeft) /
      (inkRight - inkLeft + line.sourceFeather), 0, 1);
    near(line.highlight, p, 1e-8, `${id} source field to authored-ink progress`);
    near(line.highlightFeather, line.sourceFeather / (inkRight - inkLeft), 1e-8);
    near(line.highlightGain, M.clamp(line.sourceGain, 0, 1), 1e-8);
  }
});

test('source-frame jumps are bounded by adjacent measured intervals, without a global velocity cap', () => {
  for (const id of Object.keys(F.lines)) {
    const samples = partialSamples(id);
    for (let i = 1; i < samples.length; i++) {
      const a = samples[i - 1], b = samples[i];
      if (b.frame !== a.frame + 1) continue;
      const x = fittedLine(a).sourceFront50, y = fittedLine(b).sourceFront50;
      const delta = y - x;
      const lower = b.modelAdmissibleCenterInterval[0] - a.modelAdmissibleCenterInterval[1];
      const upper = b.modelAdmissibleCenterInterval[1] - a.modelAdmissibleCenterInterval[0];
      assert.ok(delta >= lower - .00102 && delta <= upper + .00102,
        `${id} ${a.frame}->${b.frame}: ${delta}px outside measured interval difference [${lower},${upper}]`);
      assert.ok(delta >= -1e-9, `${id}: reconstructed forward center must not backtrack`);
      // Subframe interpolation is a reconstruction, but it must stay within its
      // two accepted observations; it must not invent an overshooting spring.
      for (const fraction of [.25, .5, .75]) {
        const t = (a.pts + (b.pts - a.pts) * fraction) / 30000;
        const middle = fittedLine(a, t).sourceFront50;
        assert.ok(middle >= x - 1e-8 && middle <= y + 1e-8, `${id}: subframe overshoot`);
      }
    }
  }
});

test('fitted spatial feather is supported by same-frame residual comparison, rather than added as temporal easing', () => {
  for (const id of Object.keys(F.lines)) {
    const mature = partialSamples(id).filter(s => s.state === 'measured' && s.gain >= .9);
    assert.ok(mature.length > 0, id);
    const median = xs => [...xs].sort((a, b) => a - b)[Math.floor(xs.length / 2)];
    assert.ok(median(mature.map(s => s.rmse)) < median(mature.map(s => s.hardRmse)),
      `${id}: ramp must improve on independently fitted hard edge in the supplied source measurements`);
    for (const s of mature) {
      const line = fittedLine(s);
      near(line.sourceFeather, s.feather, 1e-7, `${id}: retained fitted spatial width`);
      assert.ok(line.highlightFeather > 0, `${id}: measured soft field must reach scene`);
    }
  }
});

const FS = require('../validation/highlight-field-statistics.json');
const displayedField = (line, unitX) => line.highlightGain * M.clamp(
  (line.highlight * (1 + line.highlightFeather) - unitX) / Math.max(1e-12, line.highlightFeather), 0, 1);

test('forward field fluctuations stay within the per-line negative steps actually measured in source pixels', () => {
  for (const [id, evidence] of Object.entries(FS.fieldMonotonicity)) {
    const [first, last] = evidence.intervalFrames;
    for (let frame = first; frame < last; frame++) {
      const a = M.referenceAt(frame * 1001 / 30000).lines.find(l => l.id === id);
      const b = M.referenceAt((frame + 1) * 1001 / 30000).lines.find(l => l.id === id);
      for (let x = 0; x <= 500; x++) {
        const step = displayedField(b, x / 500) - displayedField(a, x / 500);
        // These source images are not strictly pixel-monotone. The bound is
        // their measured negative-step minimum, with 4-decimal serialization
        // roundoff; it is not an invented universal alpha/speed threshold.
        assert.ok(step >= evidence.signedStepQuantiles.min - .0001,
          `${id} frame ${frame}: field retreat ${step} exceeds measured fluctuation ${evidence.signedStepQuantiles.min}`);
      }
    }
  }
});

test('the late B2 partial-field hold retains its measured range and does not replay the old threshold reversal', () => {
  const hold = FS.lateB2Hold, [first, last] = hold.frames;
  assert.deepEqual([first, last], [608, 614]);
  const lines = Array.from({ length: last - first + 1 }, (_, i) =>
    M.referenceAt((first + i) * 1001 / 30000).lines.find(l => l.id === 'B2'));
  const centers = lines.map(l => l.sourceFront50);
  const observedRange = hold.frontFitRangePx[1] - hold.frontFitRangePx[0];
  assert.ok(Math.max(...centers) - Math.min(...centers) <= observedRange + .0001,
    'a source-compatible hold cannot become a long drift');
  for (let i = 1; i < centers.length; i++) assert.ok(centers[i] >= centers[i - 1] - 1e-9);
  for (let x = 0; x <= 500; x++) {
    const values = lines.map(l => displayedField(l, x / 500));
    assert.ok(Math.max(...values) - Math.min(...values) <= hold.maximumPerColumnRange + .0001,
      'the held spatial field must remain within the observed field range');
  }
  const endpoint = M.referenceAt(M.referenceSpec.end).lines.find(l => l.id === 'B2');
  for (const key of ['highlight', 'highlightFeather', 'highlightGain', 'sourceFront50', 'sourceFeather', 'sourceGain'])
    near(endpoint[key], lines.at(-1)[key], 1e-8, `right-censored hold keeps last observed ${key}`);
});

test('the first source-supported B1 field is visible before the old near-white threshold would trigger', () => {
  const first = partialSamples('B1')[0];
  assert.equal(first.frame, 556); assert.equal(first.state, 'onset_censored');
  const line = fittedLine(first);
  assert.ok(line.highlight > 0 && line.highlightGain > 0);
  const old = O.samples.find(s => s.source_frame === first.frame);
  assert.equal(old.rows.find(r => r.row === 1).front_fraction, 0,
    'this test must distinguish field onset from the old threshold onset');
  const previous = F.samples.find(s => s.line === 'B1' && s.frame === first.frame - 1);
  assert.equal(previous.state, 'below_detection');
  assert.equal(fittedLine(previous).highlightGain, 0,
    'dark before detection is a documented rendering convention, not a precise measured zero');
});

test('recorded review timelines reject missing original frames and conflicting source clocks', () => {
  const H = require('../tools/render-highlight-review.cjs');
  const frames = H.recordedSourceTimeline(F, 548, 614);
  assert.equal(frames.length, 67);
  frames.forEach((f, i) => assert.equal(f.pts, (548 + i) * 1001));
  const missing = structuredClone(F); missing.samples = missing.samples.filter(s => s.frame !== 570);
  assert.throws(() => H.recordedSourceTimeline(missing, 548, 614), /incomplete/);
  const conflicting = structuredClone(F); conflicting.samples.find(s => s.frame === 570).pts++;
  assert.throws(() => H.recordedSourceTimeline(conflicting, 548, 614), /Conflicting/);
});

test('final slow review binds every source frame to the unchanged old/new scenes and verified output bytes', () => {
  const H = require('../tools/render-highlight-review.cjs');
  const dir = path.join(R.ROOT, 'preview/highlight-review');
  const manifest = JSON.parse(fs.readFileSync(path.join(dir, 'review-manifest.json'), 'utf8'));
  assert.deepEqual(manifest.core, R.coreHashes(), 'current scene changed after review export');
  assert.equal(manifest.source.sha256, M.referenceSpec.sourceSha256);
  assert.equal(manifest.sourceFit.sha256, R.sha256(path.join(R.ROOT, 'validation/highlight-field-fit.json')));
  for (const [file, hash] of Object.entries(manifest.harness)) assert.equal(hash, R.sha256(path.join(R.ROOT, file)));
  for (const [file, hash] of Object.entries(manifest.outputs)) assert.equal(hash, R.sha256(path.join(dir, file)));
  const baseline = path.join(R.ROOT, 'validation/highlight-v0');
  assert.deepEqual(manifest.baselineCore, H.baselineHashes(baseline));
  const oldM = require(path.join(baseline, 'src/motion.js'));
  const oldS = require(path.join(baseline, 'src/scene.js'));
  const expected = H.recordedSourceTimeline(F, manifest.source.firstFrame, manifest.source.lastFrameInclusive);
  assert.equal(manifest.frames.length, expected.length);
  R.validateFrames(manifest.frames);
  for (let i = 0; i < manifest.frames.length; i++) {
    const f = manifest.frames[i];
    assert.equal(f.pts, expected[i].pts); assert.equal(f.sourcePts, expected[i].pts);
    near(f.time, f.pts / 30000); near(f.sourceTime, f.time);
    assert.equal(f.reviewPts, i * 4004); near(f.reviewTime, i * 4004 / 30000);
    assert.equal(f.newSceneSha256, R.bufferHash(S.render(M.referenceAt(f.time))), `new frame ${i}`);
    assert.equal(f.oldSceneSha256, R.bufferHash(oldS.render(oldM.referenceAt(f.time))), `old frame ${i}`);
  }
  const timing = H.outputTiming(manifest.frames, { mp4: manifest.timing.mp4, gif: manifest.timing.gif });
  assert.deepEqual(manifest.timing, timing);
  assert.equal(timing.playbackRate, .25); assert.equal(timing.syntheticFrames, 0);
  for (const name of ['mp4', 'gif']) {
    assert.equal(timing[name].audioStreams, 0);
    assert.equal(timing[name].decodedFrameCount, expected.length);
    assert.match(timing[name].completeDecodeSha256, /^[a-f0-9]{64}$/);
  }
});
