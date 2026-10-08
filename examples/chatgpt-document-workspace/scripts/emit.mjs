import { mkdirSync, writeFileSync } from 'node:fs';
import { initialState, reduce, layout, spring, beginZoom, sampleZoom, geometry, beginMotion, sampleMotion, composerLayout, beginComposerMotion, sampleComposerLayout } from '../src/model.mjs';
import { renderScene } from '../src/scene.mjs';
const out = new URL('../preview/frames/', import.meta.url); mkdirSync(out, { recursive: true });
const width = 1280, height = 1180, fps = 20, seconds = 24;
let state = initialState(), side = { value: 1, velocity: 0 }, zoom = null, composerMotion = null;
let timeMs = 0, motions = { split: null, thumbnails: null };
const target = name => Number(state[name] && state.active !== 'chat');
const progress = name => motions[name] ? sampleMotion(motions[name], timeMs) : target(name);
const currentLayout = () => layout(width, height, side.value, progress('split'), progress('thumbnails'), state.active === 'chat');
function dispatch(action, time) {
  timeMs = time * 1000;
  const old = Object.fromEntries(['split', 'thumbnails'].map(name => [name, { value: progress(name), target: target(name) }]));
  const prior = sampleZoom(state, zoom, time * 1000);
  const oldActive = state.active;
  const oldComposer = sampleComposerLayout(state, currentLayout(), composerMotion, timeMs);
  const oldComposerTarget = composerLayout(state, currentLayout());
  state = reduce(state, action, currentLayout());
  const nextComposer = composerLayout(state, currentLayout());
  if (oldActive !== state.active) composerMotion = null;
  else if (['expansion', 'bodyHeight', 'headerProgress', 'transcriptHeight'].some(key => nextComposer[key] !== oldComposerTarget[key])) {
    composerMotion = beginComposerMotion(oldComposer, nextComposer, timeMs);
  }
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
  [10.7, { type: 'composerFocus', focused: true }],
  [11.4, { type: 'draft', text: 'What connects these projects?' }],
  [12.0, { type: 'draft', text: 'What connects these projects?\nKeep the answer concise.' }],
  [12.7, { type: 'draft', text: 'A short answer.' }],
  [13.4, { type: 'composerFocus', focused: false }],
  [13.8, { type: 'composerFocus', focused: true }],
  [14.3, { type: 'draft', text: '' }],
  [14.7, { type: 'draft', text: 'Summarize the portfolio.' }],
  [15.3, { type: 'send' }],
  [15.5, { type: 'open', id: 'notes' }],
  [15.95, { type: 'reply', id: 'resume', request: 1, body: 'A shared focus on clarity: make complex work easy to navigate, and keep the conversation close to the document.' }],
  [16.6, { type: 'open', id: 'resume' }],
  [17.0, { type: 'composerFocus', focused: true }],
  [17.5, { type: 'composerExpand' }],
  [18.3, { type: 'composerExpand' }],
  [19.0, { type: 'menu', menu: 'dock' }],
  [19.7, { type: 'composerDock' }],
  [20.4, { type: 'composerFocus', focused: true }],
  [20.45, { type: 'draft', text: 'Which project shows this best?' }],
  [20.9, { type: 'send' }],
  [21.55, { type: 'reply', id: 'resume', request: 2, body: 'The second project makes the connection clear through its navigation and consistent controls.' }],
  [22.4, { type: 'split' }],
  [22.5, { type: 'dismiss' }],
  [22.55, { type: 'composerFocus', focused: false }],
];
const pointerKeys = [[0, 1178, 450], [.75, 1190, 80], [.9, 1190, 80], [1.45, 1160, 300], [2, 990, 710], [3.2, 1180, 80], [3.75, 190, 23], [4.75, 1253, 23], [5.6, 355, 531], [6.2, 420, 394], [7.05, 480, 140], [7.55, 585, 78], [8.1, 475, 181], [9.45, 620, 25], [10.7, 916, 1144], [11.4, 900, 1110], [12, 905, 1076], [12.7, 900, 1070], [13.4, 1050, 800], [13.8, 910, 1080], [14.3, 915, 1140], [15.3, 1232, 1142], [15.5, 210, 254], [16.6, 620, 25], [17, 912, 1142], [17.5, 910, 1095], [18.3, 910, 548], [19, 1230, 1095], [19.7, 1130, 1000], [20.4, 470, 1140], [20.9, 624, 1138], [21.8, 480, 720], [22.4, 1218, 24], [23, 1178, 450], [24, 1178, 450]];
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
  writeFileSync(new URL(`${name}.svg`, out), renderScene(display, { width, height, sidebar: side.value, split: progress('split'), thumbnails: progress('thumbnails'), pointer: pointer(t), composerMotion, now: timeMs }));
  if ([0, 31, 118, 174, 220, 243, 259, 288, 350, 360, 385, 406].includes(frame)) manifest.push({ frame, t, active: state.active, zoom: geometry(display, currentLayout())?.scale || null, sidebar: side.value, split: state.split, focused: state.composerFocused, multiline: state.multiline[state.active] });
}
// Static responsive and reduced-motion fixtures use the same renderer, without a cursor overlay.
for (const [name, w, h, s] of [['reference', 1280, 1180, initialState()], ['wide', 1920, 1080, initialState()], ['compact', 390, 844, initialState()], ['focused', 1280, 1180, reduce(initialState(), { type: 'composerFocus', focused: true })], ['multiline', 1280, 1180, reduce(reduce(initialState(), { type: 'composerFocus', focused: true }), { type: 'draft', text: 'What connects these projects?\nKeep the answer concise.' })]]) {
  writeFileSync(new URL(`${name}.svg`, out), renderScene(s, { width: w, height: h }));
}
writeFileSync(new URL('timeline.json', out), JSON.stringify({ fps, seconds, width, height, events, frames: manifest }, null, 2));
console.log(JSON.stringify({ fps, seconds, width, height, frames: seconds * fps }));
