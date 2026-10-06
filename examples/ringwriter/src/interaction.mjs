// Independent interaction controls. Callers supply time, so replay and exports agree.
export const LAST_FRAME = 485;
export const LOOP_SECONDS = 9.3;
export const SOURCE_SECONDS = 8.1;
export const FADE_END_SECONDS = 9.2;

export function frameAt(seconds, pts) {
  if (!Number.isFinite(seconds)) throw new TypeError('Finite time required');
  let lo = 0, hi = pts.length - 1;
  while (lo < hi) {
    const middle = Math.ceil((lo + hi) / 2);
    if (pts[middle] <= seconds) lo = middle;
    else hi = middle - 1;
  }
  return lo;
}

export function replayState(seconds) {
  if (!Number.isFinite(seconds)) throw new TypeError('Finite time required');
  const time = ((seconds % LOOP_SECONDS) + LOOP_SECONDS) % LOOP_SECONDS;
  const fade = Math.max(0, Math.min(1,
    (time - SOURCE_SECONDS) / (FADE_END_SECONDS - SOURCE_SECONDS)));
  return {
    mode: 'replay', time: Math.min(time, LAST_FRAME / 60),
    // The tiny tolerance accommodates six-decimal source PTS values.
    frame: Math.min(LAST_FRAME, Math.floor(time * 60 + 0.00003)),
    anchor: null, pointer: null,
    opacity: 1 - fade * fade * (3 - 2 * fade)
  };
}

export function createInteraction() {
  let mode = 'replay', epoch = 0, started = 0, anchor = null, pointer = null;
  function ensureTime(t) {
    if (!Number.isFinite(t)) throw new TypeError('Finite time required');
    return t;
  }
  return {
    get mode() { return mode; },
    get pointer() { return pointer; },
    move(x, y) {
      if (!Number.isFinite(x) || !Number.isFinite(y)) {
        throw new TypeError('Finite pointer coordinates required');
      }
      pointer = {
        x: Math.max(0, Math.min(1728, x)),
        y: Math.max(0, Math.min(1728, y))
      };
    },
    interact(t, pose) {
      ensureTime(t);
      if (mode !== 'replay') return false;
      anchor = pose; started = t; mode = 'idle';
      return true;
    },
    press(t, pose) {
      ensureTime(t);
      if (mode === 'held') return false;
      anchor = pose; started = t; mode = 'held';
      return true;
    },
    release(t, pose) {
      ensureTime(t);
      if (mode !== 'held') return false;
      anchor = pose; started = t; mode = 'released';
      return true;
    },
    cancel(t, pose) { return this.release(t, pose); },
    replay(t) { epoch = ensureTime(t); mode = 'replay'; anchor = null; },
    state(t) {
      ensureTime(t);
      if (mode === 'idle') return {
        mode, frame: anchor.frame, referenceFrame: anchor.frame,
        anchor, label: 'CLICK & HOLD', pointer, opacity: 1
      };
      if (mode === 'held') {
        const elapsed = Math.max(0, t - started);
        return {
          mode, frame: Math.min(361, 208 + Math.floor(elapsed * 60)),
          referenceFrame: 208, anchor,
          label: elapsed < 58 / 60 ? 'KEEP HOLDING' : 'RELEASE',
          pointer, opacity: 1
        };
      }
      if (mode === 'released') return {
        mode, frame: Math.min(LAST_FRAME, 362 + Math.floor(Math.max(0, t - started) * 60)),
        referenceFrame: 362, anchor, label: 'CLICK & HOLD', pointer, opacity: 1
      };
      return replayState(t - epoch);
    }
  };
}
