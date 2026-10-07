/** Original vector study. All animation is sampled, deterministic, and offline. */
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const mix = (a, b, q) => a + (b - a) * q;
const ease = x => { x = clamp(x); return x * x * (3 - 2 * x); };
const spring = age => age <= 0 ? 0 : 1 - Math.exp(-14 * age) * (Math.cos(19 * age) + 14 / 19 * Math.sin(19 * age));
const n = x => Number(x.toFixed(3));

export function stateAt(t = 0, scenario = 'normal', reducedMotion = false) {
  t = clamp(Number.isFinite(t) ? t : 0, 0, 6);
  const interrupted = scenario === 'interrupted';
  const end = interrupted ? 3.8 : 3;
  const events = interrupted ? [[.5, 1], [1.4, -1], [2.1, 1], [3.8, -1]] : [[.5, 1], [3, -1]];
  const state = t < .5 ? 'idle' : t >= end ? 'saved' : interrupted && t >= 1.4 && t < 2.1 ? 'cancelled' : 'saving';
  const retry = interrupted && t >= 2.1;
  const start = retry ? 2.1 : .5;
  const progress = state === 'saving' ? clamp((t - start) / (end - start), 0, .99) : state === 'saved' ? 1 : 0;
  const extension = reducedMotion ? Number(state === 'saving') : clamp(events.reduce((sum, [at, sign]) => sum + sign * spring(t - at), 0), -.055, 1.075);
  return { t, state, start, end, retry, progress, extension, reducedMotion };
}

// A capsule grows a soft side lobe. The curve is independently authored.
function silhouette(x, y, q) {
  const c = x + 210, cy = y + 32;
  const p = (a, b) => n(mix(a, b, Math.max(0, q)));
  const high = [
    `M${n(x + 32)} ${y}H${n(c)}`,
    `C${p(c + 8.485, c + 15)} ${y} ${p(c + 16.627, c + 22)} ${p(y + 3.373, y + 10)} ${p(c + 22.627, c + 31)} ${p(y + 9.373, y + 15)}`,
    `C${p(c + 28.627, c + 40)} ${p(y + 15.373, y + 20)} ${p(c + 32, c + 45)} ${p(y + 23.515, y)} ${p(c + 32, c + 64)} ${p(cy, y)}`,
    `C${p(c + 32, c + 81.673)} ${p(cy, y)} ${p(c + 32, c + 96)} ${p(cy, y + 14.327)} ${p(c + 32, c + 96)} ${cy}`,
    `C${p(c + 32, c + 96)} ${p(cy, y + 49.673)} ${p(c + 32, c + 81.673)} ${p(cy, y + 64)} ${p(c + 32, c + 64)} ${p(cy, y + 64)}`,
    `C${p(c + 32, c + 45)} ${p(y + 40.485, y + 64)} ${p(c + 28.627, c + 40)} ${p(y + 48.627, y + 44)} ${p(c + 22.627, c + 31)} ${p(y + 54.627, y + 49)}`,
    `C${p(c + 16.627, c + 22)} ${p(y + 60.627, y + 54)} ${p(c + 8.485, c + 15)} ${y + 64} ${n(c)} ${y + 64}`,
    `H${n(x + 32)}C${n(x + 14.327)} ${y + 64} ${n(x)} ${y + 49.673} ${n(x)} ${cy}C${n(x)} ${y + 14.327} ${n(x + 14.327)} ${y} ${n(x + 32)} ${y}Z`
  ];
  return high.join('');
}

export function renderFrame(t = 0, options = {}) {
  const { width = 800, height = 600, scenario = 'normal', reducedMotion = false } = options;
  const s = stateAt(t, scenario, reducedMotion);
  const { state, extension: q, progress } = s;
  const saving = state === 'saving', saved = state === 'saved', cancelled = state === 'cancelled';
  const x = 400 - (242 + 64 * q) / 2, y = 280, cy = 312;
  const d = silhouette(x, y, q);
  const iconX = x + 33, cancelX = x + 210 + 64 * Math.max(0, q);
  const ink = saved ? '#227660' : '#286a9f';
  const label = saved ? 'Draft saved' : saving ? 'Saving draft' : cancelled ? 'Retry save' : 'Save draft';
  const status = saved ? 'All changes are up to date.' : cancelled ? 'Save stopped. Your draft is still here.' : saving ? reducedMotion ? 'Saving your latest changes…' : `${s.retry ? 'Saving again' : 'Saving changes'} · ${Math.floor(progress * 100)}%` : 'A little progress, worth keeping.';
  const statusColor = cancelled ? '#856b48' : saved ? '#537c6c' : '#858884';
  const successAge = Math.max(0, s.t - s.end);
  const success = saved ? reducedMotion ? 1 : ease(successAge / .32) : 0;
  const cancelOpacity = saving ? reducedMotion ? 1 : ease((q - .25) / .6) : 0;
  const displayProgress = reducedMotion ? .38 : progress;
  const washEnd = x + 30 + displayProgress * 215;
  const check = reducedMotion ? 1 : ease(successAge / .22);
  const arrowLift = saving && !reducedMotion ? -1.5 * Math.sin((s.t - s.start) * Math.PI * 2) : 0;
  const statusDot = saved ? '#4b947a' : cancelled ? '#ad9065' : saving ? '#6999b7' : '#b7bab3';
  const w = Number.isFinite(width) && width > 0 ? width : 800;
  const h = Number.isFinite(height) && height > 0 ? height : 600;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${n(w)}" height="${n(h)}" viewBox="0 0 800 600" role="img" aria-labelledby="sceneTitle sceneDesc" data-state="${state}" data-scenario="${scenario === 'interrupted' ? 'interrupted' : 'normal'}">
<title id="sceneTitle">${label}</title><desc id="sceneDesc">${status}${saving ? ' Cancel saving is available using the cross on the right.' : cancelled ? ' Retry save is available.' : ''} Authored demonstration of a writing app action.</desc>
<defs>
 <linearGradient id="paper" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#f7f7f4"/><stop offset="1" stop-color="#eeefeb"/></linearGradient>
 <linearGradient id="surface" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#ffffff"/><stop offset="1" stop-color="#f7f8f5"/></linearGradient>
 <linearGradient id="rim" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#ffffff"/><stop offset=".48" stop-color="#eceee8"/><stop offset="1" stop-color="#d8ddd4"/></linearGradient>
 <linearGradient id="wash" gradientUnits="userSpaceOnUse" x1="${n(washEnd - 72)}" x2="${n(washEnd)}" y1="0" y2="0"><stop stop-color="#a6d9ee" stop-opacity=".76"/><stop offset=".66" stop-color="#c3e5f1" stop-opacity=".56"/><stop offset="1" stop-color="#d9edf1" stop-opacity="0"/></linearGradient>
 <linearGradient id="successWash" x1="0" y1="0" x2="1" y2="0"><stop stop-color="#d5e9da"/><stop offset="1" stop-color="#edf5e9"/></linearGradient>
 <filter id="shadow" x="-30%" y="-90%" width="160%" height="290%"><feGaussianBlur stdDeviation="10"/></filter>
 <clipPath id="buttonClip"><path d="${d}"/></clipPath>
</defs>
<rect width="800" height="600" fill="url(#paper)"/>
<g font-family="Arial, Helvetica, sans-serif">
 <g fill="none" stroke="#acb4a8" stroke-width="1.35" stroke-linecap="round" stroke-linejoin="round" transform="translate(389 178)"><path d="M1 1H15L21 7V28H1Z"/><path d="M15 1V7H21M6 13H16M6 18H16M6 23H12"/></g>
 <text x="400" y="237" text-anchor="middle" fill="#565f54" font-size="17" font-weight="400" letter-spacing=".2">Field notes</text>
 <text x="400" y="258" text-anchor="middle" fill="#979d92" font-size="11" letter-spacing="1.4">PERSONAL DRAFT</text>
 <path d="${d}" transform="translate(0 10)" fill="#42523b" opacity=".095" filter="url(#shadow)"/>
 <path d="${d}" fill="url(#surface)" stroke="url(#rim)" stroke-width="1.3"/>
 <g clip-path="url(#buttonClip)">
  ${saving ? `<rect x="${n(x - 2)}" y="${y - 1}" width="${n(washEnd - x + 2)}" height="66" fill="url(#wash)"/>` : ''}
  ${saved ? `<path d="${d}" fill="url(#successWash)" opacity="${n(.65 + success * .35)}"/>` : ''}
  <path d="${d}" transform="translate(0 1)" fill="none" stroke="#fff" stroke-width="1.5" opacity=".72"/>
 </g>
 <circle cx="${n(iconX)}" cy="${cy}" r="15" fill="${ink}"/>
 ${saving ? `<circle cx="${n(iconX)}" cy="${cy}" r="18.4" fill="none" stroke="#70aed0" stroke-width="1.25" stroke-linecap="round" stroke-dasharray="${n(115.611 * displayProgress)} 115.611" transform="rotate(-90 ${n(iconX)} ${cy})"/>` : ''}
 ${saved ? `<path d="M${n(iconX - 6.1)} ${cy + .3}l4 4.1 8.2-8.3" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="18 18" stroke-dashoffset="${n(18 * (1 - check))}"/>` : cancelled ? `<path d="M${n(iconX + 5.5)} ${cy - 4}a7 7 0 1 0 1.1 7M${n(iconX + 5.5)} ${cy - 8}v5.5h-5.5" fill="none" stroke="#fff" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/>` : `<g transform="translate(0 ${n(arrowLift)})" fill="none" stroke="#fff" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M${n(iconX)} ${cy + 4}v-11m-4.5 4.5 4.5-4.5 4.5 4.5M${n(iconX - 7)} ${cy + 5}v3h14v-3"/></g>`}
 <text x="${n(x + 60)}" y="318.5" fill="${ink}" font-size="18" font-weight="600" letter-spacing="-.3">${label}</text>
 ${saving ? `<g opacity="${n(cancelOpacity)}" aria-label="Cancel saving"><circle cx="${n(cancelX)}" cy="${cy}" r="24" fill="#fafbf8" opacity=".36"/><path d="M${n(cancelX - 5.4)} ${cy - 5.4}l10.8 10.8m0-10.8-10.8 10.8" stroke="#69736a" stroke-width="2.6" stroke-linecap="round" fill="none"/></g>` : ''}
 <circle cx="400" cy="377" r="2.1" fill="${statusDot}"/>
 <text x="400" y="403" text-anchor="middle" font-size="12" fill="${statusColor}" letter-spacing=".05">${status}</text>
 <text x="400" y="514" text-anchor="middle" fill="#b0b5aa" font-size="9" letter-spacing="2.2">ROOM TO KEEP GOING</text>
</g>
</svg>`;
}
