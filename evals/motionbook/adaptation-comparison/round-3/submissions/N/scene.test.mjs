import test from 'node:test';
import assert from 'node:assert/strict';
import { renderFrame, stateAt } from './scene.mjs';

const normal = t => stateAt(t, 'normal');
const interrupted = t => stateAt(t, 'interrupted');
const drawn = svg => svg.replace(/ data-[\w-]+="[^"]*"/g, '');
const options = (scenario, reducedMotion = false) => ({ scenario, reducedMotion });

test('normal activation happens at exactly 0.50 s and label is immediate', () => {
  for (const t of [0, .1, .499999]) assert.equal(normal(t).followed, false);
  for (const t of [.5, .500001, .6, 2, 4.5, 6]) {
    assert.equal(normal(t).followed, true);
    assert.equal(normal(t).activationCount, 1);
    assert.match(renderFrame(t), />Following<\/text>/);
    assert.doesNotMatch(renderFrame(t), />Follow studio<\/text>/);
  }
});
test('duplicate activation is a no-op, including motion epoch', () => {
  for (const t of [.85, .9, 1.1, 1.399999]) {
    const state = interrupted(t);
    assert.equal(state.activationCount, 1);
    assert.equal(state.attempts, 2);
    assert.equal(state.activatedAt, .5);
    assert.equal(drawn(renderFrame(t)), drawn(renderFrame(t, options('interrupted'))));
  }
});
test('undo clears followed state and transient reward synchronously', () => {
  for (const t of [1.4, 1.400001, 1.7, 2.099999]) {
    assert.equal(interrupted(t).followed, false);
    assert.equal(interrupted(t).activatedAt, null);
    const svg = renderFrame(t, options('interrupted'));
    assert.match(svg, />Follow studio<\/text>/);
    assert.match(svg, /data-bell-angle="0"/);
    assert.match(svg, /id="confirmation-particles" aria-hidden="true"><\/g>/);
  }
});
test('reactivation starts precisely once and final followed state persists', () => {
  for (const t of [2.1, 2.100001, 2.4, 3, 4.5, 6]) {
    const state = interrupted(t);
    assert.equal(state.followed, true);
    assert.equal(state.activationCount, 2);
    assert.equal(state.attempts, 3);
    assert.equal(state.activatedAt, 2.1);
  }
  assert.equal(drawn(renderFrame(.8)), drawn(renderFrame(2.4, options('interrupted'))));
});
test('all flourish settles with a static retained final state before deadline', () => {
  const finalNormal = renderFrame(6);
  for (const t of [2.1, 2.8, 3.5, 4.5]) assert.equal(renderFrame(t), finalNormal);
  const finalInterrupted = renderFrame(6, options('interrupted'));
  for (const t of [3.7, 4.0, 4.5, 5]) assert.equal(renderFrame(t, options('interrupted')), finalInterrupted);
  assert.match(finalInterrupted, /data-bell-angle="0"/);
  assert.match(finalInterrupted, /id="confirmation-particles" aria-hidden="true"><\/g>/);
});
test('reduced motion keeps every business state without decorative movement', () => {
  for (const scenario of ['normal', 'interrupted']) {
    for (let i = 0; i <= 600; i++) {
      const t = i / 100;
      const svg = renderFrame(t, options(scenario, true));
      assert.match(svg, new RegExp(`data-state="${stateAt(t, scenario).followed ? 'followed' : 'unfollowed'}"`));
      assert.match(svg, /data-bell-angle="0"/);
      assert.match(svg, /id="confirmation-particles" aria-hidden="true"><\/g>/);
    }
  }
  assert.equal(renderFrame(.5, options('normal', true)), renderFrame(6, options('normal', true)));
  assert.equal(renderFrame(2.1, options('interrupted', true)), renderFrame(6, options('interrupted', true)));
});
test('finite cue, color pulse, particles, and bell motion are present in standard mode', () => {
  assert.notEqual(renderFrame(.25), renderFrame(0));
  assert.doesNotMatch(renderFrame(.8), /id="confirmation-particles" aria-hidden="true"><\/g>/);
  assert.doesNotMatch(renderFrame(.9), /data-bell-angle="0"/);
  assert.match(renderFrame(.9), /data-phase="confirmation"/);
});
test('frames are deterministic and random-access independent', () => {
  const expected = renderFrame(.9, options('interrupted'));
  renderFrame(6); renderFrame(0); renderFrame(2.5, options('interrupted'));
  assert.equal(renderFrame(.9, options('interrupted')), expected);
  for (const t of [0, .5, .85, 1.4, 2.1, 4.5, 6]) {
    assert.equal(renderFrame(t), renderFrame(t));
  }
});
test('fixed viewBox, dimension overrides, no prohibited output or nonfinite tokens', () => {
  const svg = renderFrame(1, { width: 400, height: 300 });
  assert.match(svg, /width="400" height="300" viewBox="0 0 800 600"/);
  for (const scenario of ['normal', 'interrupted']) for (let i = 0; i <= 120; i++) {
    const frame = renderFrame(i / 20, options(scenario));
    assert.doesNotMatch(frame, /<(?:script|image|foreignObject|animate|set)\b|\b(?:NaN|Infinity)\b|(?:href|src)=/i);
    assert.match(frame, /role="img"/);
    assert.match(frame, /<title id="title">/);
  }
});
test('default invocation and invalid parameter behavior', () => {
  assert.equal(typeof renderFrame(), 'string');
  assert.equal(renderFrame(-1), renderFrame(0));
  assert.equal(renderFrame(7), renderFrame(6));
  assert.throws(() => renderFrame(NaN), TypeError);
  assert.throws(() => renderFrame(Infinity), TypeError);
  assert.throws(() => renderFrame(1, { width: 0 }), RangeError);
  assert.throws(() => renderFrame(1, { scenario: 'unknown' }), RangeError);
});
