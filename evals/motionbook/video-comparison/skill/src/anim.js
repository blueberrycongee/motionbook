// Deterministic animation helpers: everything is a pure function of time t (seconds).
(function (g) {
  const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
  const lerp = (a, b, p) => a + (b - a) * p;
  const P = (t, t0, d) => clamp((t - t0) / d);

  // CSS-style cubic-bezier easing.
  function bez(x1, y1, x2, y2) {
    const cx = 3 * x1, bx = 3 * (x2 - x1) - cx, ax = 1 - cx - bx;
    const cy = 3 * y1, by = 3 * (y2 - y1) - cy, ay = 1 - cy - by;
    const X = s => ((ax * s + bx) * s + cx) * s, Y = s => ((ay * s + by) * s + cy) * s;
    const dX = s => (3 * ax * s + 2 * bx) * s + cx;
    return x => {
      if (x <= 0) return 0; if (x >= 1) return 1;
      let s = x;
      for (let i = 0; i < 6; i++) { const e = X(s) - x; const d = dX(s); if (Math.abs(e) < 1e-6 || Math.abs(d) < 1e-6) break; s -= e / d; }
      if (!(s >= 0 && s <= 1) || Math.abs(X(s) - x) > 1e-4) { let lo = 0, hi = 1; for (let i = 0; i < 32; i++) { s = (lo + hi) / 2; if (X(s) < x) lo = s; else hi = s; } }
      return Y(s);
    };
  }
  // Analytic damped spring, normalised so p in [0,1] spans the settle time.
  function spring(zeta) {
    const zw = 6.4, w = zw / zeta, wd = w * Math.sqrt(1 - zeta * zeta);
    return p => {
      if (p <= 0) return 0; if (p >= 1) return 1;
      return 1 - Math.exp(-zw * p) * (Math.cos(wd * p) + (zw / wd) * Math.sin(wd * p));
    };
  }
  const E = {
    out: bez(.16, 1, .3, 1), outSoft: bez(.22, .8, .3, 1), inOut: bez(.65, 0, .35, 1), in: bez(.6, 0, .9, .45),
    cam: bez(.55, 0, .12, 1), camSoft: bez(.42, 0, .22, 1), lin: x => clamp(x),
    sp: spring(.8), spBouncy: spring(.58), spFirm: spring(.9),
  };
  const hex = h => { h = h.replace('#', ''); return [0, 2, 4].map(i => parseInt(h.substr(i, 2), 16)); };
  const mix = (a, b, p) => { const A = hex(a), B = hex(b); return `rgb(${A.map((v, i) => Math.round(lerp(v, B[i], p))).join(',')})`; };
  const rgba = (h, a) => `rgba(${hex(h).join(',')},${a})`;
  const rnd = i => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };

  function el(parent, cls, css, html) {
    const e = document.createElement('div');
    if (cls) e.className = cls; if (css) e.style.cssText = css; if (html != null) e.innerHTML = html;
    if (parent) parent.appendChild(e); return e;
  }
  const tf = (x = 0, y = 0, s = 1, r = 0, sx = 1, sy = 1) =>
    `translate(${x.toFixed(3)}px,${y.toFixed(3)}px) rotate(${r.toFixed(3)}deg) scale(${(s * sx).toFixed(4)},${(s * sy).toFixed(4)})`;
  // Blur-in text reveal as used by the reference card stack: opacity, rise and blur resolve together.
  function reveal(e, p, dy = 14, blur = 8) {
    e.style.opacity = clamp(p * 1.15).toFixed(3);
    e.style.transform = `translateY(${((1 - p) * dy).toFixed(2)}px)`;
    e.style.filter = p >= 1 ? 'none' : `blur(${((1 - p) * blur).toFixed(2)}px)`;
  }
  g.A = { clamp, lerp, P, bez, spring, E, mix, rgba, hex, rnd, el, tf, reveal };
})(window);
