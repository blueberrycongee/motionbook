import {createScene, observedPose, offsetPose} from './scene.mjs';
import {createInteraction} from './interaction.mjs';
import {scenePoint} from './geometry.mjs';

const [asset, buffer] = await Promise.all([
  fetch('./data/motion.json').then(response => response.json()),
  fetch('./data/motion.bin').then(response => response.arrayBuffer())
]);
asset.marks = new Uint8Array(buffer);
const canvas = document.querySelector('canvas');
const context = canvas.getContext('2d');
const draw = createScene(Path2D, (width, height) => {
  const surface = document.createElement('canvas');
  surface.width = width; surface.height = height;
  return surface;
});
const model = createInteraction();
let pose = observedPose(asset, 0), dirty = true, lastState = '';
const now = () => performance.now() / 1000;
model.replay(now());

function move(event) {
  const point = scenePoint(event.clientX, event.clientY, canvas.getBoundingClientRect());
  if (point) model.move(point.x, point.y);
  if (model.mode === 'replay') {
    // An early gesture takes ownership of the ready field rather than an empty intro.
    if (pose.frame < 112) pose = observedPose(asset, 112);
    model.interact(now(), pose);
  }
  dirty = true;
}
canvas.addEventListener('pointermove', move);
canvas.addEventListener('pointerdown', event => {
  if (event.button !== 0) return;
  move(event);
  canvas.setPointerCapture(event.pointerId);
  model.press(now(), pose);
  dirty = true;
});
canvas.addEventListener('pointerup', event => {
  move(event); model.release(now(), pose); dirty = true;
});
const cancel = () => { model.cancel(now(), pose); dirty = true; };
canvas.addEventListener('pointercancel', cancel);
canvas.addEventListener('lostpointercapture', cancel);
window.addEventListener('blur', cancel);

canvas.addEventListener('keydown', event => {
  if (event.code === 'Space' || event.code === 'Enter') {
    event.preventDefault();
    if (!event.repeat) {
      model.move(1075, 620);
      if (pose.frame < 112) pose = observedPose(asset, 112);
      model.press(now(), pose);
      dirty = true;
    }
  } else if (event.code === 'Escape') {
    model.replay(now()); dirty = true;
  }
});
canvas.addEventListener('keyup', event => {
  if (event.code === 'Space' || event.code === 'Enter') {
    event.preventDefault(); model.release(now(), pose); dirty = true;
  }
});
document.querySelector('[data-replay]').addEventListener('click', () => {
  model.replay(now()); dirty = true;
});

function tick(milliseconds) {
  const control = model.state(milliseconds / 1000);
  const key = `${control.mode}:${control.frame}:${control.opacity}`;
  if (dirty || key !== lastState) {
    pose = offsetPose(asset, control);
    draw(context, asset, pose);
    lastState = key; dirty = false;
  }
  requestAnimationFrame(tick);
}
requestAnimationFrame(tick);
