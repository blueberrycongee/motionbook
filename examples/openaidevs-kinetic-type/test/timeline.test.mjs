import test from 'node:test';
import assert from 'node:assert/strict';
import { sequence } from '../src/sequence.mjs';
import { createLayout, sampleTimeline, interpolateTrack } from '../src/timeline.mjs';

const measure = text => ({ width: text.length * 60, ascent: 90, descent: 24, left: 0, right: text.length * 60 });
const layout = createLayout(sequence, measure);
const at = seconds => sampleTimeline(sequence, layout, seconds);

test('Standard and Ultrafast retain identical first-line positions as words reveal', () => {
  for (const time of [.8, 1.4, 2.7, 3.8]) {
    assert.deepEqual(at(time).scenes[0].words.map(({ x, y }) => [x, y]), at(3.8).scenes[0].words.map(({ x, y }) => [x, y]));
  }
  assert.deepEqual(layout[0].words.slice(0, 4).map(word => word.x), layout[1].words.slice(0, 4).map(word => word.x));
  assert.equal(layout[0].words[4].row, 1);
  assert.equal(layout[2].words[5].text, 'Work,');
});

test('word onset, complete Standard hold, and fast reveal use separate clocks', () => {
  assert.equal(at(.75).scenes[0].words[0].alpha, 0);
  assert.ok(at(.81).scenes[0].words[0].alpha > 0);
  assert.equal(at(.9).scenes[0].words[0].alpha, 1);
  assert.deepEqual(at(2.89).scenes[0].words.map(word => word.color), Array(7).fill([255, 255, 255]));
  assert.ok(at(4.39).scenes[0].words.every(word => word.alpha === 1));
  assert.ok(at(5.191).scenes[1].words.every(word => word.alpha === 1));
  assert.ok(at(5.354).scenes[1].words.every(word => word.color.every(channel => channel === 255)));
});

test('observed dot trajectory includes opening overshoot and diagonal line returns', () => {
  const dot = at(.583).scenes[0].dot;
  assert.ok(Math.abs(dot.x / (24 / 7) - 95.5) < 1e-9);
  assert.ok(dot.x < layout[0].words[0].x);
  const before = at(1.733).scenes[0].dot, after = at(1.856).scenes[0].dot;
  assert.ok(after.x < before.x && after.y > before.y);
  assert.equal(at(5.19).scenes[1].dot.radius, 0);
  assert.equal(at(9.64).scenes[2].dot.radius, 0);
});

test('cloud-reviewed Ultrafast words reach full opacity without delaying their white settling', () => {
  const first = at(4.939).scenes[1].words;
  assert.equal(first[0].alpha, 1);
  assert.equal(first[1].alpha, 1);
  assert.ok(first[0].color[1] < 190 && first[1].color[1] < 190);
  assert.equal(at(5.073).scenes[1].words[5].alpha, 1);
  assert.deepEqual(at(5.354).scenes[1].words[5].color, [255, 255, 255]);
});

test('opening dot stays white through the observed approach before quickly tinting orange', () => {
  assert.deepEqual(at(.702).scenes[0].dot.color, [255, 255, 255]);
  assert.deepEqual(at(.81).scenes[0].dot.color, [254, 116, 29]);
});

test('shape-preserving interpolation is continuous with matching join velocity', () => {
  const track = [[0, 0, 0], [.2, 40, 5], [.5, 60, 5], [.9, 5, 8]];
  for (let t = 0; t <= .9; t += .001) {
    const [x, y] = interpolateTrack(track, t);
    assert.ok(x >= -1e-9 && x <= 60.000001 && y >= 0 && y <= 8.000001);
  }
  const e = 1e-5;
  for (const t of [.2, .5]) {
    const a = interpolateTrack(track, t - e), b = interpolateTrack(track, t), c = interpolateTrack(track, t + e);
    for (let d = 0; d < 2; d++) assert.ok(Math.abs((b[d] - a[d]) / e - (c[d] - b[d]) / e) < .2);
  }
});

test('scene fades reach black at their endpoints and leave the ending black hold', () => {
  assert.equal(at(4.4).scenes[0].alpha, 1);
  assert.ok(at(4.52).scenes[0].alpha > 0 && at(4.52).scenes[0].alpha < 1);
  assert.equal(at(4.64).scenes[0].alpha, 0);
  assert.equal(at(7.40).scenes[1].alpha, 1);
  assert.ok(at(7.578).scenes[1].alpha > .18 && at(7.578).scenes[1].alpha < .25);
  assert.equal(at(7.65).scenes[1].alpha, 0);
  assert.equal(at(7.696).scenes[1].alpha, 0);
  for (const time of [13.79, 13.99, 14, 17]) assert.ok(at(time).scenes.every(scene => scene.alpha === 0));
});

test('reduced motion always presents a complete static final message', () => {
  for (const time of [0, 1, 5, 8, 14]) {
    const state = sampleTimeline(sequence, layout, time, { reducedMotion: true });
    assert.equal(state.scenes.length, 1);
    assert.equal(state.scenes[0].id, 'cta');
    assert.equal(state.scenes[0].dot.radius, 0);
    assert.ok(state.scenes[0].words.every(word => word.alpha === 1));
  }
});

test('invalid cue counts and nonfinite seek samples fail explicitly', () => {
  const invalid = structuredClone(sequence);
  invalid.scenes[0].cues.pop();
  assert.throws(() => createLayout(invalid, measure), /one increasing cue/);
  assert.throws(() => at(NaN), /finite/);
});
