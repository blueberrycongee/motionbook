/** Numeric contracts observed in the public desktop bundle; independently implemented curves. */
export const MOTION = {
  menu: {
    enterMs: 150,
    exitMs: 100,
    fromScale: 0.95,
    enter: [0.19, 1, 0.22, 1],
    exit: [0.8, 0, 0.4, 1],
  },
  button: { durationMs: 150 },
  layout: { durationMs: 500, bounce: 0.1 },
  panel: { durationMs: 500, bounce: 0.1 },
  loading: { fadeMs: 150, delayMs: 100 },
};
export function cubicBezierAt(x, [x1, y1, x2, y2]) {
  if (x <= 0) return 0;
  if (x >= 1) return 1;
  const v = (t, a, b) =>
    3 * (1 - t) * (1 - t) * t * a + 3 * (1 - t) * t * t * b + t * t * t;
  let lo = 0,
    hi = 1,
    t = x;
  for (let i = 0; i < 24; i++) {
    const at = v(t, x1, x2);
    if (Math.abs(at - x) < 1e-8) break;
    if (at < x) lo = t;
    else hi = t;
    t = (lo + hi) / 2;
  }
  return v(t, y1, y2);
}
/** Closed-form zero-velocity duration spring derived from the inspected solver contract.
 * The source solves exp(-zeta * omega * duration) * zeta / sqrt(1-zeta²) = .001.
 * Solving that equation directly avoids copying the original Newton iteration implementation.
 */
export function layoutProgress(ms) {
  const duration = MOTION.layout.durationMs;
  if (ms <= 0) return 0;
  if (ms >= duration) return 1;
  const dampingRatio = 1 - MOTION.layout.bounce;
  const radial = Math.sqrt(1 - dampingRatio * dampingRatio);
  const omega =
    Math.log(dampingRatio / (radial * 0.001)) /
    (dampingRatio * (duration / 1000));
  const seconds = ms / 1000;
  const angle = omega * radial * seconds;
  return (
    1 -
    Math.exp(-dampingRatio * omega * seconds) *
      (Math.cos(angle) + (dampingRatio / radial) * Math.sin(angle))
  );
}
export function menuProgress(ms, opening = true) {
  const spec = MOTION.menu;
  const duration = opening ? spec.enterMs : spec.exitMs;
  return cubicBezierAt(
    Math.max(0, Math.min(1, ms / duration)),
    opening ? spec.enter : spec.exit,
  );
}
export function menuTransform(ms, opening = true) {
  const p = menuProgress(ms, opening);
  return {
    opacity: opening ? p : 1 - p,
    scale: opening ? 0.95 + 0.05 * p : 1 - 0.05 * p,
  };
}
export function motionCss() {
  const s = MOTION.menu;
  return `:root{--menu-enter-ms:${s.enterMs}ms;--menu-exit-ms:${s.exitMs}ms;--menu-enter-ease:cubic-bezier(${s.enter});--menu-exit-ease:cubic-bezier(${s.exit});--layout-duration:${MOTION.layout.durationMs}ms;--panel-duration:${MOTION.panel.durationMs}ms}`;
}
export function layoutKeyframes(dx, dy) {
  return Array.from({ length: 31 }, (_, i) => {
    const t = i / 30,
      p = layoutProgress(t * MOTION.layout.durationMs);
    return {
      offset: t,
      transform: `translate(${dx * (1 - p)}px,${dy * (1 - p)}px)`,
    };
  });
}

export function panelKeyframes(
  width,
  opening = true,
  from = opening ? 0 : width,
) {
  return Array.from({ length: 31 }, (_, i) => {
    const progress = Math.max(0, Math.min(1, layoutProgress((i / 30) * 500)));
    return {
      offset: i / 30,
      width: `${from + ((opening ? width : 0) - from) * progress}px`,
    };
  });
}
