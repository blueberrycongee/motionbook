/**
 * Sound check — an original vector study.
 * Scripted gestures; renderFrame is pure and has no DOM or runtime dependency.
 */
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const mix = (a, b, p) => a + (b - a) * clamp(p, 0, 1);
const n = x => Number(x.toFixed(4));
const ease = p => 1 - (1 - clamp(p, 0, 1)) ** 3;
const ink = '#252c2c';
const blue = '#3264d9';

export function stateAt(time = 0, scenario = 'normal') {
  const t = clamp(Number.isFinite(time) ? time : 0, 0, 6);
  let value = 40, down = false, start = 0, end = 0, from = 40, cursor = 454;
  let cancel = false, released = false;
  if (scenario === 'interrupted') {
    if (t >= .5 && t < 1.8) {
      start = .5; end = 1.8; down = true;
      value = t <= 1.1 ? mix(40, 70, (t - .5) / 1.6) : mix(51.25, 30, (t - 1.1) / .7);
      cursor = 454 - (value - 40) * 4.7;
    } else if (t >= 1.8 && t < 2.6) {
      value = 40; cancel = true; end = 1.8; released = true; cursor = 501;
    } else if (t >= 2.6) {
      start = 2.6; end = 4; from = 40;
      value = mix(40, 55, (t - 2.6) / 1.4); down = t < 4; released = !down;
      cursor = 434 - (value - 40) * 4.7;
    }
  } else {
    if (t >= .5 && t < 3.4) {
      start = .5; end = 2.1;
      value = mix(40, 70, (t - .5) / 1.6); down = t < 2.1; released = !down;
      cursor = 454 - (value - 40) * 4.7;
    } else if (t >= 3.4) {
      start = 3.4; end = 4.5; from = 70;
      value = mix(70, 25, (t - 3.4) / 1.1); down = t < 4.5; released = !down;
      cursor = 292 - (value - 70) * 4.7;
    }
  }
  return {t, value, down, start, end, from, cursor, cancel, released};
}

function text(content, x, y, size, fill = ink, extras = '') {
  return `<text x="${n(x)}" y="${n(y)}" font-size="${size}" fill="${fill}" ${extras}>${content}</text>`;
}

export function renderFrame(t = 0, options = {}) {
  const width = Number.isFinite(options.width) && options.width > 0 ? options.width : 800;
  const height = Number.isFinite(options.height) && options.height > 0 ? options.height : 600;
  const scenario = options.scenario === 'interrupted' ? 'interrupted' : 'normal';
  const reduced = options.reducedMotion === true;
  const s = stateAt(t, scenario), v = s.value, pct = Math.round(v);
  const pressure = reduced ? 0 : s.down ? ease((s.t-s.start)/.16) : s.released ? 1-ease((s.t-s.end)/.22) : 0;
  const status = s.cancel ? 'Restored to 40%' : s.down ? 'Adjusting volume' : s.released ? 'Volume set' : 'Drag the ruler to tune';
  const mood = v < 35 ? 'Soft &amp; easy' : v < 60 ? 'Just right' : 'Turn it up';
  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${n(width)}" height="${n(height)}" viewBox="0 0 800 600" role="img" aria-labelledby="scene-title scene-description" data-value="${n(v)}" data-gesture="${s.cancel ? 'cancelled' : s.down ? 'dragging' : 'idle'}" data-reduced-motion="${reduced}">
  <title id="scene-title">Sound check</title>
  <desc id="scene-description">Tune the room to your mood. Room volume ${pct} percent, range 0 to 100. ${status}. Scripted ${scenario} gesture study.</desc>
  <defs>
    <linearGradient id="surface" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#fffffc"/><stop offset="1" stop-color="#fafaf6"/></linearGradient>
    <linearGradient id="well" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#f2f2ee"/><stop offset="1" stop-color="#f9f9f5"/></linearGradient>
    <linearGradient id="edge" x1="0" x2="1"><stop stop-color="white" stop-opacity="0"/><stop offset=".10" stop-color="white"/><stop offset=".90" stop-color="white"/><stop offset="1" stop-color="white" stop-opacity="0"/></linearGradient>
    <mask id="ruler-fade"><rect x="107" y="329" width="586" height="70" fill="url(#edge)"/></mask>
    <clipPath id="ruler-clip"><rect x="108" y="329" width="584" height="72" rx="10"/></clipPath>
    <filter id="card-shadow" x="-15%" y="-15%" width="130%" height="140%"><feGaussianBlur stdDeviation="13"/></filter>
  </defs>
  <rect width="800" height="600" fill="#eeeee8"/>
  <g font-family="Arial, Helvetica, sans-serif">
    ${text('A LITTLE ROOM TO LISTEN', 76, 75, 10, '#747c78', 'letter-spacing="2.1" font-weight="600"')}
    ${text('Sound check', 72, 133, 47, ink, 'font-weight="600" letter-spacing="-2"')}
    ${text('Tune the room to your mood.', 75, 168, 18, '#737a75')}
    <g transform="translate(670 117)" fill="none" stroke="#67736d" stroke-width="1.6" stroke-linecap="round">
      <circle r="27" stroke="#d0d4ca"/>
      <path d="M-11 -4H-6L1 -10V10L-6 4H-11Z"/>
      <path d="M6 -5Q11 0 6 5M10 -10Q20 0 10 10"/>
    </g>
    <rect x="80" y="228" width="640" height="282" rx="29" fill="#36422c" opacity=".07" filter="url(#card-shadow)"/>
    <rect x="72" y="210" width="656" height="300" rx="28" fill="url(#surface)" stroke="#dedfd6"/>
    ${text('ROOM VOLUME', 105, 248, 10, '#68736c', 'font-weight="600" letter-spacing="1.8"')}
    <circle cx="603" cy="244" r="3" fill="#7b9478"/>
    ${text('Living room', 615, 248, 11, '#737c76')}
    ${text(pct, 407, 310, 65, ink, 'text-anchor="end" font-weight="500" letter-spacing="-3" style="font-variant-numeric:tabular-nums"')}
    ${text('%', 416, 288, 21, '#8a928b')}
    <rect x="98" y="325" width="604" height="81" rx="15" fill="url(#well)" stroke="#e8e9e1"/>
    <path d="M115 326H685" stroke="#ffffff" stroke-width="1.5"/>
    <g clip-path="url(#ruler-clip)" ${reduced ? '' : 'mask="url(#ruler-fade)"'}>`;
  for (let i=0;i<=100;i++) {
    const x = reduced ? 130 + i*5.4 : 400 + (i-v)*9;
    const major = i%10===0, mid = i%5===0;
    const selected = i <= v + 1e-7;
    const lift = reduced ? 0 : pressure * 3 * Math.exp(-Math.pow((x-400)/50,2));
    const length = (major ? 28 : mid ? 21 : 12) + lift;
    const color = selected ? blue : major ? '#8e978e' : '#bdc2b7';
    if (x>=95 && x<=705) {
      svg += `<path d="M${n(x)} ${n(391-length)}V391" stroke="${color}" stroke-width="${major ? 2 : 1.4}" stroke-linecap="round"/>`;
      if (major || (!reduced && mid)) svg += text(i, x, 348, major ? 12 : 10, selected ? '#335895' : '#80897f', 'text-anchor="middle"');
    }
  }
  svg += `</g>`;
  if (!reduced) {
    svg += `<path d="M400 356V394" stroke="${blue}" stroke-width="2.4" stroke-linecap="round"/>
      <circle cx="400" cy="414" r="3.2" fill="${blue}"/>`;
    const showRing = s.down || (s.released && s.t-s.end<.23);
    if (showRing) {
      const release = s.down ? 0 : clamp((s.t-s.end)/.23,0,1);
      const radius = s.down ? mix(13,22,ease((s.t-s.start)/.16)) : mix(22,34,ease(release));
      const alpha = s.down ? .36 : .36*(1-release);
      svg += `<circle data-decoration="press-ring" cx="${n(s.cursor)}" cy="422" r="${n(radius)}" fill="none" stroke="${s.cancel ? '#999c92' : blue}" stroke-width="${n(1.8*(1-release))}" opacity="${n(alpha)}"/>`;
      if (s.down) svg += `<path data-decoration="drag-cursor" d="M-9 0H9M-9 0L-5 -4M-9 0L-5 4M9 0L5 -4M9 0L5 4" transform="translate(${n(s.cursor)} 422)" fill="none" stroke="${blue}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>`;
    }
  } else {
    svg += text('0–100', 400, 426, 11, '#80887f', 'text-anchor="middle"');
  }
  svg += `<path d="M105 448H695" stroke="#e5e7de"/>
    <circle cx="111" cy="478" r="3" fill="${s.cancel ? '#858d81' : blue}"/>
    ${text(status, 124, 482, 12, '#65705f')}
    ${text('0', 493, 482, 11, '#7a8378', 'text-anchor="end"')}
    <rect x="507" y="475" width="151" height="3" rx="1.5" fill="#e0e4d9"/>
    <rect x="507" y="475" width="${n(151*v/100)}" height="3" rx="1.5" fill="${blue}"/>
    ${text('100', 671, 482, 11, '#7a8378')}
    ${text(mood, 400, 547, 13, '#77816f', 'text-anchor="middle" letter-spacing=".2"')}
  </g></svg>`;
  return svg;
}
