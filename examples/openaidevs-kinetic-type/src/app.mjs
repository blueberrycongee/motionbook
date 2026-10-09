import { sequence } from './sequence.mjs';
import { createPlayback } from './timeline.mjs';
import { createRenderer } from './renderer.mjs';

const capture = new URLSearchParams(location.search).has('capture');
document.documentElement.classList.toggle('capture', capture);
await document.fonts.load(sequence.font);
const canvas = document.querySelector('canvas');
const renderer = createRenderer(canvas, sequence);
const preference = matchMedia('(prefers-reduced-motion: reduce)');
const player = createPlayback(sequence.duration, { reducedMotion: preference.matches });
const playButton = document.querySelector('#play');
const replayButton = document.querySelector('#replay');
const timeInput = document.querySelector('#time');
let frame = null;
let armed = !capture;
const frameTimes = [];

function paint(now = performance.now()) {
  const state = player.sample(now);
  if (armed) renderer.draw(state.time, { reducedMotion: state.reducedMotion });
  playButton.textContent = state.playing ? 'Pause' : state.time === sequence.duration ? 'Replay' : 'Play';
  playButton.disabled = replayButton.disabled = state.reducedMotion;
  timeInput.disabled = state.reducedMotion;
  timeInput.value = state.time;
  document.querySelector('#position').textContent = `${state.time.toFixed(2)} / 14.00 s`;
  document.querySelector('#motion-note').textContent = state.reducedMotion ? 'Reduced motion: final message shown without animation.' : '';
  return state;
}

function tick(now) {
  frame = null;
  const state = paint(now);
  if (capture) frameTimes.push(state.time);
  if (state.playing) frame = requestAnimationFrame(tick);
}

function update(action) {
  if (frame !== null) cancelAnimationFrame(frame);
  frame = null;
  action(performance.now());
  const state = paint();
  if (state.playing && !document.hidden) frame = requestAnimationFrame(tick);
}

playButton.addEventListener('click', () => update(now => player.sample(now).playing ? player.pause(now) : player.play(now)));
replayButton.addEventListener('click', () => update(now => player.replay(now)));
timeInput.addEventListener('input', () => update(now => { player.pause(now); player.seek(Number(timeInput.value), now); }));
preference.addEventListener('change', event => update(now => player.setReducedMotion(event.matches, now)));
document.addEventListener('visibilitychange', () => { if (document.hidden) update(now => player.pause(now)); });
window.addEventListener('pagehide', () => update(now => player.pause(now)));

window.motionStudy = {
  ready: true,
  config: sequence,
  layout: renderer.layout,
  state: () => player.sample(performance.now()),
  frameTimes,
  play: () => { armed = true; update(now => player.play(now)); },
  pause: () => update(now => player.pause(now)),
  seek: seconds => { armed = true; update(now => { player.pause(now); player.seek(seconds, now); }); },
  replay: () => { armed = true; frameTimes.length = 0; update(now => player.replay(now)); },
};
if (!capture) update(now => player.play(now));
