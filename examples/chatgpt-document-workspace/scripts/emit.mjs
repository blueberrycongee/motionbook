import { mkdirSync, writeFileSync } from 'node:fs';
import { initialState, reduce, layout, spring, beginZoom, sampleZoom, geometry, beginMotion, sampleMotion } from '../src/model.mjs';
import { renderScene } from '../src/scene.mjs';
const out = new URL('../preview/frames/', import.meta.url); mkdirSync(out, { recursive: true });
const width = 1280, height = 1180, fps = 20, seconds = 16;
let state = initialState(), side = { value: 1, velocity: 0 }, zoom = null;
let timeMs = 0, motions = { split: null, thumbnails: null };
const target = name => Number(state[name] && state.active !== 'chat');
const progress = name => motions[name] ? sampleMotion(motions[name], timeMs) : target(name);
const currentLayout = () => layout(width, height, side.value, progress('split'), progress('thumbnails'), state.active === 'chat');
function dispatch(action, time) {
  timeMs = time * 1000;
  const old = Object.fromEntries(['split', 'thumbnails'].map(name => [name, { value: progress(name), target: target(name) }]));
  const prior = sampleZoom(state, zoom, time * 1000);
  state = reduce(state, action, currentLayout());
  for (const name of ['split', 'thumbnails']) if (old[name].target !== target(name)) {
    motions[name] = beginMotion(old[name].value, target(name), timeMs, name === 'split' ? 300 : 150);
  }
  if (action.type === 'zoom') zoom = beginZoom(prior, state, currentLayout(), time * 1000);
  else if (['scrollTo', 'page', 'open', 'split', 'thumbnails', 'sidebar'].includes(action.type)) zoom = null;
}
const events = [
  [0.9, { type: 'menu', menu: 'zoom' }],
  [1.45, { type: 'zoom', value: 1.5, x: 830, y: 425 }],
  [3.15, { type: 'zoom', value: 'fit' }],
  [3.75, { type: 'sidebar' }],
  [4.75, { type: 'sidebar' }],
  [5.6, { type: 'thumbnails' }],
  [6.2, { type: 'page', page: 2 }],
  [7.05, { type: 'thumbnails' }],
  [7.55, { type: 'menu', menu: 'files' }],
  [8.1, { type: 'open', id: 'notes' }],
  [9.45, { type: 'open', id: 'resume' }],
  [10.05, { type: 'scrollTo', y: 0, x: 0 }],
  [10.7, { type: 'split' }],
  [11.4, { type: 'draft', text: 'What connects these projects?' }],
  [12.1, { type: 'send' }],
  [12.75, { type: 'reply', id: 'resume', request: 1, body: 'A shared focus on clarity: make complex work easy to navigate, and keep the conversation close to the document.' }],
  [14.15, { type: 'split' }],
  [14.25, { type: 'dismiss' }],
];
const pointerKeys = [[0, 1178, 450], [.75, 1190, 80], [.9, 1190, 80], [1.45, 1160, 300], [2, 990, 710], [3.2, 1180, 80], [3.75, 190, 23], [4.75, 1253, 23], [5.6, 355, 531], [6.2, 420, 394], [7.05, 480, 140], [7.55, 585, 78], [8.1, 475, 181], [9.45, 620, 25], [10.7, 1218, 24], [11.4, 470, 1135], [12.1, 624, 1138], [13.5, 480, 720], [14.15, 1218, 24], [15, 1178, 450], [16, 1178, 450]];
function pointer(t) {
  const i = Math.max(0, pointerKeys.findLastIndex(p => p[0] <= t)); const a = pointerKeys[i], b = pointerKeys[i + 1] || a;
  const p = b[0] === a[0] ? 1 : Math.max(0, Math.min(1, (t - a[0]) / (b[0] - a[0]))), k = p * p * (3 - 2 * p);
  return { x: a[1] + (b[1] - a[1]) * k, y: a[2] + (b[2] - a[2]) * k, down: events.some(([at]) => Math.abs(t - at) < .08) };
}
let eventIndex = 0; const manifest = [];
for (let frame = 0; frame < seconds * fps; frame++) {
  const t = frame / fps; timeMs = t * 1000;
  while (eventIndex < events.length && events[eventIndex][0] <= t + .0001) { dispatch(events[eventIndex][1], t); eventIndex++; }
  if (t > 2 && t < 2.9) dispatch({ type: 'scrollTo', y: 475 + 300 * (1 - Math.cos((t - 2) / .9 * Math.PI)) / 2 }, t);
  if (t > 8.6 && t < 9.1) dispatch({ type: 'scrollTo', y: 120 * (1 - Math.cos((t - 8.6) / .5 * Math.PI)) / 2 }, t);
  side = spring(side.value, side.velocity, Number(state.sidebar), 1 / fps);
  state = reduce(state, { type: 'resize' }, currentLayout());
  const display = sampleZoom(state, zoom, t * 1000);
  const name = String(frame).padStart(4, '0');
  writeFileSync(new URL(`${name}.svg`, out), renderScene(display, { width, height, sidebar: side.value, split: progress('split'), thumbnails: progress('thumbnails'), pointer: pointer(t) }));
  if ([0, 31, 53, 84, 118, 132, 174, 213, 243, 272, 301].includes(frame)) manifest.push({ frame, t, active: state.active, zoom: geometry(display, currentLayout())?.scale || null, sidebar: side.value, split: state.split });
}
// Static responsive and reduced-motion fixtures use the same renderer, without a cursor overlay.
for (const [name, w, h, s] of [['reference', 1280, 1180, initialState()], ['wide', 1920, 1080, initialState()], ['compact', 390, 844, initialState()]]) {
  writeFileSync(new URL(`${name}.svg`, out), renderScene(s, { width: w, height: h }));
}
writeFileSync(new URL('timeline.json', out), JSON.stringify({ fps, seconds, width, height, events, frames: manifest }, null, 2));
console.log(JSON.stringify({ fps, seconds, width, height, frames: seconds * fps }));
