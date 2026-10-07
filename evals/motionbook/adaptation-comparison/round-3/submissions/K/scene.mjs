/**
 * Personal archive navigation, drawn from original SVG primitives.
 * renderFrame is a pure scripted preview, not an input controller.
 * Decoration follows continuous per-tab illumination weights; selected view
 * is immediate application state and never depends on the animation clock.
 */
const LABELS = Object.freeze(['Overview', 'Activity', 'Archive']);
const CONTENT = Object.freeze([
  'Everything you’ve saved, at a glance.',
  'Your latest additions and small discoveries.',
  'A quiet home for things worth keeping.'
]);
const NORMAL = Object.freeze([[0.50, 1], [2.10, 2], [3.80, 0]]);
const INTERRUPTED = Object.freeze([[0.50, 1], [0.65, 2], [0.85, 0], [2.10, 2], [2.50, 2], [3.80, 0]]);
const RATE = 9;
const n = value => Number(value.toFixed(6));
const oneHot = selected => LABELS.map((_, i) => +(i === selected));
const approach = (weights, selected, seconds) => {
  const remaining = Math.exp(-RATE * Math.max(0, seconds));
  return weights.map((weight, i) => +(i === selected) + (weight - +(i === selected)) * remaining);
};

/** Exact analytic evaluation of piecewise targets, with no mutable frame history. */
export function stateAt(t = 0, options = {}) {
  const time = Number.isFinite(t) ? Math.min(6, Math.max(0, t)) : 0;
  const events = options.scenario === 'interrupted' ? INTERRUPTED : NORMAL;
  let selected = 0;
  let weights = [1, 0, 0];
  let since = 0;
  let navigationCount = 0;
  for (const [eventTime, target] of events) {
    if (eventTime > time) break;
    // A repeated selection is a no-op: it does not restart a transition.
    if (target === selected) continue;
    weights = approach(weights, selected, eventTime - since);
    since = eventTime;
    selected = target;
    navigationCount++;
  }
  weights = options.reducedMotion ? oneHot(selected) : approach(weights, selected, time - since);
  return { selected, weights, navigationCount };
}

function icon(index, x, y) {
  const paths = [
    '<rect x="1" y="1" width="6" height="6" rx="1.5"/><rect x="11" y="1" width="6" height="6" rx="1.5"/><rect x="1" y="11" width="6" height="6" rx="1.5"/><rect x="11" y="11" width="6" height="6" rx="1.5"/>',
    '<path d="M0 10h4l3-7 4 13 3-6h4"/>',
    '<rect x="1" y="2" width="16" height="4" rx="1.3"/><path d="M3 6v10h12V6M7 10h4"/>'
  ];
  return `<g transform="translate(${x} ${y})" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${paths[index]}</g>`;
}

function drawTab(index, weight, selected) {
  const x = 149 + index * 172;
  const width = 158;
  const center = x + width / 2;
  const active = index === selected;
  const underline = n(110 * weight);
  return `<g data-view="${LABELS[index]}" data-selected="${active}" data-weight="${n(weight)}">
    <ellipse cx="${center}" cy="330" rx="123" ry="65" fill="url(#spill)" opacity="${n(weight * 0.58)}"/>
    <rect x="${x}" y="268" width="${width}" height="58" rx="15" fill="url(#button)" stroke="#2c3540" stroke-width="1"/>
    <rect x="${x + 1}" y="269" width="${width - 2}" height="56" rx="14" fill="url(#innerLight)" opacity="${n(weight * 0.74)}"/>
    <path d="M${x + 15} 269h${width - 30}" stroke="#758496" stroke-opacity=".12" stroke-linecap="round"/>
    <g color="${active ? '#f3faff' : '#b3bdc9'}">
      ${icon(index, x + 16, 288)}
      <text x="${x + 45}" y="303" fill="currentColor" font-size="17" font-weight="${active ? '600' : '500'}">${LABELS[index]}</text>
    </g>
    <circle cx="${x + width - 13}" cy="280" r="2.5" fill="#b8ebf7" opacity="${active ? 1 : 0}"/>
    <rect x="${n(center - underline / 2)}" y="335" width="${underline}" height="2.5" rx="1.25" fill="#bcf0fc"/>
    <rect x="${n(center - underline / 2)}" y="335" width="${underline}" height="2.5" rx="1.25" fill="#a2eaff" opacity="${n(weight * 0.5)}" filter="url(#softLine)"/>
  </g>`;
}

export function renderFrame(t = 0, options = {}) {
  const { selected, weights } = stateAt(t, options);
  const width = Number.isFinite(options.width) && options.width > 0 ? options.width : 800;
  const height = Number.isFinite(options.height) && options.height > 0 ? options.height : 600;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 800 600" role="img" aria-labelledby="title description" data-selected="${LABELS[selected]}" data-reduced-motion="${!!options.reducedMotion}">
  <title id="title">Personal archive: ${LABELS[selected]} selected</title>
  <desc id="description">A scripted preview of a three-view switcher. Overview, Activity and Archive remain visible. The small dot marks the current view; the underline and light follow the transition.</desc>
  <defs>
    <radialGradient id="canvasLight" cx="50%" cy="42%" r="64%"><stop stop-color="#19212b"/><stop offset="1" stop-color="#0e1218"/></radialGradient>
    <linearGradient id="button" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#1a2029"/><stop offset="1" stop-color="#171d26"/></linearGradient>
    <linearGradient id="innerLight" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#97d7eb" stop-opacity="0"/><stop offset=".72" stop-color="#97d7eb" stop-opacity=".04"/><stop offset="1" stop-color="#b5e9f7" stop-opacity=".32"/></linearGradient>
    <radialGradient id="spill"><stop stop-color="#a9e8ff" stop-opacity=".18"/><stop offset=".42" stop-color="#7ecde9" stop-opacity=".075"/><stop offset="1" stop-color="#7ecde9" stop-opacity="0"/></radialGradient>
    <filter id="softLine" x="-60%" y="-400%" width="220%" height="900%"><feGaussianBlur stdDeviation="3"/></filter>
  </defs>
  <rect width="800" height="600" fill="url(#canvasLight)"/>
  <g font-family="Arial, Helvetica, sans-serif">
    <text x="400" y="221" text-anchor="middle" fill="#a9b6c5" font-size="11" font-weight="600" letter-spacing="2.8">PERSONAL ARCHIVE</text>
    ${weights.map((weight, index) => drawTab(index, weight, selected)).join('')}
    <text x="400" y="386" text-anchor="middle" fill="#aab7c6" font-size="14">${CONTENT[selected]}</text>
  </g>
</svg>`;
}
