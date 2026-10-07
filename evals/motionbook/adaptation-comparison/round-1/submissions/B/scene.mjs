/** A self-contained, deterministic Save draft micro-interaction. */
const clamp = (x, lo = 0, hi = 1) => Math.max(lo, Math.min(hi, x));
const ease = x => { x = clamp(x); return x * x * (3 - 2 * x); };
const n = x => Number(x.toFixed(3));
const settle = t => t <= 0 ? 0 : 1 - Math.exp(-13.5 * t) * (Math.cos(15 * t) + (13.5 / 15) * Math.sin(15 * t));

export function stateAt(t = 0, scenario = 'normal', reducedMotion = false) {
  t = clamp(Number.isFinite(t) ? t : 0, 0, 6);
  const interrupted = scenario === 'interrupted';
  const events = interrupted
    ? [{ t: .5, state: 'saving', value: 1 }, { t: 1.4, state: 'canceled', value: -1 }, { t: 2.1, state: 'saving', value: 1 }, { t: 3.8, state: 'success', value: -1 }]
    : [{ t: .5, state: 'saving', value: 1 }, { t: 3, state: 'success', value: -1 }];
  let state = 'idle', last = 0, start = .5, q = 0;
  for (const e of events) {
    if (e.t > t) break;
    state = e.state; last = e.t;
    if (e.state === 'saving') start = e.t;
    q += e.value * settle(t - e.t);
  }
  const age = t - last;
  const end = interrupted ? (start === .5 ? 3 : 3.8) : 3;
  const progress = state === 'saving' ? clamp(.035 + .925 * Math.pow(clamp((t - start) / (end - start)), .8), 0, .96) : state === 'success' ? 1 : 0;
  if (reducedMotion) q = state === 'saving' ? 1 : 0;
  return { state, age, start, progress, q: clamp(q, -.065, 1.065), reducedMotion };
}

// A capsule opens into a second rounded lobe through an original soft neck.
function silhouette(x, y, w, h, q) {
  const r = h / 2, shoulder = x + w - r, c = shoulder + 77 * q, neck = 17 * q;
  return `M${n(x+r)} ${y} H${n(shoulder)} C${n(shoulder+16*q)} ${y} ${n(shoulder+23*q)} ${n(y+neck)} ${n(shoulder+38*q)} ${n(y+neck)} C${n(shoulder+52*q)} ${n(y+neck)} ${n(c-20*q)} ${y} ${n(c)} ${y} C${n(c+r*.5523)} ${y} ${n(c+r)} ${n(y+r*.4477)} ${n(c+r)} ${n(y+r)} C${n(c+r)} ${n(y+r*1.5523)} ${n(c+r*.5523)} ${y+h} ${n(c)} ${y+h} C${n(c-20*q)} ${y+h} ${n(shoulder+52*q)} ${n(y+h-neck)} ${n(shoulder+38*q)} ${n(y+h-neck)} C${n(shoulder+23*q)} ${n(y+h-neck)} ${n(shoulder+16*q)} ${y+h} ${n(shoulder)} ${y+h} H${n(x+r)} C${n(x+r*.4477)} ${y+h} ${n(x)} ${n(y+r*1.5523)} ${n(x)} ${n(y+r)} C${n(x)} ${n(y+r*.4477)} ${n(x+r*.4477)} ${y} ${n(x+r)} ${y} Z`;
}

export function renderFrame(t = 0, options = {}) {
  const { width = 800, height = 600, scenario = 'normal', reducedMotion = false } = options;
  const s = stateAt(t, scenario, reducedMotion);
  const { state, age, q } = s;
  const saving = state === 'saving', success = state === 'success', canceled = state === 'canceled';
  const x = 288 - 66 * q, y = 270, w = 224 + 56 * q, h = 72;
  const d = silhouette(x, y, w, h, q);
  const restInset = (success ? 14 : 22) * (1 - clamp(q));
  const iconX = x + 38 + restInset, textX = x + 68 + restInset, cancelX = x + w - 36 + 77 * q;
  const appear = reducedMotion ? 1 : ease(age / .20);
  const check = reducedMotion ? 1 : ease(age / .30);
  const activeAlpha = saving ? (reducedMotion ? 1 : ease(age / .10)) : 0;
  const label = saving ? 'Saving draft' : success ? 'Draft saved' : canceled ? 'Retry save' : 'Save draft';
  const helper = saving ? 'Keeping your latest words safe' : success ? 'All changes saved to your drafts' : canceled ? 'Save canceled. Your words are still here.' : 'Keep a copy of your latest changes';
  const ink = success ? '#176948' : '#1165b2';
  const circle = success ? '#24815d' : '#197ac7';
  const fillWidth = saving ? (reducedMotion ? 108 : 16 + s.progress * (w + 34)) : success ? w + 95 : canceled && !reducedMotion ? 120 * (1 - ease(age / .18)) : 0;
  const aria = `${label}. ${helper}${saving ? '. Cancel saving is available.' : ''}`;
  const docIcon = `<path d="M154 176v-14h9l4 4v10z M162 162v5h5 M157.5 170h6 M157.5 173h6" fill="none" stroke="#8c918c" stroke-width="1.25" stroke-linejoin="round"/>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${Math.max(1, Number(width) || 800)}" height="${Math.max(1, Number(height) || 600)}" viewBox="0 0 800 600" role="img" aria-labelledby="title description" data-state="${state}" data-scenario="${scenario === 'interrupted' ? 'interrupted' : 'normal'}" data-reduced-motion="${!!reducedMotion}">
<title id="title">${label}</title><desc id="description">${aria} Authored demonstration, not a network operation.</desc>
<defs>
  <linearGradient id="surface" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#ffffff"/><stop offset="1" stop-color="#f7f8f6"/></linearGradient>
  <linearGradient id="edge" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#ffffff"/><stop offset="1" stop-color="#d5d9d6"/></linearGradient>
  <linearGradient id="wash" x1="${n(x)}" y1="0" x2="${n(x+fillWidth)}" y2="0" gradientUnits="userSpaceOnUse"><stop stop-color="${success ? '#bce7cf' : '#91d7f5'}"/><stop offset=".60" stop-color="${success ? '#def1e5' : '#b4e4f8'}"/><stop offset="1" stop-color="${success ? '#ebf7ef' : '#d4effa'}" stop-opacity="${success ? .95 : .25}"/></linearGradient>
  <filter id="paperShadow" x="-20%" y="-25%" width="140%" height="160%"><feGaussianBlur stdDeviation="13"/></filter>
  <filter id="buttonShadow" x="-25%" y="-90%" width="150%" height="300%"><feGaussianBlur stdDeviation="6"/></filter>
  <filter id="softFront" x="-20%" y="-80%" width="150%" height="260%"><feGaussianBlur stdDeviation="11 7"/></filter>
  <clipPath id="buttonClip"><path d="${d}"/></clipPath>
</defs>
<rect width="800" height="600" fill="#eeefec"/>
<rect x="119" y="148" width="562" height="304" rx="22" fill="#707972" opacity=".065" filter="url(#paperShadow)"/>
<rect x="116.5" y="137.5" width="567" height="310" rx="23" fill="#fafbf9" stroke="#ffffff"/>
<path d="M140 447H660" stroke="#d4d8d2" opacity=".40"/>
<g font-family="Arial, Helvetica, sans-serif">
${docIcon}
<text x="179" y="174" fill="#626b64" font-size="11" font-weight="700" letter-spacing="1.25">UNTITLED DRAFT</text>
<text x="646" y="174" text-anchor="end" fill="#7d857e" font-size="12">214 words</text>
<path d="M154 196H646" stroke="#e9ece6"/>
<path d="${d}" fill="#527487" opacity=".13" transform="translate(0,7)" filter="url(#buttonShadow)"/>
<path d="${d}" fill="url(#surface)" stroke="url(#edge)" stroke-width="1.3"/>
<g clip-path="url(#buttonClip)">
${fillWidth > 0 ? `<rect x="${n(x-24)}" y="269" width="${n(fillWidth+24)}" height="74" fill="url(#wash)" opacity="${success ? .9 : .95}" filter="url(#softFront)"/>` : ''}
<path d="${d}" fill="none" stroke="#ffffff" stroke-width="2.5" transform="translate(0,1.5)" opacity=".82"/>
</g>
<circle cx="${n(iconX)}" cy="306" r="17" fill="${circle}"/>
${success ? `<path d="M${n(iconX-7)} 306L${n(iconX-1.5)} 311.5L${n(iconX+8)} 300.5" fill="none" stroke="#fff" stroke-width="2.7" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="22.4" stroke-dashoffset="${n(22.4*(1-check))}"/>` : canceled ? `<path d="M${n(iconX+7)} 304a7 7 0 1 0 -2 8 M${n(iconX+7)} 299v5h-5" fill="none" stroke="#fff" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"/>` : `<path d="M${n(iconX)} 298v12m-5-5 5 5 5-5 M${n(iconX-7)} 312v3h14v-3" fill="none" stroke="#fff" stroke-width="2.05" stroke-linecap="round" stroke-linejoin="round"/>`}
<text x="${n(textX)}" y="${n(313 + (state === 'idle' ? 0 : 2 * (1-appear)))}" fill="${ink}" opacity="${state === 'idle' ? 1 : n(.72+.28*appear)}" font-size="20" font-weight="600" letter-spacing="-.35">${label}</text>
${saving && !reducedMotion ? `<text x="${n(x+w-24)}" y="312" text-anchor="end" fill="#387798" font-size="12" font-weight="600" opacity="${n(activeAlpha * ease((q-.35)/.30))}">${Math.floor(s.progress*100)}%</text>` : ''}
<g opacity="${n(activeAlpha)}" aria-label="${saving ? 'Cancel saving' : 'Inactive decoration'}">
<path d="M${n(cancelX-6)} 300L${n(cancelX+6)} 312 M${n(cancelX+6)} 300L${n(cancelX-6)} 312" fill="none" stroke="#465455" stroke-width="2.8" stroke-linecap="round"/>
</g>
<text x="400" y="382" text-anchor="middle" fill="${canceled ? '#766858' : success ? '#53735f' : '#7c847e'}" font-size="13.5">${helper}</text>
${saving ? `<text x="${n(cancelX)}" y="362" text-anchor="middle" fill="#79817c" font-size="10.5" opacity="${n(activeAlpha)}">Cancel</text>` : ''}
</g>
</svg>`;
}
