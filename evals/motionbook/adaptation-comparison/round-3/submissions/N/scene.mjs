/**
 * Original Fieldwork studio control. All events below are authored simulation.
 * renderFrame is stateless: each frame reduces the same event log from scratch.
 * No network request, real subscription, scheduling, or runtime DOM is present.
 */
const EVENTS = Object.freeze({
  normal: Object.freeze([{ at: 0.5, type: 'activate' }]),
  interrupted: Object.freeze([
    { at: 0.5, type: 'activate' },
    { at: 0.85, type: 'activate' }, // A duplicate is intentionally a no-op.
    { at: 1.4, type: 'undo' },
    { at: 2.1, type: 'activate' },
  ]),
});
const clamp = (v, lo = 0, hi = 1) => Math.max(lo, Math.min(hi, v));
const smooth = v => { const x = clamp(v); return x * x * (3 - 2 * x); };
const n = v => Number(v.toFixed(4));
const mix = (a, b, t) => a.map((x, i) => Math.round(x + (b[i] - x) * clamp(t)));
const rgb = a => `rgb(${a.join(',')})`;
const esc = s => s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' }[c]));

/** Business state is independent of motion preference and decorative phase. */
export function stateAt(t = 0, scenario = 'normal') {
  if (!Number.isFinite(t)) throw new TypeError('t must be finite');
  if (!Object.prototype.hasOwnProperty.call(EVENTS, scenario)) throw new RangeError('Unknown scenario');
  t = clamp(t, 0, 6);
  let followed = false, activatedAt = null, activationCount = 0, attempts = 0;
  for (const event of EVENTS[scenario]) {
    if (event.at > t) break;
    if (event.type === 'activate') {
      attempts += 1;
      if (!followed) {
        followed = true;
        activatedAt = event.at;
        activationCount += 1;
      }
    } else {
      followed = false;
      activatedAt = null; // Undo cancels all transient feedback immediately.
    }
  }
  return { t, followed, activatedAt, activationCount, attempts,
    age: activatedAt === null ? null : t - activatedAt };
}

const PARTICLES = Object.freeze([
  { x: 23, y: -2, dx: -9, dy: -17, delay: 0.10, life: 0.68, size: 4.5, kind: 'star', color: '#6970d5' },
  { x: 82, y: -3, dx: -2, dy: -15, delay: 0.16, life: 0.64, size: 2.8, kind: 'dot', color: '#cf9c5e' },
  { x: 184, y: -1, dx: 12, dy: -16, delay: 0.20, life: 0.70, size: 4.4, kind: 'star', color: '#6970d5' },
  { x: 213, y: 34, dx: 15, dy: 3, delay: 0.24, life: 0.63, size: 2.5, kind: 'dot', color: '#3c8b80' },
  { x: 148, y: 59, dx: 4, dy: 15, delay: 0.22, life: 0.69, size: 3.8, kind: 'star', color: '#3c8b80' },
  { x: 45, y: 58, dx: -5, dy: 13, delay: 0.14, life: 0.67, size: 2.6, kind: 'dot', color: '#6970d5' },
]);
function sparkle(x, y, size, color, alpha) {
  const k = size * 0.27;
  return `<path d="M ${n(x)} ${n(y-size)} L ${n(x+k)} ${n(y-k)} L ${n(x+size)} ${n(y)} L ${n(x+k)} ${n(y+k)} L ${n(x)} ${n(y+size)} L ${n(x-k)} ${n(y+k)} L ${n(x-size)} ${n(y)} L ${n(x-k)} ${n(y-k)} Z" fill="${color}" opacity="${n(alpha)}"/>`;
}
function particleMarkup(age) {
  return PARTICLES.map(p => {
    const u = (age - p.delay) / p.life;
    if (u <= 0 || u >= 1) return '';
    const travel = 1 - Math.pow(1 - u, 3);
    const alpha = smooth(u / 0.18) * (1 - smooth((u - 0.42) / 0.58));
    const size = p.size * (0.65 + 0.35 * smooth(u / 0.25));
    const x = 452 + p.x + p.dx * travel, y = 264 + p.y + p.dy * travel;
    return p.kind === 'star' ? sparkle(x, y, size, p.color, alpha) :
      `<circle cx="${n(x)}" cy="${n(y)}" r="${n(size)}" fill="${p.color}" opacity="${n(alpha)}"/>`;
  }).join('');
}

export function renderFrame(t = 0, options = {}) {
  const { width = 800, height = 600, scenario = 'normal', reducedMotion = false } = options;
  if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) throw new RangeError('Dimensions must be positive and finite');
  const s = stateAt(t, scenario);
  const label = s.followed ? 'Following' : 'Follow studio';
  const active = s.followed && !reducedMotion && s.age < 1.6;
  const age = s.age ?? 0;
  // A finite attention rim, separate from the accepted-activation reward track.
  const cue = !s.followed && s.t < 0.5 && !reducedMotion
    ? smooth((s.t - 0.08) / 0.12) * (1 - smooth((s.t - 0.39) / 0.11)) : 0;
  const wash = active ? Math.sin(Math.PI * clamp(age / 0.72)) * (1 - smooth((age - 0.38) / 0.34)) : 0;
  const fill = s.followed ? rgb(mix([37, 66, 61], [66, 77, 117], wash * 0.8)) : '#ffffff';
  const stroke = s.followed ? '#25423d' : '#cfd3ce';
  const ink = s.followed ? '#f7fbf8' : '#263e38';
  const bellAge = age - 0.22;
  const bellAngle = active && bellAge > 0 && bellAge < 1.15
    ? 17 * Math.sin(bellAge * 17) * Math.exp(-bellAge * 3.1) * (1 - smooth((bellAge - 0.83) / 0.32)) : 0;
  const ring = active ? smooth(age / 0.08) * (1 - smooth((age - 0.23) / 0.49)) : 0;
  const phase = s.followed ? (active ? 'confirmation' : 'settled') : 'unfollowed';
  const footer = s.followed ? 'Studio added to your feed' : 'New work. A little inspiration.';
  const particles = active ? particleMarkup(age) : '';
  const desc = `${label}. Fieldwork is a fictional creative workspace. ${reducedMotion ? 'Reduced motion. ' : ''}Authored local simulation; no subscription request is sent.`;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${n(width)}" height="${n(height)}" viewBox="0 0 800 600" role="img" aria-labelledby="title description" data-state="${s.followed ? 'followed' : 'unfollowed'}" data-phase="${phase}" data-activation-count="${s.activationCount}" data-attempt-count="${s.attempts}" data-bell-angle="${n(bellAngle)}" data-reduced-motion="${!!reducedMotion}">
  <title id="title">Fieldwork · ${label}</title>
  <desc id="description">${esc(desc)}</desc>
  <defs>
    <linearGradient id="attention" x1="0" y1="1" x2="1" y2="0">
      <stop offset="0" stop-color="#417b88"/><stop offset="0.5" stop-color="#6b74d6"/><stop offset="1" stop-color="#a075ba"/>
    </linearGradient>
    <linearGradient id="paper" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#fafbf7"/>
    </linearGradient>
  </defs>
  <rect width="800" height="600" fill="#f1f1e9"/>
  <g font-family="Arial, Helvetica, sans-serif">
    <text x="111" y="199" font-size="10" font-weight="700" letter-spacing="2" fill="#748075">THE CREATIVE CIRCLE</text>
    <rect x="103" y="225" width="594" height="172" rx="24" fill="#34413a" opacity="0.035"/>
    <rect x="104" y="219" width="592" height="172" rx="24" fill="url(#paper)" stroke="#dde1d7"/>
    <path d="M 128 340 H 672" stroke="#e5e7df"/>
    <g aria-hidden="true">
      <rect x="133" y="264" width="52" height="52" rx="15" fill="#e6ede4"/>
      <path d="M 145 280 L 160 274 L 173 280 L 158 286 Z" fill="#34594b"/>
      <path d="M 145 287 L 158 293 L 173 287 V 295 L 158 302 L 145 295 Z" fill="#78917c"/>
      <path d="M 158 286 V 293" stroke="#f5f7ee" stroke-width="2"/>
    </g>
    <text x="202" y="283" font-size="25" font-weight="700" letter-spacing="-0.7" fill="#263f35">Fieldwork</text>
    <text x="203" y="306" font-size="13" fill="#778177">Ideas made together.</text>

    <g id="follow-control" aria-label="${label}">
      <rect x="448" y="260" width="220" height="66" rx="23" fill="url(#attention)" opacity="${n(cue * 0.12 + ring * 0.07)}"/>
      <rect x="452" y="264" width="212" height="58" rx="19" fill="${fill}" stroke="${stroke}" stroke-width="1.2"/>
      <rect x="452" y="264" width="212" height="58" rx="19" fill="none" stroke="url(#attention)" stroke-width="2" opacity="${n(Math.max(cue, ring * 0.8))}"/>
      <g id="bell" transform="rotate(${n(bellAngle)} 482 282)" fill="none" stroke="${ink}" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M 473 298 C 475 295 476 294 476 289 C 476 281 488 281 488 289 C 488 294 489 295 491 298 Z" fill="${s.followed ? ink : 'none'}" stroke="${ink}"/>
        <path d="M 479.5 301 Q 482 304 484.5 301 M 482 281 V 279.5"/>
      </g>
      <text x="574" y="300" text-anchor="middle" font-size="18" font-weight="600" fill="${ink}">${label}</text>
    </g>
    <g id="confirmation-particles" aria-hidden="true">${particles}</g>
    <text x="133" y="368" font-size="10" font-weight="700" letter-spacing="1.4" fill="#7b867b">INDEPENDENT STUDIO</text>
    ${s.followed ? '<path d="M 509 362.5 L 512 365.5 L 518 359.5" fill="none" stroke="#48765d" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>' : ''}
    <text x="664" y="367" text-anchor="end" font-size="12" fill="${s.followed ? '#4b7058' : '#879083'}">${footer}</text>
    <text x="400" y="423" text-anchor="middle" font-size="10" letter-spacing="0.5" fill="#91978b">LOCAL INTERACTION PREVIEW</text>
  </g>
</svg>`;
}
