/* Pure motion geometry and interruptible state; shared by browser, tests, preview. */
(function (root, factory) {
  const api = factory(typeof module === 'object' && module.exports ? require('./calibrated.js') : root.GenieCalibrated);
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.GenieMotion = api;
})(typeof window !== 'undefined' ? window : globalThis, function (Calibrated) {
  'use strict';
  const W = 1080, H = 680, DURATION = 0.5, RESTORE_DURATION = 16 / 30, DOCK_CLIP = 584;
  const WINDOW = Object.freeze({ x: 194, y: 112, w: 692, h: 392 });
  const TARGET = Object.freeze({ x: 744, y: 602, w: 60, h: 34 });
  const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
  const mix = (a, b, t) => a + (b - a) * t;
  const smooth = x => { x = clamp(x); return x * x * (3 - 2 * x); };
  const sine = x => (1 - Math.cos(Math.PI * clamp(x))) / 2;

  // Calibrated per-native-frame phase coupling. The sheet does not shrink in y;
  // it moves at full height and is progressively occluded by the Dock.
  function phases(progress, direction = 'minimize') {
    const s = Calibrated.sample(progress, direction), d = s.data;
    return { bend: clamp(s.leftAmplitude / (d.target[0] - d.source[0])), pull: clamp((s.top - d.source[1]) / (d.clip - d.source[1])) };
  }
  function row(progress, v, source = WINDOW, target = TARGET, options = {}) {
    const r = Calibrated.row(progress, v, source, target, options);
    if (!options.bridge) return r;
    const rows = options.bridge, q = clamp(v) * (rows.length - 1), n = Math.min(rows.length - 2, Math.floor(q)), f = q - n;
    const old = Object.fromEntries(['x','y','w'].map(k => [k, mix(rows[n][k], rows[n+1][k], f)]));
    const weight = smooth(Math.abs(progress - options.bridgeFrom) / Math.max(1e-9, Math.abs(options.target - options.bridgeFrom)));
    return Object.fromEntries(['x','y','w'].map(k => [k, mix(old[k], r[k], weight)]));
  }
  function outline(progress, steps = 100, options = {}) {
    return Array.from({ length: steps + 1 }, (_, i) => row(progress, i / steps, options.source || WINDOW, options.destination || TARGET, options));
  }
  function retarget(s, target) {
    if (target === s.target) return s;
    const bridge = s.progress > 0 && s.progress < 1 ? outline(s.progress, 64, s) : null;
    return { ...s, target, direction: target === 1 ? 'minimize' : 'restore', bridge, bridgeFrom: s.progress };
  }
  function initial(reduced = false) {
    return { progress: 0, target: 0, speed: 1, mode: 'manual', dwell: 0, reduced: !!reduced, direction: 'minimize', bridge: null, bridgeFrom: 0 };
  }
  function action(state, event) {
    const s = { ...state };
    switch (event.type) {
      case 'toggle': Object.assign(s, retarget(s, s.target >= .5 ? 0 : 1)); s.mode = 'manual'; s.dwell = 0; break;
      case 'minimize': Object.assign(s, retarget(s, 1)); s.mode = 'manual'; s.dwell = 0; break;
      case 'restore': Object.assign(s, retarget(s, 0)); s.mode = 'manual'; s.dwell = 0; break;
      case 'replay':
        if (s.reduced) return { ...s, progress: 0, target: 0, mode: 'manual', dwell: 0 };
        Object.assign(s, retarget(s, 0)); s.mode = 'replay'; s.dwell = -0.38; break;
      case 'loop':
        s.mode = event.enabled && !s.reduced ? 'loop' : 'manual';
        s.dwell = -0.38; break;
      case 'speed': s.speed = event.slow ? 0.25 : 1; break;
      case 'scrub': s.progress = clamp(Number(event.progress) || 0); s.target = s.progress; s.direction = 'minimize'; s.bridge = null; s.mode = 'manual'; s.dwell = 0; break;
      case 'reduced': s.reduced = !!event.enabled; if (s.reduced) { s.mode = 'manual'; s.target = s.target >= .5 ? 1 : 0; } break;
      case 'reset': return { ...initial(s.reduced), speed: s.speed };
      default: return s;
    }
    if (s.reduced) { s.target = s.target >= .5 ? 1 : 0; s.progress = s.target; s.bridge = null; }
    return s;
  }
  function tick(state, seconds) {
    const s = { ...state }, dt = clamp(Number(seconds) || 0, 0, .1);
    if (s.reduced) return { ...s, progress: s.target, mode: 'manual' };
    if (s.progress !== s.target) {
      s.progress = advanceProgress(s.progress, s.target, dt, s.speed);
      if (s.progress === s.target) s.bridge = null;
      return s;
    }
    if (s.mode === 'manual') return s;
    s.dwell += dt;
    if (s.dwell < (s.target === 0 ? .75 : .9)) return s;
    if (s.mode === 'returning') { s.mode = 'manual'; s.dwell = 0; return s; }
    if (s.mode === 'replay' && s.target === 1) s.mode = 'returning';
    Object.assign(s, retarget(s, s.target ? 0 : 1)); s.dwell = 0;
    return s;
  }
  // One clock for manual playback and exported previews. The parameter is time;
  // phases() converts it to two non-linear, overlapping motions.
  function advanceProgress(from, to, elapsed, speed = 1) {
    const duration = to >= from ? DURATION : RESTORE_DURATION;
    const delta = Math.max(0, elapsed) * speed / duration;
    return to >= from ? Math.min(to, from + delta) : Math.max(to, from - delta);
  }
  const LOOP = 3 + DURATION + RESTORE_DURATION;
  function previewSpec(slow = false) {
    const speed = slow ? .25 : 1, duration = DURATION / speed, restoreDuration = RESTORE_DURATION / speed;
    return { speed, duration, restoreDuration, minimizeAt: .75, restoreAt: 1.55 + duration, loop: 3 + duration + restoreDuration };
  }
  function timeline(time, slow = false) {
    const spec = previewSpec(slow);
    const t = ((time % spec.loop) + spec.loop) % spec.loop;
    const suffix = slow ? ' · 0.25× STUDY' : ' · NORMAL SPEED';
    if (t < spec.minimizeAt) return { progress: 0, direction: 'minimize', label: 'RECONSTRUCTION' + suffix };
    if (t < spec.minimizeAt + spec.duration) return { progress: advanceProgress(0, 1, t - spec.minimizeAt, spec.speed), direction: 'minimize', label: 'MINIMIZE' + suffix };
    if (t < spec.restoreAt) return { progress: 1, direction: 'restore', label: 'IN THE DOCK' + suffix };
    if (t < spec.restoreAt + spec.restoreDuration) return { progress: advanceProgress(1, 0, t - spec.restoreAt, spec.speed), direction: 'restore', label: 'RESTORE' + suffix };
    return { progress: 0, direction: 'minimize', label: 'RECONSTRUCTION' + suffix };
  }
  return { W, H, WINDOW, TARGET, DURATION, RESTORE_DURATION, DOCK_CLIP, LOOP, Calibrated, clamp, mix, smooth, sine, phases, row, outline, initial, action, tick, advanceProgress, previewSpec, timeline };
});
