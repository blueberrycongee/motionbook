'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm'), fs = require('node:fs'), path = require('node:path');
const M = require('../src/motion.js');
async function harness({ reduced = false, pose = '' } = {}) {
  let now = 0, next = 0, frames = new Map(), renders = 0, focused;
  class Element {
    constructor(id = '') { this.id = id; this.handlers = {}; this.dataset = {}; this.attrs = {}; this.firstElementChild = {}; this.textContent = ''; this.value = ''; this.checked = false; this.disabled = false; this.hidden = false; this.interactive = false; }
    addEventListener(name, callback) { (this.handlers[name] ||= []).push(callback); }
    setAttribute(name, value) { this.attrs[name] = value; }
    getAttribute(name) { return this.attrs[name]; }
    getContext() { return {}; }
    focus() { focused = this; }
    closest() { return this.interactive ? this : null; }
    emit(name, props = {}) { const event = { target: this, preventDefault() { this.defaultPrevented = true; }, ...props }; for (const f of this.handlers[name] || []) f(event); return event; }
  }
  const ids = ['scene', 'toggle', 'toggle-label', 'window-minimize', 'dock-restore', 'progress', 'percent', 'phase', 'slow', 'loop', 'reduce', 'replay', 'motion-note', 'status', 'loading'];
  const elements = Object.fromEntries(ids.map(id => [id, new Element(id)]));
  for (const id of ids) if (!['scene', 'status', 'phase', 'percent', 'loading'].includes(id)) elements[id].interactive = true;
  const document = new Element(); document.hidden = false;
  document.fonts = { load: async () => [] };
  document.getElementById = id => elements[id]; document.createElement = () => new Element();
  const media = new Element(); media.matches = reduced;
  const context = { window: { GenieMotion: M, GenieScene: { createRenderer: () => ({ draw: () => { renders++; } }) } }, document, matchMedia: () => media, performance: { now: () => now }, requestAnimationFrame: callback => { frames.set(++next, callback); return next; }, cancelAnimationFrame: id => frames.delete(id), location: { search: pose ? '?pose=' + pose : '' }, URLSearchParams, console };
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../src/app.js'), 'utf8'), context);
  await new Promise(resolve => setImmediate(resolve));
  return { elements, document, media, get renders() { return renders; }, get frames() { return frames.size; }, get focused() { return focused; }, step(seconds = 1 / 60) { now += seconds * 1000; const work = [...frames.values()]; frames.clear(); work.forEach(f => f(now)); }, advance(seconds) { for (let i = 0; i < Math.ceil(seconds * 60); i++) this.step(); }, progress() { return Number(elements.scene.dataset.progress); } };
}
test('adapter initializes and does not schedule idle animation frames', async () => {
  const h = await harness(); assert.equal(h.elements.loading.hidden, true); assert.equal(h.progress(), 0); assert.equal(h.frames, 0); assert.equal(h.elements['window-minimize'].hidden, false);
});
test('yellow button minimizes, transfers focus, and Dock restores', async () => {
  const h = await harness(); h.elements['window-minimize'].emit('click');
  assert.equal(h.focused, h.elements.toggle); h.advance(1.2);
  assert.equal(h.progress(), 1); assert.equal(h.elements['toggle-label'].textContent, 'Restore'); assert.equal(h.frames, 0);
  h.elements['dock-restore'].emit('click'); h.advance(1.2);
  assert.equal(h.progress(), 0); assert.equal(h.elements['toggle-label'].textContent, 'Minimize'); assert.equal(h.frames, 0);
});
test('button reversal keeps position and a single scheduled frame', async () => {
  const h = await harness(); h.elements.toggle.emit('click'); h.advance(.15);
  const before = h.progress(); h.elements.toggle.emit('click'); assert.equal(h.progress(), before); assert.equal(h.frames, 1);
  h.advance(1); assert.equal(h.progress(), 0); assert.equal(h.frames, 0);
});
test('Space shortcut avoids form controls and key-repeat; Escape restores', async () => {
  const h = await harness();
  h.document.emit('keydown', { code: 'Space', key: ' ', target: h.elements.progress }); assert.equal(h.frames, 0);
  h.document.emit('keydown', { code: 'Space', key: ' ', repeat: true }); assert.equal(h.frames, 0);
  const e = h.document.emit('keydown', { code: 'Space', key: ' ' }); assert.equal(e.defaultPrevented, true); h.advance(1);
  assert.equal(h.progress(), 1);
  h.document.emit('keydown', { code: 'Escape', key: 'Escape', target: h.elements.toggle }); h.advance(1); assert.equal(h.progress(), 0);
});
test('scrub updates visual/accessibility outputs and cancels replay', async () => {
  const h = await harness(); h.elements.replay.emit('click'); h.elements.progress.value = '520'; h.elements.progress.emit('input');
  assert.equal(h.progress(), .52); assert.equal(h.elements.percent.textContent, '52%'); assert.equal(h.elements.phase.textContent, 'Flow'); assert.equal(h.elements.scene.dataset.mode, 'manual');
  assert.equal(h.elements.progress.attrs['aria-valuetext'], '52 percent, flow'); h.step(); assert.equal(h.frames, 0);
});
test('system reduced motion snaps endpoints and disables replay/loop/scrub', async () => {
  const h = await harness({ reduced: true });
  assert.equal(h.elements.reduce.disabled, true); assert.equal(h.elements.replay.disabled, true); assert.equal(h.elements.progress.disabled, true);
  h.elements.toggle.emit('click'); assert.equal(h.progress(), 1); assert.equal(h.frames, 0);
  h.elements['dock-restore'].emit('click'); assert.equal(h.progress(), 0);
});
test('live system preference cancels animation without a jump to an intermediate pose', async () => {
  const h = await harness(); h.elements.toggle.emit('click'); h.advance(.2);
  h.media.emit('change', { matches: true }); assert.equal(h.progress(), 1); assert.equal(h.elements.reduce.checked, true);
  h.step(); assert.equal(h.frames, 0);
  h.media.emit('change', { matches: false }); assert.equal(h.elements.reduce.disabled, false);
});
test('explicit reduce-motion preference snaps and exposes explanatory note', async () => {
  const h = await harness(); h.elements.reduce.checked = true; h.elements.reduce.emit('change');
  assert.equal(h.elements['motion-note'].hidden, false); assert.equal(h.elements.loop.disabled, true);
  h.elements.toggle.emit('click'); assert.equal(h.progress(), 1); assert.equal(h.frames, 0);
});
test('visibility pause cancels frame and resumes from same pose', async () => {
  const h = await harness(); h.elements.toggle.emit('click'); h.advance(.2); const p = h.progress();
  h.document.hidden = true; h.document.emit('visibilitychange'); assert.equal(h.frames, 0); h.step(80); assert.equal(h.progress(), p);
  h.document.hidden = false; h.document.emit('visibilitychange'); h.step(); assert.ok(h.progress() < p + .04); h.advance(1); assert.equal(h.progress(), 1);
});
test('loop checkbox cycles until unchecked and settles with no idle frames', async () => {
  const h = await harness(); h.elements.loop.checked = true; h.elements.loop.emit('change'); h.advance(10);
  assert.equal(h.elements.scene.dataset.mode, 'loop'); assert.equal(h.frames, 1);
  h.elements.loop.checked = false; h.elements.loop.emit('change'); h.advance(2); assert.equal(h.frames, 0); assert.equal(h.elements.scene.dataset.mode, 'manual');
});
test('static pose URL is safe, clamped and ignored for system reduced motion', async () => {
  assert.equal((await harness({ pose: '.57' })).progress(), .57);
  assert.equal((await harness({ pose: 'garbage' })).progress(), 0);
  assert.equal((await harness({ pose: '9' })).progress(), 1);
  assert.equal((await harness({ pose: '.57', reduced: true })).progress(), 0);
});

test('manual reduce-motion choice survives OS on/off changes', async () => {
  const h = await harness(); h.elements.reduce.checked = true; h.elements.reduce.emit('change');
  h.media.emit('change', { matches: true }); h.media.emit('change', { matches: false });
  assert.equal(h.elements.reduce.checked, true); assert.equal(h.elements.reduce.disabled, false);
  h.elements.toggle.emit('click'); assert.equal(h.progress(), 1); assert.equal(h.frames, 0);
});
test('Minimize button after 25 percent scrub minimizes', async () => {
  const h = await harness({ pose: '.25' }); assert.equal(h.elements['toggle-label'].textContent, 'Minimize');
  h.elements.toggle.emit('click'); h.advance(1); assert.equal(h.progress(), 1);
});
