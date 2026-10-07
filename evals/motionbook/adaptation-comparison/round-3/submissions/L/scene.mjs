/**
 * Original Morrow studio follow control. All events are an authored local simulation.
 * renderFrame is a pure SVG renderer: no I/O, timers, browser objects, or random state.
 */
const clamp = (n, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, n));
const ease = n => { n = clamp(n); return n * n * (3 - 2 * n); };
const num = n => Number(n.toFixed(4));
const EVENTS = Object.freeze({
  normal: Object.freeze([[0.5, 'activate']]),
  interrupted: Object.freeze([[0.5, 'activate'], [0.85, 'activate'], [1.4, 'undo'], [2.1, 'activate']])
});

// Business state is resolved first; decoration is derived from the accepted activation.
export function stateAt(time = 0, scenario = 'normal', reducedMotion = false) {
  if (!Number.isFinite(time)) throw new TypeError('Time must be finite');
  const t = clamp(time, 0, 6);
  const events = EVENTS[scenario] || EVENTS.normal;
  let followed = false, activatedAt = null, activationCount = 0;
  for (const [at, type] of events) {
    if (at > t) break;
    if (type === 'activate' && !followed) {
      followed = true;
      activatedAt = at;
      activationCount++;
    } else if (type === 'undo') {
      followed = false;
      activatedAt = null;
    }
  }
  const age = activatedAt === null ? -1 : t - activatedAt;
  const decorative = followed && !reducedMotion && age < 1.65;
  const bellAge = age - 0.24;
  const bellAngle = decorative && bellAge > 0 && bellAge < 1.2
    ? 15 * Math.sin(bellAge * Math.PI * 7.5) * Math.pow(1 - bellAge / 1.2, 2) : 0;
  // A single non-repeating attention cue before the first activation only.
  const cue = !reducedMotion && t >= 0.12 && t < 0.5
    ? ease((t - 0.12) / 0.16) : 0;
  return { t, followed, activatedAt, activationCount, age, decorative, bellAngle, cue,
    label: followed ? 'Following' : 'Follow studio', reducedMotion: !!reducedMotion };
}

function star(x, y, r, color, opacity, rotation) {
  return `<path d="M 0 ${num(-r)} L ${num(r * .23)} ${num(-r * .23)} L ${num(r)} 0 L ${num(r * .23)} ${num(r * .23)} L 0 ${num(r)} L ${num(-r * .23)} ${num(r * .23)} L ${num(-r)} 0 L ${num(-r * .23)} ${num(-r * .23)} Z" fill="${color}" opacity="${num(opacity)}" transform="translate(${num(x)} ${num(y)}) rotate(${num(rotation)})"/>`;
}

function celebration(s) {
  if (!s.decorative) return '';
  // Original placements, restrained travel, and just six particles outside the label.
  const specs = [
    [-91, -23, -10, -10, .09, 3.7, '#d65372', 1],
    [-72, -27, -8, -8, .15, 2.5, '#cb6092', 0],
    [78, -26, 6, -10, .11, 3.6, '#d65372', 1],
    [105, -5, 12, -4, .18, 2.6, '#ba548e', 0],
    [88, 26, 10, 10, .19, 3.5, '#c25792', 1],
    [-108, 18, -9, 6, .14, 2.4, '#dd7968', 0]
  ];
  return specs.map(([x, y, dx, dy, delay, r, color, sparkle], i) => {
    const p = (s.age - delay) / .7;
    if (p <= 0 || p >= 1) return '';
    const grow = ease(p / .2), fade = 1 - ease((p - .48) / .52);
    const travel = 1 - Math.pow(1 - p, 3);
    const px = 400 + x + dx * travel, py = 336 + y + dy * travel;
    return sparkle ? star(px, py, r * grow, color, fade, i * 13 + 15 * p)
      : `<circle cx="${num(px)}" cy="${num(py)}" r="${num(r * grow)}" fill="${color}" opacity="${num(fade)}"/>`;
  }).join('');
}

export function renderFrame(t = 0, options = {}) {
  const { width = 800, height = 600, scenario = 'normal', reducedMotion = false } = options;
  if (!Number.isFinite(width) || width <= 0 || !Number.isFinite(height) || height <= 0)
    throw new TypeError('Dimensions must be finite positive numbers');
  const s = stateAt(t, scenario, reducedMotion);
  const flash = s.decorative ? (1 - ease(s.age / .43)) * .54 : 0;
  const outline = Math.max(s.cue, s.decorative ? 1 - ease(s.age / .5) : 0);
  const fill = s.followed ? '#382b3b' : '#fffdfa';
  const ink = s.followed ? '#fffaf6' : '#382b3b';
  const bell = `<g transform="translate(331 324) rotate(${num(s.bellAngle)} 0 -10)" fill="none" stroke="${ink}" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round">
    <path d="M -7.6 5.8 C -5.7 3.4 -5.2 .7 -5.2 -3 C -5.2 -6.8 -3.2 -9.3 0 -9.3 C 3.2 -9.3 5.2 -6.8 5.2 -3 C 5.2 .7 5.7 3.4 7.6 5.8 Z"/>
    <path d="M -2.5 8.8 C -1.8 11.1 1.8 11.1 2.5 8.8 M 0 -11.3 L 0 -9.3"/>
  </g>`;
  const status = s.followed ? 'Studio updates are on' : 'New work. A little closer.';
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${num(width)}" height="${num(height)}" viewBox="0 0 800 600" role="img" aria-labelledby="scene-title scene-description" data-followed="${s.followed}" data-activation-count="${s.activationCount}" data-bell-angle="${num(s.bellAngle)}">
  <title id="scene-title">Morrow studio: ${s.label}</title>
  <desc id="scene-description">A fictional creative workspace follow control. ${status}. Authored event simulation only; no subscription request is sent.</desc>
  <defs>
    <linearGradient id="attention" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stop-color="#e67864"/><stop offset=".45" stop-color="#df5370"/><stop offset="1" stop-color="#b14b98"/></linearGradient>
    <linearGradient id="paper" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fffdf8"/><stop offset="1" stop-color="#f9f6f0"/></linearGradient>
  </defs>
  <rect width="800" height="600" fill="#f1efeb"/>
  <rect x="237" y="180" width="326" height="252" rx="25" fill="#493744" opacity=".025"/>
  <rect x="238" y="177" width="324" height="252" rx="24" fill="#493744" opacity=".025"/>
  <rect x="238" y="174" width="324" height="252" rx="24" fill="url(#paper)" stroke="#e5dfd7"/>
  <g aria-hidden="true">
    <rect x="375" y="203" width="50" height="50" rx="15" fill="#efe3d9"/>
    <path d="M 384 237 L 384 216 C 391 216 397 220 400 226 L 400 242 C 396 237 391 235 384 237 Z" fill="#d98464"/>
    <path d="M 416 212 L 416 233 C 409 233 404 237 400 242 L 400 226 C 404 220 409 215 416 212 Z" fill="#8b617f"/>
    <path d="M 400 226 L 400 242" fill="none" stroke="#fffaf4" stroke-width="1"/>
  </g>
  <g font-family="Arial, Helvetica, sans-serif" text-anchor="middle">
    <text x="400" y="278" fill="#342d36" font-size="20" font-weight="600" letter-spacing="-.5">Morrow studio</text>
    <text x="400" y="297" fill="#756a72" font-size="11.5">A creative workspace</text>
  </g>
  <rect x="294" y="314" width="212" height="52" rx="26" fill="#352334" opacity=".05"/>
  <g id="follow-control" data-label="${s.label}" transform="translate(0 -2)">
    <rect x="293" y="310" width="214" height="56" rx="28" fill="url(#attention)" opacity="${num(outline)}"/>
    <rect x="296" y="313" width="208" height="50" rx="25" fill="${fill}" stroke="${s.followed ? '#382b3b' : '#dcd3d8'}" stroke-width="1"/>
    <rect x="296" y="313" width="208" height="50" rx="25" fill="url(#attention)" opacity="${num(flash)}"/>
    <g transform="translate(0 14)">${bell}</g>
    <text x="415" y="343.5" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="15" font-weight="600" fill="${ink}">${s.label}</text>
    ${s.followed ? `<path d="M 473 337 L 476 340 L 481 334.5" fill="none" stroke="#ead4e4" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>` : ''}
  </g>
  <g id="confirmation-particles" aria-hidden="true">${celebration(s)}</g>
  <text x="400" y="383" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="11" fill="#756974">${status}</text>
</svg>`;
}
