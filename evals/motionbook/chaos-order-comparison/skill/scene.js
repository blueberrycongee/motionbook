// IN PHASE / 同相 — a study of synchrony.
// 1,740 oscillators start out of phase and out of place; order nucleates at three
// seeds, spreads as a crystallisation front, merges into one rhythm and finally
// collapses into a single line. Everything is a pure function of time t:
// a fixed-step simulation is precomputed once (seeded, no Math.random), then
// renderFrame(t) only reads and draws.
(function (root) {
  'use strict';

  const W = 1280, H = 720, CX = W / 2, CY = H / 2;
  const DURATION = 21, FPS = 30;

  // Palette: printed paper, carbon ink, one vermilion accent.
  const PAPER = [236, 231, 221], INK = [24, 22, 20], VERM = [226, 72, 43];

  // Timeline (seconds).
  const T = {
    seeds: [3.4, 4.6, 5.7],
    mergeA: 9.8, mergeB: 12.6,     // domains release their own rhythm
    windup: 12.6, beat: 14.6,      // unison spin-up, then the snap
    collapse: 15.4,                // columns slide into one line
    single: 16.9, shrinkB: 17.7,
    turnA: 17.55,
    textA: 18.15,
  };

  // ---------- deterministic helpers ----------
  function mulberry32(a) {
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
  const lerp = (a, b, u) => a + (b - a) * u;
  const smooth = (a, b, x) => { const u = clamp((x - a) / (b - a)); return u * u * (3 - 2 * u); };
  const easeOutCubic = u => 1 - Math.pow(1 - clamp(u), 3);
  const easeInOutCubic = u => { u = clamp(u); return u < .5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2; };
  const easeInOutQuart = u => { u = clamp(u); return u < .5 ? 8 * u * u * u * u : 1 - Math.pow(-2 * u + 2, 4) / 2; };
  const easeOutExpo = u => (u >= 1 ? 1 : 1 - Math.pow(2, -10 * clamp(u)));
  // Underdamped spring step response 0 -> 1 (zero initial velocity).
  function springStep(tau, omega, lambda) {
    if (tau <= 0) return 0;
    return 1 - Math.exp(-lambda * tau) * (Math.cos(omega * tau) + (lambda / omega) * Math.sin(omega * tau));
  }
  const mixRGB = (a, b, u) => [lerp(a[0], b[0], u), lerp(a[1], b[1], u), lerp(a[2], b[2], u)];
  const css = (c, a = 1) => `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${a})`;

  // Smooth value noise (seeded) for rough crystallisation fronts.
  const rngN = mulberry32(911);
  const LAT = new Float32Array(64 * 64).map(() => rngN() * 2 - 1);
  function vnoise(x, y) {
    const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi;
    const g = (i, j) => LAT[((j & 63) * 64) + (i & 63)];
    const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
    return lerp(lerp(g(xi, yi), g(xi + 1, yi), u), lerp(g(xi, yi + 1), g(xi + 1, yi + 1), u), v);
  }
  const fbm = (x, y) => vnoise(x, y) * .65 + vnoise(x * 2.1 + 17, y * 2.1 + 5) * .35;

  // Stream function for the chaotic drift; velocity is its curl.
  function psi(x, y, t) {
    return Math.sin(x * .0062 + t * .42) * Math.cos(y * .0074 - t * .31)
      + .55 * Math.sin(x * .0127 - y * .0108 + t * .73 + 1.3)
      + .3 * Math.cos(x * .021 + y * .0173 - t * .95 + 4.1);
  }

  // ---------- the field ----------
  const GAP = 20, COLS = 58, ROWS = 30;
  const X0 = (W - (COLS - 1) * GAP) / 2, Y0 = (H - (ROWS - 1) * GAP) / 2;
  const N = COLS * ROWS;
  const LOCK_LEN = 14;

  const SEEDS = [
    { x: W * .30, y: H * .40, t: T.seeds[0], psi: 0.0 },
    { x: W * .73, y: H * .64, t: T.seeds[1], psi: 2.1 },
    { x: W * .80, y: H * .22, t: T.seeds[2], psi: 4.0 },
  ];
  const FRONT_A = 40, FRONT_P = 1.6, Q = 2 * Math.PI / 170;

  const rng = mulberry32(20261008);
  const gauss = () => { let u = 0; for (let k = 0; k < 4; k++) u += rng(); return (u - 2) * 1.73; };

  const P = [];
  for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
    const gx = X0 + c * GAP, gy = Y0 + r * GAP;
    const n = fbm(gx / 150, gy / 150) * 80;
    let best = Infinity, dom = 0, dist = 0;
    SEEDS.forEach((s, k) => {
      const d = Math.hypot(gx - s.x, gy - s.y);
      const tc = s.t + Math.pow(Math.max(0, d + n) / FRONT_A, 1 / FRONT_P);
      if (tc < best) { best = tc; dom = k; dist = d; }
    });
    const spd = .5 + 4.2 * Math.pow(rng(), 1.7);
    P.push({
      c, r, gx, gy, tcap: best, dom, dist,
      hx: clamp(gx + gauss() * 40, 56, W - 56), hy: clamp(gy + gauss() * 40, 70, H - 70),
      th0: rng() * Math.PI * 2,
      om: (rng() < .5 ? -1 : 1) * spd,
      wm: .3 + rng() * 1.4, pm: rng() * 6.28,
      jit: rng() * 6.28,
      lenFree: 5 + 22 * Math.pow(rng(), 1.4),
      aFree: .32 + .68 * rng(),
      lwFree: 1.1 + 1.5 * rng(),
    });
  }

  // Global phase: steady rotation, wind-up, then a spring snap to vertical.
  const OM0 = 1.6;
  const G1 = OM0 * T.windup, WIND = T.beat - T.windup;
  const BASE = G1 + OM0 * WIND;
  const TARGET = Math.PI / 2 + Math.PI * Math.ceil((BASE + 2 * Math.PI - Math.PI / 2) / Math.PI);
  const D = TARGET - BASE, VIN = OM0 + 3 * D / WIND;
  const SNAP_W = 22, SNAP_L = 7;
  function globalPhase(t) {
    if (t < T.windup) return OM0 * t;
    if (t < T.beat) { const tau = t - T.windup, u = tau / WIND; return G1 + OM0 * tau + D * u * u * u; }
    const tau = t - T.beat;
    return TARGET + (VIN / SNAP_W) * Math.exp(-SNAP_L * tau) * Math.sin(SNAP_W * tau);
  }
  const mergeAmt = t => easeInOutCubic((t - T.mergeA) / (T.mergeB - T.mergeA));
  function targetPhase(p, t) {
    const s = SEEDS[p.dom];
    return globalPhase(t) + (1 - mergeAmt(t)) * (s.psi - Q * p.dist);
  }
  const lockAmt = (p, t) => smooth(p.tcap, p.tcap + .45, t);

  // ---------- fixed-step simulation ----------
  const DT = 1 / 120, T0 = -1.5, T1 = DURATION + .2;
  const STEPS = Math.ceil((T1 - T0) / DT) + 1;
  const SX = new Float32Array(STEPS * N), SY = new Float32Array(STEPS * N), STH = new Float32Array(STEPS * N);

  function simulate() {
    const K = 14, k = Math.pow(2 * Math.PI * 1.6, 2), cdamp = 2 * .42 * Math.sqrt(k);
    const st = P.map(p => ({ fx: p.hx, fy: p.hy, x: p.hx, y: p.hy, vx: 0, vy: 0, th: p.th0 }));
    for (let s = 0; s < STEPS; s++) {
      const t = T0 + s * DT;
      for (let i = 0; i < N; i++) {
        const p = P[i], q = st[i];
        if (s > 0) {
          // Free drift: curl of psi, gently tethered to a scattered home.
          const e = 1.5;
          const vx = (psi(q.fx, q.fy + e, t) - psi(q.fx, q.fy - e, t)) / (2 * e);
          const vy = -(psi(q.fx + e, q.fy, t) - psi(q.fx - e, q.fy, t)) / (2 * e);
          q.fx += DT * (vx * 5200 + .35 * (p.hx - q.fx));
          q.fy += DT * (vy * 5200 + .35 * (p.hy - q.fy));
          // Soft walls keep the storm off the HUD without piling needles on an edge.
          const wall = (v, lo, hi) => (v < lo ? (lo - v) : v > hi ? (hi - v) : 0) * 6;
          q.fx += DT * wall(q.fx, 52, W - 52); q.fy += DT * wall(q.fy, 66, H - 66);
          // Captured needles spring (with overshoot) into their lattice slot.
          const cap = t >= p.tcap;
          const tx = cap ? p.gx : q.fx + 1.6 * Math.sin(t * 19 + p.jit);
          const ty = cap ? p.gy : q.fy + 1.6 * Math.cos(t * 23 + p.jit * 1.7);
          q.vx += DT * (k * (tx - q.x) - cdamp * q.vx); q.x += DT * q.vx;
          q.vy += DT * (k * (ty - q.y) - cdamp * q.vy); q.y += DT * q.vy;
          // Phase: own wandering frequency until captured, then entrained.
          const l = lockAmt(p, t);
          const w = p.om * (1 + .45 * Math.sin(t * p.wm + p.pm));
          let dth = (1 - l) * w;
          if (l > 0) {
            const h = 1e-3, phi = targetPhase(p, t);
            const dphi = (targetPhase(p, t + h) - targetPhase(p, t - h)) / (2 * h);
            dth += l * dphi + K * l * .5 * Math.sin(2 * (phi - q.th));
          }
          q.th += DT * dth;
        }
        const o = s * N + i;
        SX[o] = q.x; SY[o] = q.y; STH[o] = q.th;
      }
    }
  }

  function sample(i, t) {
    const f = clamp((t - T0) / DT, 0, STEPS - 1.001), s = Math.floor(f), u = f - s;
    const a = s * N + i, b = a + N;
    return [lerp(SX[a], SX[b], u), lerp(SY[a], SY[b], u), lerp(STH[a], STH[b], u)];
  }

  // Kuramoto order parameter (nematic: lines are symmetric under pi).
  function orderParam(t) {
    let re = 0, im = 0;
    for (let i = 0; i < N; i++) { const th = sample(i, t)[2]; re += Math.cos(2 * th); im += Math.sin(2 * th); }
    return Math.hypot(re, im) / N;
  }

  // ---------- rendering ----------
  let ctx, grain;
  function makeGrain() {
    const c = document.createElement('canvas'); c.width = W; c.height = H;
    const g = c.getContext('2d'), img = g.createImageData(W, H), r = mulberry32(77);
    for (let i = 0; i < W * H; i++) {
      // paper fibre: fine noise with occasional horizontal streak
      const v = r() * 255;
      img.data[i * 4] = img.data[i * 4 + 1] = img.data[i * 4 + 2] = v;
      img.data[i * 4 + 3] = 20;
    }
    g.putImageData(img, 0, 0);
    return c;
  }

  const SHUTTER = 1 / 60; // 180-degree shutter at 30 fps

  function drawNeedles(t, fg, bg, zoom) {
    ctx.save();
    ctx.translate(CX, CY); ctx.scale(zoom, zoom); ctx.translate(-CX, -CY);
    ctx.lineCap = 'round';
    for (let i = 0; i < N; i++) {
      const p = P[i], l = lockAmt(p, t);
      const a = sample(i, t), b = sample(i, t - SHUTTER);
      const dth = Math.abs(a[2] - b[2]), dp = Math.hypot(a[0] - b[0], a[1] - b[1]);
      const n = Math.max(1, Math.min(10, Math.ceil(dth / .035 + dp / 3)));
      const len = lerp(p.lenFree, LOCK_LEN, l), half = len / 2;
      const flash = t >= p.tcap ? Math.exp(-(t - p.tcap) / .38) : 0;
      const col = mixRGB(fg, VERM, flash * .95);
      // The plate's margin is kept quiet: needles dissolve before they reach the HUD.
      const sx = CX + (a[0] - CX) * zoom, sy = CY + (a[1] - CY) * zoom;
      const edge = smooth(30, 64, Math.min(sx, W - sx)) * smooth(44, 66, Math.min(sy, H - sy));
      if (edge <= 0) continue;
      const alpha = lerp(p.aFree, 1, l) * Math.min(1, 1.7 / n) * edge;
      ctx.lineWidth = lerp(p.lwFree, 2, l);
      ctx.strokeStyle = css(col, alpha);
      ctx.beginPath();
      for (let j = 0; j < n; j++) {
        const u = n === 1 ? 0 : j / (n - 1);
        const x = lerp(a[0], b[0], u), y = lerp(a[1], b[1], u), th = lerp(a[2], b[2], u);
        const dx = Math.cos(th) * half, dy = Math.sin(th) * half;
        ctx.moveTo(x - dx, y - dy); ctx.lineTo(x + dx, y + dy);
      }
      ctx.stroke();
    }
    // Nucleation marks: a vermilion point and a single expanding ring.
    SEEDS.forEach(s => {
      const tau = t - s.t;
      if (tau < 0 || tau > 1.6) return;
      const e = easeOutCubic(tau / 1.6), fade = 1 - smooth(.5, 1.6, tau);
      ctx.strokeStyle = css(VERM, .85 * fade); ctx.lineWidth = 1.25;
      ctx.beginPath(); ctx.arc(s.x, s.y, 6 + 70 * e, 0, Math.PI * 2); ctx.stroke();
      ctx.fillStyle = css(VERM, fade);
      ctx.beginPath(); ctx.arc(s.x, s.y, 3.2 * (1 - smooth(1.0, 1.6, tau)) + .01, 0, Math.PI * 2); ctx.fill();
    });
    ctx.restore();
  }

  // After the beat: columns slide into one line, which shrinks and turns.
  function drawCollapse(t, fg) {
    ctx.save();
    ctx.lineCap = 'round';
    ctx.strokeStyle = css(fg);
    if (t < T.single) {
      ctx.lineWidth = 2;
      for (let c = 0; c < COLS; c++) {
        const gx = X0 + c * GAP, off = Math.abs(gx - CX) / (CX - X0);
        const e = easeInOutCubic((t - T.collapse - .5 * off) / 1.0);
        const x = lerp(gx, CX, e), half = lerp(LOCK_LEN, GAP + 1, e) / 2;
        ctx.globalAlpha = lerp(1, .9, e);
        ctx.beginPath();
        for (let r = 0; r < ROWS; r++) { const y = Y0 + r * GAP; ctx.moveTo(x, y - half); ctx.lineTo(x, y + half); }
        ctx.stroke();
      }
    } else {
      const full = (ROWS - 1) * GAP + GAP + 1;
      const h = lerp(full, 260, easeInOutQuart((t - T.single) / (T.shrinkB - T.single)));
      const turn = springStep(t - T.turnA, 10, 6);
      const rot = (Math.PI / 2) * turn;
      const cy = lerp(CY, 322, easeInOutCubic((t - T.turnA) / .9));
      ctx.lineWidth = lerp(2, 2.6, smooth(T.single, T.shrinkB, t));
      ctx.translate(CX, cy); ctx.rotate(rot);
      ctx.beginPath(); ctx.moveTo(0, -h / 2); ctx.lineTo(0, h / 2); ctx.stroke();
    }
    ctx.restore();
  }

  const STAGES = [
    [0, '01', 'NOISE'], [T.seeds[0], '02', 'NUCLEATION'], [T.mergeA, '03', 'ENTRAINMENT'],
    [T.windup, '04', 'UNISON'], [T.beat, '05', 'ONE'],
  ];

  function hud(t, fg, r) {
    const fade = 1 - smooth(16.4, 17.1, t);
    if (fade <= 0) return;
    ctx.save();
    ctx.globalAlpha = fade;
    ctx.fillStyle = css(fg, .82);
    ctx.textBaseline = 'alphabetic';
    // top-left: title
    ctx.font = '600 11px Inter'; ctx.letterSpacing = '3px'; ctx.textAlign = 'left';
    ctx.fillText('IN PHASE', 36, 34);
    ctx.font = '400 11px "Noto Sans CJK SC"'; ctx.letterSpacing = '2px';
    ctx.fillStyle = css(fg, .5); ctx.fillText('同相', 122, 34);
    // top-right: population
    ctx.font = '400 11px "DejaVu Sans Mono"'; ctx.letterSpacing = '1px'; ctx.textAlign = 'right';
    ctx.fillStyle = css(fg, .5); ctx.fillText('N = 1 740 OSCILLATORS', W - 36, 34);
    // bottom-left: order parameter readout + meter
    ctx.textAlign = 'left'; ctx.fillStyle = css(fg, .5);
    ctx.fillText('r', 36, H - 26);
    ctx.fillStyle = css(fg, .9); ctx.fillText(r.toFixed(2), 52, H - 26);
    ctx.fillStyle = css(fg, .14); ctx.fillRect(100, H - 30, 120, 1.5);
    ctx.fillStyle = css(r > .995 ? VERM : fg, .9); ctx.fillRect(100, H - 30, 120 * r, 1.5);
    // bottom-right: stage label, cross-fading on change
    ctx.textAlign = 'right';
    STAGES.forEach((s, k) => {
      const next = STAGES[k + 1] ? STAGES[k + 1][0] : 1e9;
      const vin = easeOutCubic((t - s[0]) / .45), vout = smooth(next - .05, next + .2, t);
      const a = (s[0] === 0 ? 1 : vin) * (1 - vout);
      if (a <= 0) return;
      ctx.globalAlpha = fade * a;
      const dy = (1 - (s[0] === 0 ? 1 : vin)) * 8 - vout * 8;
      ctx.fillStyle = css(fg, .5); ctx.fillText(s[1] + ' /', W - 36 - ctx.measureText(s[2]).width - 8, H - 26 + dy);
      ctx.fillStyle = css(fg, .9); ctx.fillText(s[2], W - 36, H - 26 + dy);
    });
    // registration marks around the lattice
    ctx.globalAlpha = fade * .35; ctx.strokeStyle = css(fg); ctx.lineWidth = 1;
    const m = 16, L = 10, x1 = X0 - m, y1 = Y0 - m, x2 = W - X0 + m, y2 = H - Y0 + m;
    ctx.beginPath();
    [[x1, y1, 1, 1], [x2, y1, -1, 1], [x1, y2, 1, -1], [x2, y2, -1, -1]].forEach(([x, y, sx, sy]) => {
      ctx.moveTo(x, y + sy * L); ctx.lineTo(x, y); ctx.lineTo(x + sx * L, y);
    });
    ctx.stroke();
    ctx.restore();
  }

  function finalText(t, fg) {
    if (t < T.textA) return;
    ctx.save();
    ctx.textBaseline = 'alphabetic'; ctx.textAlign = 'left';
    const zh = '混乱，只是尚未同相的秩序。';
    ctx.font = '300 30px "Noto Serif CJK SC"'; ctx.letterSpacing = '4px';
    const widths = [...zh].map(ch => ctx.measureText(ch).width);
    const total = widths.reduce((a, b) => a + b, 0) - 4;
    let x = CX - total / 2;
    [...zh].forEach((ch, k) => {
      const u = easeOutCubic((t - T.textA - k * .05) / .7);
      if (u > 0) {
        ctx.globalAlpha = u; ctx.fillStyle = css(fg);
        ctx.fillText(ch, x, 394 + (1 - u) * 12);
      }
      x += widths[k];
    });
    const ue = easeOutCubic((t - T.textA - .75) / .8);
    if (ue > 0) {
      ctx.globalAlpha = ue * .6; ctx.font = '500 11px Inter'; ctx.letterSpacing = '4px'; ctx.textAlign = 'center';
      ctx.fillText('CHAOS IS ONLY ORDER, NOT YET IN PHASE', CX + 2, 432 + (1 - ue) * 6);
    }
    ctx.restore();
  }

  function scene(t, fg, bg, r) {
    ctx.fillStyle = css(bg); ctx.fillRect(0, 0, W, H);
    if (t < T.collapse) {
      const zoom = 1 + .06 * (1 - easeOutCubic(t / 9.5));
      drawNeedles(t, fg, bg, zoom);
    } else {
      drawCollapse(t, fg);
    }
    hud(t, fg, r);
    finalText(t, fg);
  }

  // material:false (GIF pass) drops grain and vignette: in a 40-colour palette they
  // only add bytes and posterised rings.
  const options = { material: true };
  function renderFrame(t, opts) {
    Object.assign(options, opts || {});
    const r = t < T.collapse ? orderParam(t) : 1;
    const wipe = t < T.beat ? 0 : easeOutExpo((t - T.beat) / .6) * 780;
    scene(t, INK, PAPER, r);
    if (wipe > 0) {
      // The beat inverts the plate: a pressure wave from the centre.
      ctx.save();
      ctx.beginPath(); ctx.arc(CX, CY, wipe, 0, Math.PI * 2); ctx.clip();
      scene(t, PAPER, [18, 17, 16], r);
      ctx.restore();
      if (wipe < 770) {
        ctx.strokeStyle = css(VERM, .9); ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(CX, CY, wipe, 0, Math.PI * 2); ctx.stroke();
      }
    }
    // Material: paper grain and a soft plate vignette.
    if (!options.material) return;
    ctx.save();
    ctx.globalCompositeOperation = 'soft-light'; ctx.globalAlpha = .9;
    ctx.drawImage(grain, 0, 0);
    ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
    const v = ctx.createRadialGradient(CX, CY, 260, CX, CY, 820);
    v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(20,14,8,.13)');
    ctx.fillStyle = v; ctx.fillRect(0, 0, W, H);
    ctx.restore();
  }

  function init(canvas) {
    ctx = canvas.getContext('2d');
    grain = makeGrain();
    simulate();
  }

  root.Scene = { init, renderFrame, W, H, DURATION, FPS, T, orderParam };
})(window);
