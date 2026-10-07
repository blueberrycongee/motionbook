(function (root, factory) {
  if (typeof module === 'object') module.exports = factory();
  else root.ClockPlayback = factory();
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  function finite(value, name) {
    if (typeof value !== 'number' || !Number.isFinite(value)) throw new TypeError(name + ' must be finite');
    return value;
  }
  function createController(options = {}) {
    const duration = finite(options.duration === undefined ? 33.429333 : options.duration, 'duration');
    if (duration <= 0 || duration > 3600) throw new RangeError('duration must be in (0, 3600]');
    let time = 0, speed = 1, playing = false, hidden = false;
    let reduced = options.reducedMotion === true, last = null, loops = 0;
    const snapshot = () => Object.freeze({ time, speed, duration, playing, hidden, reducedMotion: reduced, active: playing && !hidden && !reduced, loops });
    function resetClock(now) { last = now === undefined ? null : finite(now, 'timestamp'); }
    function tick(now) {
      finite(now, 'timestamp');
      if (last !== null && now < last) { last = now; return snapshot(); }
      if (last !== null && playing && !hidden && !reduced) {
        // Ignore suspension gaps. Hidden pages are separately frozen by the adapter.
        const delta = Math.min((now - last) / 1000, 0.25) * speed;
        time += delta;
        if (time >= duration) { loops += Math.floor(time / duration); time %= duration; }
      }
      last = now;
      return snapshot();
    }
    return Object.freeze({
      snapshot, tick,
      play(now) { if (!reduced) playing = true; resetClock(now); return snapshot(); },
      pause(now) { playing = false; resetClock(now); return snapshot(); },
      replay(now) { time = 0; loops = 0; playing = !reduced; resetClock(now); return snapshot(); },
      seek(seconds, now) { finite(seconds, 'seek time'); time = Math.max(0, Math.min(duration, seconds)); resetClock(now); return snapshot(); },
      setSpeed(value, now) { finite(value, 'speed'); if (value < 0.25 || value > 2) throw new RangeError('speed must be in [0.25, 2]'); speed = value; resetClock(now); return snapshot(); },
      setHidden(value, now) { if (typeof value !== 'boolean') throw new TypeError('hidden must be boolean'); hidden = value; resetClock(now); return snapshot(); },
      setReducedMotion(value, now) { if (typeof value !== 'boolean') throw new TypeError('reducedMotion must be boolean'); reduced = value; if (reduced) playing = false; resetClock(now); return snapshot(); }
    });
  }
  return { createController };
});
