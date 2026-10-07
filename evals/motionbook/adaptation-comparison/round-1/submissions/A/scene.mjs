/** Original parcel study. Time is a scripted presentation, not a tracking feed. */
const clamp = (n, a = 0, b = 1) => Math.max(a, Math.min(b, n));
const mix = (a, b, p) => a + (b - a) * p;
const smooth = (a, b, n) => { const p = clamp((n - a) / (b - a)); return p * p * (3 - 2 * p); };
const fmt = n => Number(n.toFixed(5));
const eventsFor = scenario => scenario === 'interrupted'
  ? [[0.5, 1], [0.85, 0], [1.4, 1], [3.5, 0]]
  : [[0.5, 1], [3.5, 0]];

// Exact critically damped evolution. Every reversal carries the previous
// position AND velocity forward, so a direction change never teleports a shape.
function advance(x, v, target, dt) {
  const rate = target ? 8.8 : 12.8;
  const a = x - target, b = v + rate * a, e = Math.exp(-rate * dt);
  return [target + (a + b * dt) * e, (v - rate * b * dt) * e];
}
export function stateAt(t = 0, options = {}) {
  const time = clamp(Number.isFinite(t) ? t : 0, 0, 6);
  const events = eventsFor(options.scenario);
  let x = 0, v = 0, target = 0, at = 0;
  for (const [when, to] of events) {
    if (when > time) break;
    [x, v] = advance(x, v, target, when - at);
    target = to; at = when;
  }
  [x, v] = advance(x, v, target, time - at);
  if (options.reducedMotion) { x = target; v = 0; }
  // After a subpixel settle, emit the exact resting geometry.
  if (Math.abs(x - target) < 0.000025 && Math.abs(v) < 0.00025) { x = target; v = 0; }
  const p = clamp(x);
  const w = mix(236, 456, p), h = mix(54, 294, p);
  return { p, v, target, x: 400 - w / 2, y: 300 - h / 2, w, h, r: mix(27, 25, p) };
}
const text = (x,y,value,size=14,fill='#f3f3f1',weight=400,anchor='start',spacing=0) =>
  `<text x="${fmt(x)}" y="${fmt(y)}" font-size="${fmt(size)}" fill="${fill}" font-weight="${weight}" text-anchor="${anchor}" letter-spacing="${spacing}">${value}</text>`;
const cube = (x,y,size=1,color='#f1f1ef') => `<g transform="translate(${fmt(x)} ${fmt(y)}) scale(${size})" fill="none" stroke="${color}" stroke-width="1.45" stroke-linejoin="round"><path d="M0-8.2 7.5-4.1v8.3L0 8.5-7.5 4.2v-8.3Z M-7.5-4.1 0 .1l7.5-4.2 M0 .1v8.4 M-3.75-6.15 3.75-1.95"/></g>`;

export function renderFrame(t = 0, options = {}) {
  const width = Number.isFinite(options.width) && options.width > 0 ? options.width : 800;
  const height = Number.isFinite(options.height) && options.height > 0 ? options.height : 600;
  const s = stateAt(t, options), p = s.p, rm = !!options.reducedMotion;
  const aMeta = smooth(.30,.83,p), aRoute = smooth(.51,.95,p), aFoot = smooth(.65,.99,p);
  const aClose = smooth(.50,.94,p), aCompact = 1-smooth(.02,.28,p);
  const headX = s.x + 25, headY = s.y + mix(27,34,p);
  const top = s.y + 66;
  // The opened content is laid out on the same moving surface. It never scales
  // letterforms or uses a second invisible screenshot-only composition.
  let filters = '';
  function layer(id,alpha,content,slide=7) {
    const blur = rm ? 0 : (1-alpha)*3.2;
    filters += `<filter id="${id}" x="-15%" y="-40%" width="130%" height="180%"><feGaussianBlur stdDeviation="${fmt(blur)}"/></filter>`;
    return `<g opacity="${fmt(alpha)}" filter="url(#${id})" transform="translate(0 ${fmt(rm ? 0 : (1-alpha)*slide)})">${content}</g>`;
  }
  const l = s.x + 24, r = s.x + s.w - 24;
  const meta = layer('meta',aMeta,
    text(l,top,'STANDARD DELIVERY',10.4,'#a2a5aa',500,'start',1.05) +
    text(r,top,'1 PARCEL · 1.2 KG',10.4,'#a2a5aa',500,'end',.65));
  const routeY = s.y + 130;
  const travel = rm ? 1 : smooth(.62,.999,p);
  const q = .60 * travel;
  const startX = 315, endX = 487, controlX = 401, controlY = routeY - 43;
  const bx = (1-q)*(1-q)*startX + 2*(1-q)*q*controlX + q*q*endX;
  const by = routeY - 86*q*(1-q);
  const cx = mix(startX,controlX,q), cy = mix(routeY,controlY,q);
  const route = layer('route',aRoute,
    text(l,routeY-8,'DEPOT',28,'#f3f3f1',650,'start',-.85) +
    text(r,routeY-8,'HOME',28,'#f3f3f1',650,'end',-.85) +
    text(l,routeY+15,'North hub',12.4,'#92969c') +
    text(r,routeY+15,'Oak Street',12.4,'#92969c',400,'end') +
    `<path d="M${startX} ${fmt(routeY)}Q${controlX} ${fmt(controlY)} ${endX} ${fmt(routeY)}" fill="none" stroke="#6a6e75" stroke-width="1.65" stroke-linecap="round" stroke-dasharray="2.5 6.5"/>` +
    `<path d="M${startX} ${fmt(routeY)}Q${fmt(cx)} ${fmt(cy)} ${fmt(bx)} ${fmt(by)}" fill="none" stroke="#e6e8e8" stroke-width="1.8" stroke-linecap="round"/>` +
    `<circle cx="${startX}" cy="${fmt(routeY)}" r="3" fill="#e6e8e8"/><circle cx="${endX}" cy="${fmt(routeY)}" r="3" fill="#242629" stroke="#b9bdc2" stroke-width="1.6"/>` +
    `<g opacity="${fmt(smooth(0,.4,travel))}"><circle cx="${fmt(bx)}" cy="${fmt(by)}" r="13" fill="#25282c"/>${cube(bx,by,1.03)}</g>` +
    text(400,routeY+28,'Out for delivery',11.5,'#91969d',400,'middle'));
  // A short masked odometer reveal, not an invented live change in tracking data.
  const roll = rm ? 3 : 3*smooth(.81,.998,p);
  const integer = Math.floor(roll), frac = roll-integer;
  const footerY = s.y + 201;
  const digitY = footerY+38;
  const numberX = r-80;
  const digits = `<g clip-path="url(#digitClip)">${text(numberX,digitY-frac*25,String(integer),21,'#f0f2f1',500,'end')}${text(numberX,digitY+(1-frac)*25,String(Math.min(3,integer+1)),21,'#f0f2f1',500,'end')}</g>`;
  const footer = layer('footer',aFoot,
    `<path d="M${fmt(l)} ${fmt(footerY-27)}H${fmt(r)}" stroke="#ffffff" stroke-opacity=".09"/>` +
    `<circle cx="${fmt(l+3)}" cy="${fmt(footerY-4)}" r="3.1" fill="#8ed5a6"/>` +
    text(l+13,footerY,'Arriving today',13,'#8ed5a6',500) +
    text(l,digitY,'14:20–15:00',25.5,'#f5f5f2',500,'start',-.65) +
    text(l,footerY+61,'Delivery window',11.5,'#969ba2') +
    digits + text(r,digitY,'stops away',14.2,'#e5e7e5',400,'end',-.2) +
    text(r,footerY+61,'Last scan 12:08',11.5,'#969ba2',400,'end'));
  const close = layer('close',aClose,`<circle cx="${fmt(r-3)}" cy="${fmt(headY-5)}" r="13" fill="#393c41"/><path d="M${fmt(r-6.5)} ${fmt(headY-8.5)}l7 7m0-7-7 7" stroke="#a8adb5" stroke-width="1.5" stroke-linecap="round"/>`,0);
  const compact = `<g opacity="${fmt(aCompact)}"><path d="M${fmt(headX+82)} ${fmt(headY-9)}v18" stroke="#5c6065" stroke-width="1"/><circle cx="${fmt(headX+97)}" cy="${fmt(headY)}" r="2.8" fill="#8ed5a6"/>${text(headX+106,headY+4.7,'Arriving today',13.1,'#d7ddd9',400)}</g>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 800 600" role="img" aria-label="Parcel P-204. Arriving today. Delivery window 14:20 to 15:00; 3 stops away. Last scan 12:08.">
<title>Parcel P-204 — arriving today</title><desc>Original parcel tracking capsule and delivery detail card. A scripted six-second motion study.</desc>
<defs>
<linearGradient id="surface" x1="0" y1="0" x2="0.7" y2="1"><stop stop-color="#292c30"/><stop offset="1" stop-color="#202225"/></linearGradient>
<filter id="shadow" x="-40%" y="-70%" width="180%" height="240%"><feGaussianBlur stdDeviation="12"/></filter>
<clipPath id="surfaceClip"><rect x="${fmt(s.x)}" y="${fmt(s.y)}" width="${fmt(s.w)}" height="${fmt(s.h)}" rx="${fmt(s.r)}"/></clipPath>
<clipPath id="digitClip"><rect x="${fmt(numberX-26)}" y="${fmt(digitY-22)}" width="30" height="25"/></clipPath>${filters}</defs>
<rect width="800" height="600" fill="#e8e7e4"/>
<rect x="${fmt(s.x+6)}" y="${fmt(s.y+13)}" width="${fmt(s.w-12)}" height="${fmt(s.h-6)}" rx="${fmt(s.r)}" fill="#111921" opacity="${fmt(mix(.12,.14,p))}" filter="url(#shadow)"/>
<rect id="main-surface" data-progress="${fmt(p)}" x="${fmt(s.x)}" y="${fmt(s.y)}" width="${fmt(s.w)}" height="${fmt(s.h)}" rx="${fmt(s.r)}" fill="url(#surface)" stroke="#ffffff" stroke-opacity=".06"/>
<g clip-path="url(#surfaceClip)" font-family="Arial, Helvetica, sans-serif">
${cube(headX+1,headY,.87,'#e7e9e6')}${text(headX+22,headY+5.1,'P-204',mix(14,16,p),'#f2f3f0',600,'start',.05)}${compact}${meta}${route}${footer}${close}
</g></svg>`;
}
