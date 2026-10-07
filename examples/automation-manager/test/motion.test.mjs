import test from "node:test";
import assert from "node:assert/strict";
import {
  MOTION,
  menuTransform,
  cubicBezierAt,
  layoutProgress,
  layoutKeyframes,
} from "../src/motion-spec.mjs";
test("menu entrance and exit match source timings and endpoint transforms", () => {
  assert.equal(MOTION.menu.enterMs, 150);
  assert.equal(MOTION.menu.exitMs, 100);
  assert.deepEqual(menuTransform(0), { opacity: 0, scale: 0.95 });
  assert.deepEqual(menuTransform(150), { opacity: 1, scale: 1 });
  assert.deepEqual(menuTransform(0, false), { opacity: 1, scale: 1 });
  assert.deepEqual(menuTransform(100, false), { opacity: 0, scale: 0.95 });
});
test("source enter curve advances quickly without substituting a linear fade", () => {
  const y = cubicBezierAt(0.5, [0.19, 1, 0.22, 1]);
  assert.ok(y > 0.95 && y < 1);
  assert.equal(cubicBezierAt(0, [0.19, 1, 0.22, 1]), 0);
  assert.equal(cubicBezierAt(1, [0.19, 1, 0.22, 1]), 1);
});
test("layout shared timeline is continuous, settled and deterministic", () => {
  assert.equal(layoutProgress(0), 0);
  assert.equal(layoutProgress(500), 1);
  const frames = layoutKeyframes(100, 30);
  assert.equal(frames.length, 31);
  assert.equal(frames[0].transform, "translate(100px,30px)");
  assert.equal(frames.at(-1).transform, "translate(0px,0px)");
});
test("duration spring matches the independently solved damping-envelope root", () => {
  const z = 0.9,
    radial = Math.sqrt(1 - z * z),
    duration = 0.5;
  let lo = 1,
    hi = 100;
  for (let i = 0; i < 100; i++) {
    const w = (lo + hi) / 2;
    const envelope = (z / radial) * Math.exp(-z * w * duration);
    if (envelope > 0.001) lo = w;
    else hi = w;
  }
  const omega = (lo + hi) / 2;
  for (const ms of [50, 100, 150, 200, 300, 400]) {
    const t = ms / 1000;
    const expected =
      1 -
      Math.exp(-z * omega * t) *
        (Math.cos(omega * radial * t) +
          (z / radial) * Math.sin(omega * radial * t));
    assert.ok(Math.abs(layoutProgress(ms) - expected) < 1e-12);
  }
});
