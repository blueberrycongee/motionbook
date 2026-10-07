/** Original parcel-tracking vector study. Deterministic, stateless frame renderer. */
const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const mix = (a, b, p) => a + (b - a) * p;
const smooth = v => { const u = clamp(v); return u * u * (3 - 2 * u); };
const fmt = v => Number(v.toFixed(5));

// A compact-support critically damped step response. The last blend lands at
// exactly one with zero velocity. Superposition preserves position and velocity
// at every event, including a reversal before the previous response has settled.
function response(dt) {
  if (dt <= 0) return 0;
  if (dt >= .94) return 1;
  const spring = 1 - (1 + 11.5 * dt) * Math.exp(-11.5 * dt);
  return mix(spring, 1, smooth((dt - .68) / .26));
}
export function motionState(t, options = {}) {
  const time = clamp(Number.isFinite(t) ? t : 0, 0, 6);
  const events = options.scenario === 'interrupted'
    ? [[.5, 1], [.85, 0], [1.4, 1], [3.5, 0]]
    : [[.5, 1], [3.5, 0]];
  let target = 0, p = 0, old = 0;
  for (const [at, next] of events) {
    if (time >= at) target = next;
    p += (next - old) * response(time - at);
    old = next;
  }
  if (options.reducedMotion) p = target;
  p = clamp(p);
  const w = mix(264, 424, p), h = mix(56, 336, p);
  return { time, p, target, x: 400 - w / 2, y: 300 - h / 2, w, h, r: mix(28, 27, p) };
}

export function renderFrame(t = 0, options = {}) {
  const { p, x, y, w, h, r, target } = motionState(t, options);
  const width = Number.isFinite(options.width) && options.width > 0 ? options.width : 800;
  const height = Number.isFinite(options.height) && options.height > 0 ? options.height : 600;
  const f = fmt;
  const stage = (start, end) => smooth((p - start) / (end - start));
  const meta = stage(.25, .73), route = stage(.4, .93), footer = stage(.62, .98);
  const label = stage(.12, .6), close = stage(.4, .85);
  const primary = '#f5f5f2', muted = '#9fa6a2', accent = '#bcdfbd';
  const text = (tx, ty, value, size = 13, color = primary, weight = 400, extra = '') =>
    `<text x="${f(tx)}" y="${f(ty)}" font-size="${f(size)}" fill="${color}" font-weight="${weight}" ${extra}>${value}</text>`;
  const parcel = (cx, cy, scale = 1, color = '#e7e9dd') => `<g transform="translate(${f(cx)} ${f(cy)}) scale(${scale})" fill="none" stroke="${color}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M-9-5 0-10 9-5V6L0 11-9 6Z"/><path d="m-9-5 9 5 9-5M0 0v11M-4.5-7.5l9 5V2"/></g>`;
  const ix = x + mix(27, 35, p), iy = y + mix(28, 36, p);
  const titleX = x + mix(49, 60, p), titleY = y + mix(33, 34, p);
  const statusX = mix(x + 126, x + 24, p), statusY = y + mix(33, 101, p);
  const statusSize = mix(13, 26, p);
  const detailOffset = options.reducedMotion ? 0 : (1 - meta) * 8;
  const routeOffset = options.reducedMotion ? 0 : (1 - route) * 9;
  const footerOffset = options.reducedMotion ? 0 : (1 - footer) * 7;
  const rp = stage(.43, 1);
  // Original local road: two rounded bends and a long raised middle segment.
  const road = 'M38 176 H103 Q117 176 117 162 V159 Q117 145 131 145 H283 Q297 145 297 159 V162 Q297 176 311 176 H386';
  const totalRoadLength = 387.96;
  const driven = mix(0, 226, rp);
  // Position along the same road; the van finishes on its middle straight.
  let vx, vy;
  if (driven <= 65) { vx = 38 + driven; vy = 176; }
  else if (driven <= 86.99) { const a = (driven - 65) / 21.99 * Math.PI / 2; vx = 103 + 14 * Math.sin(a); vy = 162 + 14 * Math.cos(a); }
  else if (driven <= 89.99) { vx = 117; vy = 162 - (driven - 86.99); }
  else if (driven <= 111.98) { const a = (driven - 89.99) / 21.99 * Math.PI / 2; vx = 131 - 14 * Math.cos(a); vy = 159 - 14 * Math.sin(a); }
  else { vx = 131 + driven - 111.98; vy = 145; }
  const card = `<rect data-surface="main" x="${f(x)}" y="${f(y)}" width="${f(w)}" height="${f(h)}" rx="${f(r)}" fill="url(#surface)" stroke="#ffffff" stroke-opacity=".08"/>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 800 600" role="img" aria-labelledby="scene-title scene-desc" data-progress="${f(p)}" data-target="${target}">
<title id="scene-title">Parcel P-204 · Arriving today</title>
<desc id="scene-desc">${p > .8 ? 'Delivery expected 2:00 to 4:00 PM. Out for delivery from East depot, three stops away. Leave at front door, Brookside, Apartment 04.' : 'Compact parcel tracking capsule. Open to see delivery details.'} Fictional parcel tracking motion study.</desc>
<defs>
  <linearGradient id="surface" x1="0" y1="0" x2=".5" y2="1"><stop stop-color="#272d2b"/><stop offset="1" stop-color="#1c2220"/></linearGradient>
  <filter id="shadow" x="-40%" y="-50%" width="180%" height="220%" color-interpolation-filters="sRGB"><feGaussianBlur stdDeviation="${f(mix(7, 19, p))}"/></filter>
  <clipPath id="card-clip"><rect x="${f(x)}" y="${f(y)}" width="${f(w)}" height="${f(h)}" rx="${f(r)}"/></clipPath>
</defs>
<rect width="800" height="600" fill="#eeefeb"/>
<rect x="${f(x + 4)}" y="${f(y + mix(6, 16, p))}" width="${f(w - 8)}" height="${f(h - 5)}" rx="${f(r)}" fill="#27372c" opacity="${f(mix(.13, .12, p))}" filter="url(#shadow)"/>
<g font-family="Arial, Helvetica, sans-serif" text-rendering="geometricPrecision">${card}
<g clip-path="url(#card-clip)">
  <circle cx="${f(ix)}" cy="${f(iy)}" r="${f(mix(0, 18, label))}" fill="#39433b" opacity="${f(label)}"/>
  ${parcel(ix, iy, mix(.75, .84, p))}
  ${text(titleX, titleY, 'P-204', 13, primary, 700, 'letter-spacing=".35"')}
  <g opacity="${f(stage(.67, .92))}">${text(titleX, y + 49, 'PARCEL TRACKING', 9, muted, 400, 'letter-spacing="1.3"')}</g>
  <path d="M${f(x + 108)} ${f(y + 21)}v14" stroke="#727c75" opacity="${f(1 - stage(0, .22))}"/>
  <path d="M${f(x + w - 33)} ${f(y + 26)}l4 4 4-4" fill="none" stroke="#b8c0b9" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" opacity="${f(1 - stage(0, .28))}"/>
  ${text(statusX, statusY, 'Arriving today', statusSize, primary, mix(400, 600, p), `letter-spacing="${f(mix(0, -.6, p))}"`)}
  <g opacity="${f(close)}"><circle cx="${f(x + w - 33)}" cy="${f(y + 33)}" r="13" fill="#3b413e"/><path d="M${f(x + w - 37)} ${f(y + 29)}l8 8m0-8-8 8" fill="none" stroke="#abb2ad" stroke-width="1.5" stroke-linecap="round"/></g>
  <g opacity="${f(meta)}" transform="translate(0 ${f(detailOffset)})">
    <circle cx="${f(x + 27)}" cy="${f(y + 121)}" r="3" fill="${accent}"/>
    ${text(x + 38, y + 125, 'Expected 2:00–4:00 PM', 13, '#c5cdc6')}
  </g>
  <g opacity="${f(route)}" transform="translate(${f(x)} ${f(y + routeOffset)}) scale(${f(w / 424)} 1)">
    <path d="${road}" fill="none" stroke="#667269" stroke-width="2" stroke-dasharray="2 7" stroke-linecap="round"/>
    <path d="${road}" fill="none" stroke="${accent}" stroke-width="2.2" stroke-dasharray="${f(driven)} ${totalRoadLength + 1}" stroke-linecap="round"/>
    <circle cx="38" cy="176" r="4" fill="${accent}"/>
    <circle cx="386" cy="176" r="4" fill="#202623" stroke="#9ca79e" stroke-width="1.7"/>
    <g transform="translate(${f(vx)} ${f(vy)})" opacity="${f(stage(.5, .82))}">
      <circle r="17" fill="#253129"/>
      <g fill="#bfdcbd" stroke="#bfdcbd" stroke-width="1.2" stroke-linejoin="round"><path d="M-10-7H2V5h-12Z"/><path d="M2-3h6l4 5v3H2Z"/><path d="M4-2h3l3 4H4Z" fill="#253129" stroke="none"/><circle cx="-6" cy="6" r="2.4" fill="#253129"/><circle cx="7" cy="6" r="2.4" fill="#253129"/></g>
    </g>
    ${text(24, 203, 'East depot', 11, muted)}
    ${text(400, 203, 'Your door', 11, muted, 400, 'text-anchor="end"')}
  </g>
  <g opacity="${f(footer)}" transform="translate(0 ${f(footerOffset)})">
    <path d="M${f(x + 24)} ${f(y + 223)}H${f(x + w - 24)}" stroke="#414a43" stroke-width=".8"/>
    ${text(x + 24, y + 250, 'Out for delivery', 14, primary, 600)}
    ${text(x + 24, y + 270, '11:24 AM · Left East depot', 11, muted)}
    <rect x="${f(x + w - 126)}" y="${f(y + 236)}" width="102" height="27" rx="13.5" fill="#364239"/>
    ${text(x + w - 75, y + 253, '3 stops away', 11, accent, 600, 'text-anchor="middle"')}
    <path d="M${f(x + 25)} ${f(y + 304)}v-8l6-5 6 5v8h-4v-5h-4v5z" fill="none" stroke="#a6b0a7" stroke-width="1.2" stroke-linejoin="round"/>
    ${text(x + 47, y + 304, 'Leave at front door', 11, '#c5cdc6')}
    ${text(x + w - 24, y + 304, 'Brookside · Apt 04', 11, muted, 400, 'text-anchor="end"')}
  </g>
</g></g></svg>`;
}
export default renderFrame;
