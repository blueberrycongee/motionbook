// "Superposed" — from chaos to order.
// One tangled curve is the sum of 91 rotating circles. Peeling them apart,
// highest frequency first, sorts the chaos into a grid of clocks that
// finally align. Everything here is a pure function of time t.

const W = 1280, H = 720, DUR = 21;
const TAU = Math.PI * 2;

// ---------- helpers ----------
function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const lerp = (a, b, u) => a + (b - a) * u;
const smooth = (x) => { x = clamp(x); return x * x * (3 - 2 * x); };
const easeOutQuart = (x) => 1 - Math.pow(1 - clamp(x), 4);
const easeInOutCubic = (x) => { x = clamp(x); return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };
const easeOutBack = (x) => { x = clamp(x); const c1 = 1.5, c3 = c1 + 1; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); };

// ---------- palette ----------
const INK = [236, 232, 224];
const ACC = [255, 86, 48];
const rgba = (c, a) => `rgba(${c[0]},${c[1]},${c[2]},${a})`;

// ---------- timeline (seconds) ----------
const T_SEP0 = 5.6;    // first harmonic peels off
const T_SEP1 = 13.4;   // where the fundamental would peel (it stays)
const FADE = 0.35;     // a harmonic fades out of the curve
const FLY = 1.15;      // flight to its cell
const T_PURE = 12.3;   // chaos renderer hands over to the pure circle
const T_CON0 = 13.7, T_CON1 = 14.6; // fundamental contracts into center cell
const T_ALIGN = 17.6;  // every hand points up
const D_ALIGN = 1.3;   // deceleration into alignment
const V_ALIGN = 0.3;   // speed left at the moment of alignment, spent in a damped overshoot
const P_GRID = 30;     // grid hands: harmonic k makes k turns per P_GRID seconds
const T_TITLE = 18.05;

// ---------- grid ----------
const COLS = 13, ROWS = 7, CELL = 80, GX = 120, GY = 80, CR = 26;
const CX = W / 2, CY = H / 2;
const cells = [];
for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
  const x = GX + c * CELL + CELL / 2, y = GY + r * CELL + CELL / 2;
  const d = Math.hypot(x - CX, y - CY);
  let a = Math.atan2(x - CX, -(y - CY)); if (a < 0) a += TAU; // clockwise from top
  cells.push({ x, y, d, a });
}
cells.sort((p, q) => (Math.abs(p.d - q.d) > 0.5 ? p.d - q.d : p.a - q.a));
const N = cells.length; // 91 — harmonic k lives in cells[k-1]

// ---------- harmonics ----------
const rnd = mulberry32(20261008);
const A = new Float64Array(N + 1), PHI = new Float64Array(N + 1), WR = new Float64Array(N + 1), TK = new Float64Array(N + 1);
for (let k = 1; k <= N; k++) {
  A[k] = k === 1 ? 1.25 : Math.pow(k, -0.42) * (0.45 + 1.1 * rnd());
  PHI[k] = rnd() * TAU;
  WR[k] = (rnd() * 2 - 1) * (0.6 + 1.8 * rnd());
  TK[k] = T_SEP0 + (T_SEP1 - T_SEP0) * (1 - Math.log(k) / Math.log(N));
}
const weight = (k, t) => (k === 1 ? 1 : 1 - smooth((t - TK[k]) / FADE));

// Writhing clock: integrated so that slowing down never jumps the shape.
const TW_DT = 1 / 1200, TW_N = Math.ceil((DUR + 1) / TW_DT) + 2;
const twTable = new Float64Array(TW_N);
const twVel = (t) => 0.18 + 1.5 * (1 - smooth((t - 5.5) / 7)) + 1.4 * (1 - smooth(t / 1.6));
for (let i = 1; i < TW_N; i++) {
  const t0 = (i - 1) * TW_DT, t1 = i * TW_DT;
  twTable[i] = twTable[i - 1] + 0.5 * (twVel(t0) + twVel(t1)) * TW_DT;
}
function TW(t) {
  if (t <= 0) return t * twVel(0);
  const f = t / TW_DT, i = Math.floor(f);
  if (i >= TW_N - 1) return twTable[TW_N - 1];
  return lerp(twTable[i], twTable[i + 1], f - i);
}
const ROT = (t) => 0.16 * TW(t);

// Grid clock: runs at 1, decelerates, crosses 0 exactly at T_ALIGN and
// settles there with a small damped overshoot (like a clock hand ticking home).
function G(t) {
  const t0 = T_ALIGN - D_ALIGN, va = V_ALIGN;
  if (t < t0) return t - t0 - D_ALIGN * (va + (1 - va) / 3);
  if (t < T_ALIGN) {
    const r = 1 - (t - t0) / D_ALIGN;
    return -D_ALIGN * (va * r + ((1 - va) * r * r * r) / 3);
  }
  const x = t - T_ALIGN, w = TAU * 2.2;
  return (va * Math.exp(-x / 0.16) * Math.sin(w * x)) / w;
}
const gridAngle = (k, t) => -Math.PI / 2 + (TAU * k * G(t)) / P_GRID;
const chaosAngle = (k, t) => PHI[k] + WR[k] * TW(t) + ROT(t);

// Each harmonic's hand blends from its phase in the curve to its grid phase.
// The whole-turn offset is fixed per harmonic so the blend never spins wildly.
const blendEnd = (k) => (k === 1 ? T_CON1 : TK[k] + FLY);
const blendStart = (k) => (k === 1 ? T_CON0 : TK[k]);
const NOFF = new Float64Array(N + 1);
for (let k = 1; k <= N; k++) {
  const te = blendEnd(k);
  NOFF[k] = Math.round((gridAngle(k, te) - chaosAngle(k, te)) / TAU);
}
function handAngle(k, t) {
  const e = smooth((t - blendStart(k)) / (blendEnd(k) - blendStart(k)));
  if (e <= 0) return chaosAngle(k, t);
  if (e >= 1) return gridAngle(k, t) - TAU * NOFF[k];
  return lerp(chaosAngle(k, t), gridAngle(k, t) - TAU * NOFF[k], e);
}

// ---------- the curve ----------
const R1 = 210;           // radius of the final pure circle
const S = 4200;           // samples along the curve
const pts = new Float32Array((S + 1) * 2);
const cr = new Float64Array(N + 1), ci = new Float64Array(N + 1);
const US = new Float64Array(S + 1), UC = new Float64Array(S + 1);
for (let j = 0; j <= S; j++) { UC[j] = Math.cos((TAU * j) / S); US[j] = Math.sin((TAU * j) / S); }

function curveScale(t) {
  let e2 = 0;
  for (let k = 2; k <= N; k++) { const w = weight(k, t) * A[k]; e2 += w * w; }
  const E = A[1] + 1.42 * Math.sqrt(e2);
  const intro = t < 0.25 ? 0 : easeOutBack((t - 0.25) / 1.1);
  const contract = lerp(1, CR / R1, easeInOutCubic((t - T_CON0) / (T_CON1 - T_CON0)));
  return (R1 / E) * intro * contract;
}

function computeCurve(t, scale) {
  const tw = TW(t), rot = ROT(t);
  for (let k = 1; k <= N; k++) {
    const m = weight(k, t) * A[k] * scale, ang = PHI[k] + WR[k] * tw + rot;
    cr[k] = m * Math.cos(ang); ci[k] = m * Math.sin(ang);
  }
  for (let j = 0; j <= S; j++) {
    const ur = UC[j], ui = US[j];
    let zr = 0, zi = 0;
    for (let k = N; k >= 1; k--) {
      const nr = zr * ur - zi * ui + cr[k];
      zi = zr * ui + zi * ur + ci[k];
      zr = nr;
    }
    pts[2 * j] = CX + zr * ur - zi * ui;
    pts[2 * j + 1] = CY + zr * ui + zi * ur;
  }
}

function strokeCurve(c) {
  c.beginPath();
  c.moveTo(pts[0], pts[1]);
  for (let j = 1; j <= S; j++) c.lineTo(pts[2 * j], pts[2 * j + 1]);
  c.stroke();
}

// ---------- canvases ----------
const canvas = document.getElementById('c');
canvas.width = W; canvas.height = H;
const ctx = canvas.getContext('2d');
const layer = document.createElement('canvas'); layer.width = W; layer.height = H;
const lctx = layer.getContext('2d');

// static film grain tile, sampled at a per-frame offset
const grain = document.createElement('canvas'); grain.width = 1600; grain.height = 1000;
{
  const g = grain.getContext('2d'), img = g.createImageData(grain.width, grain.height), r = mulberry32(7);
  for (let i = 0; i < img.data.length; i += 4) {
    const v = r() * 255; img.data[i] = img.data[i + 1] = img.data[i + 2] = v; img.data[i + 3] = 255;
  }
  g.putImageData(img, 0, 0);
}

// ---------- drawing pieces ----------
function drawBackground(t) {
  const warm = 1 - smooth((t - 7) / 6);
  const g = ctx.createRadialGradient(CX, CY, 0, CX, CY, 760);
  const inner = [lerp(17, 30, warm), lerp(17, 15, warm), lerp(19, 13, warm)];
  g.addColorStop(0, `rgb(${inner.map(Math.round)})`);
  g.addColorStop(1, 'rgb(6,6,7)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
}

function drawMarks(t, gridA) {
  ctx.lineWidth = 1;
  for (let i = 0; i < N; i++) {
    const k = i + 1, cell = cells[i];
    const appear = smooth((t - (3.9 + (1 - i / N) * 1.3)) / 0.5);
    const land = k === 1 ? T_CON1 - 0.2 : TK[k] + FLY * 0.5;
    const a = appear * (1 - smooth((t - land) / 0.3)) * 0.32 * gridA;
    if (a <= 0.001) continue;
    ctx.strokeStyle = rgba(INK, a);
    ctx.beginPath();
    ctx.moveTo(cell.x - 4, cell.y); ctx.lineTo(cell.x + 4, cell.y);
    ctx.moveTo(cell.x, cell.y - 4); ctx.lineTo(cell.x, cell.y + 4);
    ctx.stroke();
  }
  // crop marks at the grid corners
  const a = smooth((t - 3.7) / 0.8) * 0.4 * gridA;
  if (a > 0.001) {
    ctx.strokeStyle = rgba(INK, a);
    const x0 = GX - 10, y0 = GY - 10, x1 = GX + COLS * CELL + 10, y1 = GY + ROWS * CELL + 10, L = 14;
    ctx.beginPath();
    for (const [x, y, sx, sy] of [[x0, y0, 1, 1], [x1, y0, -1, 1], [x0, y1, 1, -1], [x1, y1, -1, -1]]) {
      ctx.moveTo(x + sx * L, y); ctx.lineTo(x, y); ctx.lineTo(x, y + sy * L);
    }
    ctx.stroke();
  }
}

// a single clock: ring, motion trail, hand, dot
function drawClock(x, y, r, ang, vel, o) {
  const ringA = o.ringA, handA = o.handA, flash = o.flash || 0;
  ctx.lineWidth = o.ringW || 1;
  ctx.strokeStyle = rgba(INK, ringA);
  ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.stroke();
  // trail: arc behind the hand, length proportional to angular speed
  const span = clamp(Math.abs(vel) * 0.11, 0, 2.4) * o.trail;
  if (span > 0.02) {
    const dir = Math.sign(vel), segs = 6;
    ctx.lineWidth = o.trailW || 2;
    ctx.lineCap = 'butt';
    for (let s = 0; s < segs; s++) {
      const a0 = ang - dir * span * (s / segs), a1 = ang - dir * span * ((s + 1) / segs);
      ctx.strokeStyle = rgba(ACC, handA * 0.85 * (1 - s / segs));
      ctx.beginPath();
      if (dir > 0) ctx.arc(x, y, r, a1, a0); else ctx.arc(x, y, r, a0, a1);
      ctx.stroke();
    }
  }
  const col = [lerp(INK[0], ACC[0], flash), lerp(INK[1], ACC[1], flash), lerp(INK[2], ACC[2], flash)];
  const hx = x + Math.cos(ang) * r, hy = y + Math.sin(ang) * r;
  ctx.lineCap = 'round';
  ctx.lineWidth = o.handW || 1.5;
  ctx.strokeStyle = rgba(col, handA);
  const hl = o.handLen ?? 1;
  if (hl > 0.001) {
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + Math.cos(ang) * r * hl, y + Math.sin(ang) * r * hl); ctx.stroke();
  }
  ctx.fillStyle = rgba(col, Math.min(1, handA * 1.1));
  ctx.beginPath(); ctx.arc(hx, hy, o.dotR || 2.6, 0, TAU); ctx.fill();
}

const angVel = (k, t) => (handAngle(k, t) - handAngle(k, t - 1 / 120)) * 120;

function drawGrid(t, gridA, scale) {
  for (let k = N; k >= 1; k--) {
    const cell = cells[k - 1];
    if (k === 1 && t < T_CON1) continue; // still the big circle in the middle
    const t0 = k === 1 ? T_CON1 : TK[k];
    if (t < t0) continue;
    const p = k === 1 ? 1 : easeOutQuart((t - t0) / FLY);
    let x = cell.x, y = cell.y, r = CR;
    if (p < 1) {
      // start inside the tangle, along the harmonic's own phase direction
      const ang0 = chaosAngle(k, t0);
      const s0 = curveScale(t0);
      const sx = CX + Math.cos(ang0) * s0 * A[1] * 0.55, sy = CY + Math.sin(ang0) * s0 * A[1] * 0.55;
      const mx = (sx + cell.x) / 2, my = (sy + cell.y) / 2, dx = cell.x - sx, dy = cell.y - sy;
      const qx = mx - dy * 0.32, qy = my + dx * 0.32; // swirl: everything curls the same way
      const u = 1 - p;
      x = u * u * sx + 2 * u * p * qx + p * p * cell.x;
      y = u * u * sy + 2 * u * p * qy + p * p * cell.y;
      r = lerp(Math.max(3, A[k] * s0), CR, p);
    }
    const birth = smooth((t - t0) / 0.12);
    const landT = t0 + FLY * 0.45;
    const land = k === 1 ? Math.exp(-(t - T_CON1) / 0.4) * 0.5 : (t > landT ? Math.exp(-(t - landT) / 0.28) : 0);
    // alignment wave from the center outwards
    const wv = t > T_ALIGN - 0.1 ? Math.exp(-Math.pow(((t - T_ALIGN) * 950 - cell.d) / 70, 2)) : 0;
    const ang = handAngle(k, t);
    const vel = angVel(k, t);
    drawClock(x, y, r * (1 + 0.12 * land + 0.14 * wv), ang, vel, {
      ringA: (0.26 + 0.5 * land + 0.7 * wv) * birth * gridA,
      ringW: 1 + 0.8 * wv,
      handA: 0.92 * birth * gridA,
      trail: 1,
      flash: Math.max(wv, 0.6 * land),
    });
  }
}

const CHROMA = [[255, 52, 30], [40, 255, 110], [50, 90, 255]];

function drawChaos(t, scale, alpha, m) {
  if (alpha <= 0.001 || scale <= 0.01) return;
  const chaos = 1 - smooth((t - 5.5) / 6.5);
  lctx.setTransform(1, 0, 0, 1, 0, 0);
  lctx.clearRect(0, 0, W, H);
  lctx.setTransform(...m);
  lctx.globalCompositeOperation = 'lighter';
  lctx.lineJoin = 'round';
  lctx.lineWidth = 1.05;
  const trails = Math.round(5 + 9 * chaos);
  const span = 0.02 + 0.2 * chaos;     // long exposure: the storm smears into ribbons
  const cd = 0.006 + 0.035 * chaos;    // temporal chromatic split
  for (let ch = 0; ch < 3; ch++) {
    for (let i = 0; i < trails; i++) {
      const tt = t - ch * cd - (i / trails) * span;
      computeCurve(tt, curveScale(tt));
      const fall = 1 - i / trails;
      lctx.strokeStyle = rgba(CHROMA[ch], (0.13 + 0.25 * (1 - chaos)) * Math.pow(fall, 1.6));
      strokeCurve(lctx);
    }
  }
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.globalCompositeOperation = 'lighter';
  ctx.globalAlpha = alpha * 0.9;
  ctx.filter = 'blur(7px)';
  ctx.drawImage(layer, 0, 0);
  ctx.filter = 'none';
  ctx.globalAlpha = alpha;
  ctx.drawImage(layer, 0, 0);
  ctx.restore();
}

function drawPure(t, scale, alpha) {
  if (alpha <= 0.001 || t >= T_CON1) return;
  const q = easeInOutCubic((t - T_CON0) / (T_CON1 - T_CON0));
  const r = A[1] * scale;
  const ang = handAngle(1, t);
  ctx.save();
  ctx.shadowColor = rgba(INK, 0.55 * (1 - q));
  ctx.shadowBlur = 18 * (1 - q);
  drawClock(CX, CY, r, ang, 0, {
    ringA: lerp(0.95, 0.26, q) * alpha,
    ringW: lerp(1.8, 1, q),
    handA: 0.92 * alpha,
    handW: lerp(1.6, 1.5, q),
    handLen: smooth((t - 12.75) / 0.6),
    dotR: lerp(4, 2.6, q) * smooth((t - 12.6) / 0.3),
    trail: 0,
  });
  ctx.restore();
}

// fixed-advance text so counters never jitter
function monoText(str, x, y, adv, align) {
  const w = str.length * adv;
  let x0 = align === 'right' ? x - w : x;
  ctx.textAlign = 'center';
  for (const ch of str) { ctx.fillText(ch, x0 + adv / 2, y); x0 += adv; }
  ctx.textAlign = 'left';
}

function labelText(str, x, y, align) {
  ctx.textAlign = align || 'left';
  ctx.fillText(str, x, y);
  ctx.textAlign = 'left';
}

function drawHUD(t, a) {
  if (a <= 0.001) return;
  ctx.save();
  ctx.font = '500 11px Inter';
  ctx.letterSpacing = '3px';
  ctx.textBaseline = 'alphabetic';
  const phases = [['I', 'CHAOS', -1, T_SEP0], ['II', 'SEPARATION', T_SEP0, T_CON0], ['III', 'ORDER', T_CON0, 99]];
  for (const [n, name, t0, t1] of phases) {
    const pa = smooth((t - t0 - 0.3) / 0.35) * (1 - smooth((t - t1 + 0.05) / 0.3));
    if (pa <= 0.001) continue;
    const dy = 6 * (1 - smooth((t - t0 - 0.3) / 0.5));
    ctx.fillStyle = rgba(ACC, 0.95 * a * pa);
    ctx.beginPath(); ctx.arc(GX + 3, 46 + dy - 4, 3, 0, TAU); ctx.fill();
    ctx.fillStyle = rgba(INK, 0.62 * a * pa);
    labelText(`${n}  —  ${name}`, GX + 16, 46 + dy);
  }
  // superposition counter
  let active = 0;
  for (let k = 1; k <= N; k++) if (k === 1 ? t < T_CON1 - 0.3 : t < TK[k] + 0.08) active++;
  const right = GX + COLS * CELL;
  ctx.fillStyle = rgba(INK, 0.4 * a);
  const aligned = t >= T_ALIGN;
  labelText(aligned ? 'ALIGNED' : 'SUPERPOSED', right - 48, 46, 'right');
  ctx.font = '600 13px Inter';
  ctx.letterSpacing = '0px';
  ctx.fillStyle = rgba(aligned ? ACC : INK, 0.85 * a);
  monoText(aligned ? '91' : String(active).padStart(2, '0'), right, 46.5, 10, 'right');
  // formula and timecode
  ctx.font = 'italic 400 12px Inter';
  ctx.fillStyle = rgba(INK, 0.34 * a);
  const base = 'z(s) = Σ aₖ e';
  labelText(base, GX, H - 38);
  ctx.font = 'italic 400 9px Inter';
  labelText('i(ks + φₖ)', GX + ctx.measureText(base).width * 12 / 9 - 0.5, H - 44);
  ctx.font = '500 11px Inter';
  ctx.fillStyle = rgba(INK, 0.4 * a);
  const sec = Math.min(t, DUR);
  const tc = `${String(Math.floor(sec)).padStart(2, '0')}.${String(Math.floor((sec % 1) * 100)).padStart(2, '0')}`;
  monoText(tc, right, H - 38, 8, 'right');
  ctx.restore();
}

function drawTitle(t) {
  const a = smooth((t - T_TITLE) / 0.6);
  if (a <= 0.001) return;
  ctx.save();
  // quiet the field behind the type
  const g = ctx.createRadialGradient(CX, CY, 0, CX, CY, 420);
  g.addColorStop(0, `rgba(7,7,8,${0.82 * a})`);
  g.addColorStop(1, 'rgba(7,7,8,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);

  const title = '从混乱到秩序';
  ctx.font = '400 50px "Noto Sans CJK SC"';
  ctx.letterSpacing = '0px';
  ctx.textBaseline = 'middle';
  const chars = [...title];
  const widths = chars.map((c) => ctx.measureText(c).width);
  const gap = 24;
  const total = widths.reduce((s, w) => s + w, 0) + gap * (chars.length - 1);
  let x = CX - total / 2;
  chars.forEach((c, i) => {
    const ca = smooth((t - T_TITLE - 0.05 - i * 0.07) / 0.55);
    const dy = 14 * (1 - easeOutQuart((t - T_TITLE - 0.05 - i * 0.07) / 0.8));
    ctx.fillStyle = rgba(INK, 0.97 * ca);
    ctx.textAlign = 'left';
    ctx.fillText(c, x, CY - 16 + dy);
    x += widths[i] + gap;
  });

  // rule + subtitle
  const ra = easeOutQuart((t - T_TITLE - 0.45) / 0.9);
  ctx.strokeStyle = rgba(ACC, 0.9 * ra);
  ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(CX - 24 * ra, CY + 30); ctx.lineTo(CX + 24 * ra, CY + 30); ctx.stroke();

  const sa = smooth((t - T_TITLE - 0.7) / 0.6);
  ctx.font = '500 12px Inter';
  ctx.letterSpacing = '5px';
  ctx.fillStyle = rgba(INK, 0.6 * sa);
  ctx.textAlign = 'center';
  ctx.fillText('CHAOS IS ONLY ORDER, SUPERPOSED', CX + 2.5, CY + 62);
  ctx.restore();
}

function drawGrain(f) {
  const r = mulberry32(1000 + f);
  const ox = Math.floor(r() * (grain.width - W)), oy = Math.floor(r() * (grain.height - H));
  ctx.save();
  ctx.globalCompositeOperation = 'overlay';
  ctx.globalAlpha = 0.07;
  ctx.drawImage(grain, ox, oy, W, H, 0, 0, W, H);
  ctx.restore();
}

function drawVignette() {
  const g = ctx.createRadialGradient(CX, CY, 260, CX, CY, 820);
  g.addColorStop(0, 'rgba(0,0,0,0)');
  g.addColorStop(1, 'rgba(0,0,0,0.55)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
}

// ---------- frame ----------
function renderFrame(t, f) {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = 'source-over';
  drawBackground(t);

  // world layer: slight drift-in zoom and a nervous shake that calms down
  const shake = 3.2 * (1 - smooth((t - 4.5) / 4.5)) * smooth((t - 0.3) / 0.4);
  const sx = shake * (Math.sin(t * 13.1) + 0.6 * Math.sin(t * 31.7 + 1.3)) / 1.6;
  const sy = shake * (Math.sin(t * 11.3 + 2.1) + 0.6 * Math.sin(t * 27.9 + 0.4)) / 1.6;
  const zoom = 1.045 - 0.045 * easeInOutCubic(t / 15);
  const m = [zoom, 0, 0, zoom, CX * (1 - zoom) + sx, CY * (1 - zoom) + sy];
  ctx.setTransform(...m);

  const gridA = 1 - 0.8 * smooth((t - (T_TITLE - 0.1)) / 0.7);
  const scale = curveScale(t);
  drawMarks(t, gridA);
  drawGrid(t, gridA, scale);
  const pure = smooth((t - T_PURE) / 0.6);
  drawChaos(t, scale, 1 - pure, m);
  ctx.setTransform(...m);
  drawPure(t, scale, pure);

  ctx.setTransform(1, 0, 0, 1, 0, 0);
  // ignition flash
  const fl = t > 0.25 ? Math.exp(-(t - 0.25) / 0.18) * smooth((t - 0.2) / 0.05) : 0;
  if (fl > 0.002) {
    const g = ctx.createRadialGradient(CX, CY, 0, CX, CY, 520);
    g.addColorStop(0, `rgba(255,214,190,${0.5 * fl})`);
    g.addColorStop(1, 'rgba(255,120,80,0)');
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); ctx.restore();
  }
  drawHUD(t, smooth((t - 0.6) / 0.6) * (1 - smooth((t - T_TITLE + 0.2) / 0.5)));
  drawTitle(t);
  drawVignette();
  drawGrain(f);

  const fade = Math.min(smooth(t / 0.25), 1 - smooth((t - (DUR - 0.45)) / 0.45));
  if (fade < 1) {
    ctx.fillStyle = `rgba(0,0,0,${1 - fade})`;
    ctx.fillRect(0, 0, W, H);
  }
}

window.renderFrame = renderFrame;
window.DURATION = DUR;
window.ready = Promise.all([
  document.fonts.load('400 50px "Noto Sans CJK SC"', '从混乱到秩序'),
  document.fonts.load('500 11px Inter'),
  document.fonts.load('600 13px Inter'),
  document.fonts.load('italic 400 12px Inter'),
]);
