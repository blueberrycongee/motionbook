/** Original parcel-tracking SVG study. All geometry is authored here.
 * Scripted events only; renderFrame does not claim interactive UI semantics.
 */
const clamp = (x, lo = 0, hi = 1) => Math.max(lo, Math.min(hi, x));
const lerp = (a, b, p) => a + (b - a) * p;
const smooth = x => { x = clamp(x); return x * x * (3 - 2 * x); };
const n = x => Number(x.toFixed(5));
const eventsFor = scenario => scenario === 'interrupted'
  ? [[0.5, 1], [0.85, 0], [1.4, 1], [3.5, 0]]
  : [[0.5, 1], [3.5, 0]];

// Exact critically damped integration preserves both position and velocity
// across every target change. Opening is generous; closing is more decisive.
function advance(position, velocity, target, dt) {
  const omega = target ? 9.8 : 15.5;
  const error = position - target;
  const b = velocity + omega * error;
  const decay = Math.exp(-omega * dt);
  return [target + (error + b * dt) * decay,
    (velocity - omega * b * dt) * decay];
}
export function sampleState(t = 0, options = {}) {
  t = clamp(Number.isFinite(t) ? t : 0, 0, 6);
  const events = eventsFor(options.scenario);
  let p = 0, v = 0, target = 0, previous = 0;
  for (const [at, next] of events) {
    if (at > t) break;
    [p, v] = advance(p, v, target, at - previous);
    previous = at;
    target = next;
  }
  [p, v] = advance(p, v, target, t - previous);
  if (options.reducedMotion) { p = target; v = 0; }
  return { p, v, target, t };
}

function parcelIcon(x, y, scale = 1, color = '#f0f0ed') {
  return `<g transform="translate(${n(x)} ${n(y)}) scale(${scale})" stroke="${color}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" fill="none"><path d="M-9-5 0-10 9-5 9 5 0 10-9 5Z M-9-5 0 0 9-5 M0 0V10 M-4.5-7.5 4.5-2.5V2"/></g>`;
}
function truckIcon(x, y, tilt) {
  return `<g transform="translate(${n(x)} ${n(y)}) rotate(${n(tilt)})"><circle r="19" fill="#22252b"/><g stroke="#eff1ed" stroke-width="1.7" stroke-linejoin="round" stroke-linecap="round"><path d="M-12-8H2V4H-12Z M2-4H7L12 1V4H2" fill="#22252b"/><path d="M5-4V0H11" fill="none"/><circle cx="-7" cy="5" r="2.6" fill="#22252b"/><circle cx="7" cy="5" r="2.6" fill="#22252b"/></g></g>`;
}

export function renderFrame(t = 0, options = {}) {
  const { p: raw, target } = sampleState(t, options);
  const p = clamp(raw);
  const reduced = !!options.reducedMotion;
  const width = Number.isFinite(options.width) && options.width > 0 ? options.width : 800;
  const height = Number.isFinite(options.height) && options.height > 0 ? options.height : 600;
  const w = lerp(288, 456, p), h = lerp(56, 322, p);
  const x = 400 - w / 2, y = 300 - h / 2;
  const radius = lerp(28, 27, p);
  const headerX = lerp(305, 229, p), headerY = lerp(305, 175, p);
  const iconX = lerp(280, 204, p), iconY = lerp(300, 169, p);
  const compact = 1 - smooth(p / 0.23);
  const reveal = (start, finish) => reduced ? target : smooth((p - start) / (finish - start));
  const metadata = reveal(0.28, 0.73);
  const locations = reveal(0.40, 0.83);
  const route = reveal(0.49, 0.91);
  const footer = reveal(0.62, 0.98);
  const close = reveal(0.48, 0.93);
  const routeProgress = reduced ? 0.61 : 0.61 * smooth((p - 0.59) / 0.40);
  const routeX = 306 + 187 * routeProgress;
  const routeY = 272 - 64 * routeProgress * (1 - routeProgress);
  const routeTilt = Math.atan((-64 + 128 * routeProgress) / 187) * 180 / Math.PI;
  const svgText = (x, y, value, size = 14, fill = '#eeefed', weight = 400, anchor = 'start', extra = '') => `<text x="${n(x)}" y="${n(y)}" font-size="${size}" fill="${fill}" font-weight="${weight}" text-anchor="${anchor}" ${extra}>${value}</text>`;
  let defs = '';
  let seq = 0;
  function layer(a, content, slide = 7) {
    const id = `soft-${seq++}`;
    const blur = reduced ? 0 : 3.2 * (1 - a);
    defs += `<filter id="${id}" x="-15%" y="-35%" width="130%" height="170%" color-interpolation-filters="sRGB"><feGaussianBlur stdDeviation="${n(blur)}"/></filter>`;
    return `<g opacity="${n(a)}" transform="translate(0 ${n(reduced ? 0 : (1-a)*slide)})" filter="url(#${id})">${content}</g>`;
  }
  let content = '';
  content += `<g opacity="${n(compact)}"><circle cx="369" cy="300" r="3" fill="#7ed49a"/>${svgText(381,305,'Arriving today',13,'#dcdfdb',500)}<path d="m522 296 4 4-4 4" stroke="#adb2af" stroke-width="1.7" fill="none" stroke-linecap="round" stroke-linejoin="round"/></g>`;
  content += layer(close, `<circle cx="595" cy="170" r="14" fill="#33363c"/><path d="m591 166 8 8m0-8-8 8" stroke="#b9bcbc" stroke-width="1.6" stroke-linecap="round"/>`, 0);
  const bodyScale = (w - 52) / 404;
  content += `<g transform="translate(400 ${n(y)}) scale(${n(bodyScale)}) translate(-400 -139)">`;
  content += layer(metadata,
    svgText(198,216,'STANDARD DELIVERY',10.5,'#969c9e',500,'start','letter-spacing="1.3"') +
    svgText(602,216,'1 PARCEL',10.5,'#969c9e',500,'end','letter-spacing="1.1"'));
  content += layer(locations,
    svgText(198,274,'DEPOT',25,'#f1f2ef',650,'start','letter-spacing="-0.8"') +
    svgText(602,274,'HOME',25,'#f1f2ef',650,'end','letter-spacing="-0.8"') +
    svgText(198,298,'West End Hub',12,'#a1a7a7') +
    svgText(602,298,'Oak Street',12,'#a1a7a7',400,'end'), 9);
  content += layer(route,
    `<path d="M306 272Q399.5 240 493 272" fill="none" stroke="#697075" stroke-width="1.8" stroke-linecap="round" stroke-dasharray="3 7"/>
    <path d="M306 272Q${n(306 + 93.5 * routeProgress)} ${n(272 - 32 * routeProgress)} ${n(routeX)} ${n(routeY)}" fill="none" stroke="#edf0eb" stroke-width="2" stroke-linecap="round"/>
    <circle cx="306" cy="272" r="3.5" fill="#edf0eb"/><circle cx="493" cy="272" r="3.5" fill="#22252b" stroke="#bcc3c0" stroke-width="1.7"/>
    ${truckIcon(routeX, routeY, routeTilt)}
    ${svgText(400,310,'Out for delivery',11,'#9ea5a5',400,'middle')}`, 4);
  content += layer(footer,
    `<path d="M198 332H602" stroke="#3a3e43" stroke-width="1"/>
    <circle cx="201" cy="356" r="3" fill="#7ed49a"/>` +
    svgText(212,360,'Arriving today',13,'#8adea2',500) +
    svgText(198,394,'2:30–3:15 PM',25,'#f2f3ef',600,'start','letter-spacing="-0.65"') +
    svgText(198,417,'Estimated delivery',12,'#a2aaa8') +
    svgText(602,389,'4 stops away',16,'#e5e9e3',500,'end') +
    svgText(602,416,'Updated 12:42 PM',11,'#a2aaa8',400,'end'), 10);
  content += '</g>';
  // The title and cube remain a single shared object across both layouts.
  content += parcelIcon(iconX, iconY, lerp(0.83,0.94,p));
  content += svgText(headerX,headerY,'P-204',lerp(14,16,p),'#f2f3f0',600,'start','letter-spacing="0.1"');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 800 600" role="img" aria-labelledby="title description">
    <title id="title">Parcel P-204 · Arriving today</title><desc id="description">${target ? 'Delivery detail card: West End Hub to Oak Street. Out for delivery, arriving today between 2:30 and 3:15 PM. Four stops away. Updated at 12:42 PM.' : 'Compact tracking capsule for parcel P-204. Arriving today.'} Scripted motion study.</desc>
    <defs>${defs}<clipPath id="surface-clip"><rect x="${n(x)}" y="${n(y)}" width="${n(w)}" height="${n(h)}" rx="${n(radius)}"/></clipPath>
    <filter id="shadow" x="-40%" y="-80%" width="180%" height="270%" color-interpolation-filters="sRGB"><feGaussianBlur stdDeviation="${n(lerp(6,15,p))}"/></filter>
    <linearGradient id="surface" x1="0" y1="0" x2="0.8" y2="1"><stop stop-color="#292d32"/><stop offset="1" stop-color="#202329"/></linearGradient></defs>
    <rect width="800" height="600" fill="#e9eae7"/>
    <rect x="${n(x+3)}" y="${n(y+lerp(5,13,p))}" width="${n(w-6)}" height="${n(h-3)}" rx="${n(radius)}" fill="#212820" opacity="${n(lerp(.10,.14,p))}" filter="url(#shadow)"/>
    <rect id="main-surface" data-progress="${n(p)}" x="${n(x)}" y="${n(y)}" width="${n(w)}" height="${n(h)}" rx="${n(radius)}" fill="url(#surface)" stroke="#ffffff" stroke-opacity="0.06"/>
    <g font-family="Arial, Helvetica, sans-serif" clip-path="url(#surface-clip)">${content}</g>
  </svg>`;
}
