'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const Motion = require('./motion.js');

function runTests() {
  const started = Date.now(), checks = [];
  function check(name, fn) { fn(); checks.push(name); }
  const options = { seed: 4262026, startTime: '12:39:42' };
  check('CommonJS and browser UMD exports', () => {
    const context = vm.createContext({});
    vm.runInContext(fs.readFileSync(require.resolve('./motion.js'), 'utf8'), context);
    assert.equal(typeof context.ClockMotion.createSimulation, 'function');
    assert.equal(context.ClockMotion.VERSION, Motion.VERSION);
  });
  check('HHMMSS minute and midnight rollover', () => {
    assert.equal(Motion.stateAt(0).text, '123942');
    assert.equal(Motion.stateAt(17.999).text, '123959');
    assert.equal(Motion.stateAt(18).text, '124000');
    assert.equal(Motion.stateAt(22).text, '124004');
    assert.equal(Motion.clockText(86400), '000000');
    assert.equal(Motion.clockText(-1), '235959');
    assert.equal(Motion.createSimulation({ startTime: 86399, preRoll: 0 }).stateAt(1).text, '000000');
  });
  check('Immediate gravity, independent six-body births, no top hold', () => {
    const sim = Motion.createSimulation({ preRoll: 0, spawnPhase: 0 });
    const a = sim.stateAt(0), b = sim.stateAt(1 / 120), c = sim.stateAt(.5);
    assert.equal(a.bodies.length, 6);
    assert.equal(a.bodies.map(b => b.digit).join(''), '123942');
    for (let i = 0; i < 6; i++) {
      assert.equal(a.bodies[i].physicsPosition[1], 1200);
      assert(b.bodies[i].position[1] < a.bodies[i].position[1]);
      assert(b.bodies[i].velocity[1] < 0);
      assert(c.bodies[i].position[1] < 1040);
      assert(c.bodies[i].position[1] > 1030);
    }
    const next = sim.stateAt(1).bodies.filter(b => b.row === 1);
    assert.equal(next.length, 6);
    assert.equal(next.map(b => b.digit).join(''), '123943');
    assert(next.every(b => b.physicsPosition[1] === 1200));
  });
  check('Fractional interpolation stays continuous between fixed steps', () => {
    const sim = Motion.createSimulation({ preRoll: 0, spawnPhase: 0 });
    const a = sim.stateAt(.25).bodies[0], b = sim.stateAt(.25 + 1 / 240).bodies[0], c = sim.stateAt(.25 + 1 / 120).bodies[0];
    assert(Math.abs(b.position[1] - (a.position[1] + c.position[1]) / 2) < 1e-9);
    assert(Math.abs(Math.hypot(...b.quaternion) - 1) < 1e-12);
  });
  check('Seek order, frame cadence, cache eviction and reset do not change states', () => {
    const times = [0, .137, .799, 1, 2.333, 7.151, 17.999, 18, 22, 33.383];
    const first = Motion.createSimulation(options), expected = new Map(times.map(t => [t, JSON.stringify(first.stateAt(t))]));
    const second = Motion.createSimulation(options);
    second.stateAt(100);
    for (const t of [22, .799, 33.383, 0, 18, 2.333, 17.999, .137, 7.151, 1]) assert.equal(JSON.stringify(second.stateAt(t)), expected.get(t), 'time ' + t);
    second.reset();
    assert.equal(JSON.stringify(second.stateAt(22)), expected.get(22));
  });
  check('Seed reproducibility and seed variation', () => {
    const a = Motion.createSimulation({ seed: 'repeatable-clock' }).stateAt(2), b = Motion.createSimulation({ seed: 'repeatable-clock' }).stateAt(2), c = Motion.createSimulation({ seed: 'different-clock' }).stateAt(2);
    assert.deepEqual(a, b);
    assert.notDeepEqual(a.bodies, c.bodies);
  });
  let observed;
  check('Full reference duration: finite 6DOF states, collision tumbling and two-sided spills', () => {
    const sim = Motion.createSimulation(options);
    let min = Infinity, max = 0, tumblers = 0, front = 0, back = 0, side = 0, removed = 0, totalBodies = 0, frames = 0;
    for (let frame = 0; frame <= 1020; frame++) {
      const state = sim.stateAt(frame / 30);
      min = Math.min(min, state.bodies.length); max = Math.max(max, state.bodies.length); totalBodies += state.bodies.length; frames++;
      assert(state.bodies.length <= Motion.DEFAULTS.maxBodies);
      assert.equal(new Set(state.bodies.map(b => b.id)).size, state.bodies.length);
      for (const b of state.bodies) {
        for (const key of ['position', 'quaternion', 'rotation', 'velocity', 'angularVelocity', 'collider']) assert(b[key].every(Number.isFinite), key);
        assert(Math.abs(Math.hypot(...b.quaternion) - 1) < 1e-9);
        assert(b.physicsPosition[1] > Motion.DEFAULTS.removalY - 1);
        if (Math.hypot(...b.angularVelocity) > .5 && Math.abs(b.rotation[0]) + Math.abs(b.rotation[1]) > .3) tumblers++;
        if (b.position[2] > 80) front++;
        if (b.position[2] < -80) back++;
        if (Math.abs(b.position[0]) > 520) side++;
      }
      removed = state.stats.removed;
    }
    assert(tumblers > 200); assert(front > 50); assert(back > 50); assert(side > 20); assert(removed > 150);
    assert(min >= 6); assert(max < 40);
    assert(sim.cacheInfo().checkpoints <= Motion.DEFAULTS.maxCheckpoints);
    observed = { sampledFrames: frames, bodyCountMin: min, bodyCountMax: max, bodyCountMean: +(totalBodies / frames).toFixed(2), removedBy34s: removed, tumbleObservations: tumblers, frontSpillObservations: front, backSpillObservations: back, sideSpillObservations: side };
  });
  check('Long-run body lifecycle and caches remain bounded', () => {
    const sim = Motion.createSimulation({ maxCheckpoints: 4, maxBodyAge: 8, maxBodies: 36 });
    const state = sim.stateAt(120), info = sim.cacheInfo();
    assert(state.bodies.length <= 36);
    assert(state.bodies.every(b => b.age <= 8 + 1 / 120));
    assert(info.checkpoints <= 4); assert(info.retainedBodies <= 36);
    Motion.clearCache();
    for (let seed = 0; seed < 8; seed++) Motion.stateAt(0, { seed, preRoll: 0 });
    assert.equal(Motion.cacheInfo().simulations, 4);
  });
  check('NaN, infinity, invalid range, invalid time, wrong type and unknown options rejected', () => {
    for (const time of [NaN, Infinity, -Infinity, '1', null, -1, 120.1]) assert.throws(() => Motion.stateAt(time));
    const bad = [{ gravity: NaN }, { seed: Infinity }, { seed: -1 }, { seed: 1.5 }, { seed: {} }, { startTime: '25:00:00' }, { startTime: '12:60:00' }, { startTime: '123942' }, { startTime: 86400 }, { preRoll: 1.5 }, { spawnPhase: Infinity }, { spawnPhase: 1 }, { fixedStep: 0 }, { fixedStep: 1 / 30 }, { maxBodies: 99999 }, { maxCheckpoints: 0 }, { solverIterations: 0 }, { thickness: 0 }, {useGlyphBounds: 1}, { unknown: 1 }, { toString: 1 }, null, [], 42];
    for (const o of bad) assert.throws(() => Motion.createSimulation(o), JSON.stringify(o));
    for (const key of Object.keys(Motion.DEFAULTS).filter(k => typeof Motion.DEFAULTS[k] === 'number')) assert.throws(() => Motion.createSimulation({ [key]: NaN }), key);
  });
  check('Per-glyph boxes match dimensions and preserve the optional common-box mode', () => {
    const a = Motion.createSimulation({ preRoll: 0, spawnPhase: 0 }).stateAt(0);
    const one = a.bodies.find(b => b.digit === '1'), four = a.bodies.find(b => b.digit === '4');
    const gx=require('./geometry-data.js').digits['1'].contours.flatMap(c=>c.points.map(p=>p[0]));const expectedWidth=(Math.max(...gx)-Math.min(...gx))*Motion.DEFAULTS.capHeight;assert(Math.abs(one.collider[0]-expectedWidth)<1e-5);
    assert(four.collider[0] > 160);
    assert.notDeepEqual(one.position, one.physicsPosition);
    const common = Motion.createSimulation({ preRoll: 0, spawnPhase: 0, useGlyphBounds: false, bodyWidth: 100 }).stateAt(0);
    assert(common.bodies.every(b => b.collider[0] === 100));
    assert(common.bodies.every(b => b.position.every((x, i) => x === b.physicsPosition[i])));
  });
  check('Calibrated demo preset stays finite, populated and below its 48-body cap', () => {
    const s = Motion.createSimulation({ capHeight: 220, spawnY: 1000, gravity: 850, spawnPhase: -1.34, maxBodies: 48 });
    let min = Infinity, max = 0, count = 0, n = 0;
    for (let f = 0; f <= 1020; f++) {
      const a = s.stateAt(f / 30);
      min = Math.min(min, a.bodies.length); max = Math.max(max, a.bodies.length); count += a.bodies.length; n++;
      assert(a.bodies.every(b => b.position.every(Number.isFinite) && b.quaternion.every(Number.isFinite)));
      assert(a.bodies.length < 48);
    }
    observed.calibratedPreset = { bodyCountMin: min, bodyCountMax: max, bodyCountMean: +(count / n).toFixed(2), removedBy34s: s.stateAt(34).stats.removed };
    assert(min >= 6); assert(s.stateAt(34).stats.removed > 150);
  });
  check('Alternate 1/60 step is deterministic and finite', () => {
    const opts = { fixedStep: 1 / 60, seed: 19 };
    const a = Motion.createSimulation(opts).stateAt(6.123), b = Motion.createSimulation(opts);
    b.stateAt(8); assert.deepEqual(b.stateAt(6.123), a);
    assert(a.bodies.every(body => body.position.every(Number.isFinite)));
  });
  return { status: 'passed', version: Motion.VERSION, checks, observations: observed, elapsedMs: Date.now() - started };
}
if (require.main === module) process.stdout.write(JSON.stringify(runTests(), null, 2) + '\n');
module.exports = { runTests };
