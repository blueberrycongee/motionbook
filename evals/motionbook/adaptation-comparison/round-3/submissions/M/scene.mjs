/** Original, asset-free navigation study. All motion is derived from scripted events. */
const LABELS = ['Overview', 'Activity', 'Archive'];
const CONTENT = [
  'Your collection, at a glance.',
  'The things you added, revisited, and changed.',
  'Everything saved, ready to find again.'
];
const EVENTS = {
  normal: [[0.50, 1], [2.10, 2], [3.80, 0]],
  interrupted: [[0.50, 1], [0.65, 2], [0.85, 0], [2.10, 2], [2.50, 2], [3.80, 0]]
};
const RATE = 10;
const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
const round = n => Number(n.toFixed(6));
const targetFor = index => LABELS.map((_, i) => Number(i === index));

// An exact elapsed-time solution, rather than frame-dependent replay. Redirection
// carries every currently visible weight forward; selecting the target again is a no-op.
export function sampleState(t = 0, scenario = 'normal', reducedMotion = false) {
  const time = clamp(Number.isFinite(t) ? t : 0, 0, 6);
  const events = EVENTS[scenario] || EVENTS.normal;
  let selected = 0;
  let weights = [1, 0, 0];
  let lastEvent = 0;
  let navigationCount = 0;
  const evolve = elapsed => {
    const decay = Math.exp(-RATE * elapsed);
    const goal = targetFor(selected);
    weights = weights.map((v, i) => goal[i] + (v - goal[i]) * decay);
  };
  for (const [at, next] of events) {
    if (at > time) break;
    if (next === selected) continue;
    evolve(at - lastEvent);
    selected = next;
    lastEvent = at;
    navigationCount++;
  }
  evolve(time - lastEvent);
  if (reducedMotion) weights = targetFor(selected);
  return {selected, weights, navigationCount};
}

function icon(index, x, color) {
  const paths = [
    '<rect x="0" y="0" width="6" height="6" rx="1.2"/><rect x="10" y="0" width="6" height="6" rx="1.2"/><rect x="0" y="10" width="6" height="6" rx="1.2"/><rect x="10" y="10" width="6" height="6" rx="1.2"/>',
    '<path d="M0 12h3l3-9 4 13 3-8h3"/>',
    '<path d="M1 5h14v10H1zM0 1h16v4H0zM6 9h4"/>'
  ];
  return `<g transform="translate(${x} 283)" fill="none" stroke="${color}" stroke-width="1.45" stroke-linecap="round" stroke-linejoin="round">${paths[index]}</g>`;
}

export function renderFrame(t = 0, options = {}) {
  const width = Number.isFinite(options.width) && options.width > 0 ? options.width : 800;
  const height = Number.isFinite(options.height) && options.height > 0 ? options.height : 600;
  const reducedMotion = options.reducedMotion === true;
  const {selected, weights, navigationCount} = sampleState(t, options.scenario, reducedMotion);
  const xs = [159, 325, 491];
  const tabWidth = 150;
  const defs = `<defs>
    <linearGradient id="surface" x1="0" y1="0" x2="0" y2="1">
      <stop stop-color="#1c2027"/><stop offset="1" stop-color="#181b22"/>
    </linearGradient>
    <radialGradient id="light">
      <stop stop-color="#eadbc1" stop-opacity=".18"/>
      <stop offset=".48" stop-color="#c3b79f" stop-opacity=".065"/>
      <stop offset="1" stop-color="#c3b79f" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="reflection" x1="0" y1="0" x2="0" y2="1">
      <stop stop-color="#f4e6c9" stop-opacity="0"/>
      <stop offset=".70" stop-color="#f4e6c9" stop-opacity=".02"/>
      <stop offset="1" stop-color="#f4e6c9" stop-opacity=".17"/>
    </linearGradient>
    <linearGradient id="lip"><stop stop-color="#e5d4b1" stop-opacity="0"/><stop offset=".5" stop-color="#f5e7cd" stop-opacity=".65"/><stop offset="1" stop-color="#e5d4b1" stop-opacity="0"/></linearGradient>
  </defs>`;
  const light = weights.map((weight, i) => `<ellipse cx="${xs[i] + tabWidth / 2}" cy="321" rx="128" ry="86" fill="url(#light)" opacity="${round(weight)}"/>`).join('');
  const tabs = LABELS.map((label, i) => {
    const x = xs[i], w = weights[i], active = i === selected;
    const color = active ? '#fff3df' : '#bdc1c9';
    const lineWidth = 104 * w;
    return `<g role="tab" aria-label="${label}" aria-selected="${active}" data-index="${i}">
      <rect x="${x}" y="264" width="${tabWidth}" height="54" rx="12" fill="url(#surface)" stroke="#343841" stroke-width=".8"/>
      <rect x="${x + .7}" y="264.7" width="${tabWidth - 1.4}" height="52.6" rx="11.5" fill="url(#reflection)" opacity="${round(w)}"/>
      <path d="M${x + 12} 265h126" stroke="#4b505b" stroke-width=".6" opacity=".6"/>
      <path d="M${x + 13} 317h124" stroke="url(#lip)" stroke-width="1" opacity="${round(w)}"/>
      ${icon(i, x + 18, color)}
      <text x="${x + 44}" y="297" fill="${color}" font-size="17" font-weight="${active ? '600' : '400'}">${label}</text>
      <circle cx="${x + tabWidth - 11}" cy="274" r="2.3" fill="#f5d598" opacity="${active ? 1 : 0}"/>
      <rect x="${round(x + (tabWidth - lineWidth) / 2)}" y="329" width="${round(lineWidth)}" height="2.5" rx="1.25" fill="#f6e3be" opacity="${round(w)}"/>
    </g>`;
  }).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 800 600" role="img" aria-labelledby="title description" data-selected="${selected}" data-weights="${weights.map(round).join(',')}" data-navigation-count="${navigationCount}">
    <title id="title">Personal archive: ${LABELS[selected]}</title>
    <desc id="description">Three-view switcher. ${LABELS[selected]} is selected. ${CONTENT[selected]}</desc>
    ${defs}
    <rect width="800" height="600" fill="#11141a"/>
    <g font-family="Arial, Helvetica, sans-serif">
      <text x="400" y="216" text-anchor="middle" fill="#9b9fa7" font-size="11" letter-spacing="2.6">PERSONAL ARCHIVE</text>
      ${light}
      <g role="tablist" aria-label="Archive views">${tabs}</g>
      <text x="400" y="378" text-anchor="middle" fill="#afb3bd" font-size="13">${CONTENT[selected]}</text>
    </g>
  </svg>`;
}
