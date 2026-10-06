'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const M = require('../src/motion.js');
const S = require('../src/scene.js');
const ROOT = path.join(__dirname, '..');

// This is deliberately an event/attribute simulation, not a browser. It cannot
// establish layout, accessibility-tree behavior, touch latency, or paint cost.
function harness({ reduced = false, scale = 1 } = {}) {
  let now = 0, serial = 0, htmlWrites = 0, patchCount = 0, lastState;
  const frames = new Map(), timers = new Map(), controllers = [];
  class Element {
    constructor(id = '', tagName = 'DIV') {
      Object.assign(this, { id, tagName, handlers: {}, attrs: {}, dataset: {},
        style: {}, value: '', textContent: '', hidden: false, disabled: false,
        childrenById: new Map(), captures: new Set(), parentElement: null });
      const classes = new Set();
      this.classList = { add: (...xs) => xs.forEach(x => classes.add(x)),
        remove: (...xs) => xs.forEach(x => classes.delete(x)),
        contains: x => classes.has(x), toggle(x, force) {
          const next = force === undefined ? !classes.has(x) : !!force;
          if (next) classes.add(x); else classes.delete(x); return next;
        } };
    }
    addEventListener(name, fn) { (this.handlers[name] ||= []).push(fn); }
    removeEventListener(name, fn) { this.handlers[name] = (this.handlers[name] || []).filter(f => f !== fn); }
    setAttribute(name, value) {
      this.attrs[name] = String(value);
      if (name.startsWith('data-')) this.dataset[name.slice(5).replace(/-([a-z])/g, (_, c) => c.toUpperCase())] = String(value);
    }
    getAttribute(name) { return this.attrs[name] ?? null; }
    removeAttribute(name) { delete this.attrs[name]; }
    getBoundingClientRect() {
      return { top: 20, left: 10, width: M.referenceSpec.width * scale,
        height: M.referenceSpec.height * scale };
    }
    setPointerCapture(id) { this.captures.add(id); }
    hasPointerCapture(id) { return this.captures.has(id); }
    releasePointerCapture(id) { this.captures.delete(id); }
    focus() { document.activeElement = this; }
    closest(selector) {
      for (let el = this; el; el = el.parentElement) {
        if (selector.split(',').some(s => s.trim().toUpperCase() === el.tagName)) return el;
        if (selector.includes('[contenteditable') && el.getAttribute('contenteditable') === 'true') return el;
        if (selector.includes('[data-') && /\[data-([^\]]+)\]/.exec(selector)?.[1] in el.dataset) return el;
      }
      return null;
    }
    querySelector(selector) { return this.childrenById.get(selector.replace(/^#/, '')) || null; }
    querySelectorAll(selector) { return selector === '[id]' ? [...this.childrenById.values()] : []; }
    contains(el) { return el === this || [...this.childrenById.values()].includes(el); }
    emit(type, props = {}) {
      const event = { type, target: this, currentTarget: this, pointerId: 1,
        button: 0, isPrimary: true, clientX: 100, clientY: 300, repeat: false,
        preventDefault() { this.defaultPrevented = true; }, stopPropagation() {}, ...props };
      for (const fn of [...this.handlers[type] || []]) fn(event);
      return event;
    }
    set innerHTML(value) {
      this._html = value; htmlWrites++; this.childrenById.clear();
      for (const match of value.matchAll(/<([\w:-]+)\b[^>]*\bid="([^"]+)"[^>]*>/g)) {
        const child = new Element(match[2], match[1].toUpperCase());
        child.parentElement = this;
        for (const attr of match[0].matchAll(/([\w:-]+)="([^"]*)"/g)) child.setAttribute(attr[1], attr[2]);
        this.childrenById.set(child.id, child);
      }
    }
    get innerHTML() { return this._html; }
  }
  const document = new Element();
  document.hidden = false;
  const elements = {};
  for (const match of fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8').matchAll(/<([\w:-]+)\b[^>]*\bid="([^"]+)"[^>]*>/g)) {
    const el = elements[match[2]] = new Element(match[2], match[1].toUpperCase());
    for (const attr of match[0].matchAll(/([\w:-]+)="([^"]*)"/g)) el.setAttribute(attr[1], attr[2]);
  }
  document.getElementById = id => elements[id] || elements.player?.querySelector('#' + id) || null;
  document.querySelector = selector => document.getElementById(selector.replace(/^#/, ''));
  const media = new Element(); media.matches = reduced;
  const window = new Element(); window.matchMedia = () => media;
  window.LyricsMotion = { ...M, Controller: class extends M.Controller {
    constructor(options) { super(options); controllers.push(this); }
  } };
  window.LyricsScene = { ...S,
    render(state, options) { lastState = state; return S.render(state, options); },
    patch(root, state) { lastState = state; patchCount++; return S.patch(root, state); },
  };
  const requestAnimationFrame = fn => { frames.set(++serial, fn); return serial; };
  const cancelAnimationFrame = id => frames.delete(id);
  const setTimeout = (fn, ms) => { timers.set(++serial, { fn, due: now + ms }); return serial; };
  const clearTimeout = id => timers.delete(id);
  Object.assign(window, { requestAnimationFrame, cancelAnimationFrame, setTimeout, clearTimeout });
  vm.runInNewContext(fs.readFileSync(path.join(ROOT, 'src/app.js'), 'utf8'), {
    window, document, performance: { now: () => now }, requestAnimationFrame,
    cancelAnimationFrame, setTimeout, clearTimeout, console, location: { search: '' }, URLSearchParams,
  });
  return { elements, document, window, media,
    get state() { return lastState; }, get frames() { return frames.size; },
    get controller() { return controllers.at(-1); }, get htmlWrites() { return htmlWrites; },
    get patchCount() { return patchCount; },
    elapse(seconds) { now += seconds * 1000; },
    step(seconds = 1 / 60) {
      now += seconds * 1000;
      for (const [id, timer] of [...timers]) if (timer.due <= now) { timers.delete(id); timer.fn(); }
      const work = [...frames.values()]; frames.clear(); work.forEach(fn => fn(now));
    },
    advance(seconds, fps = 60) { for (let n = 0; n < Math.ceil(seconds * fps); n++) this.step(1 / fps); },
    systemReduce(matches) { media.matches = matches; media.emit('change', { matches }); },
    pointer(type, y, extra = {}) {
      return elements.player.emit(type, { clientY: 20 + y * scale, clientX: 10 + 150 * scale, ...extra });
    },
    scrub(t) { elements.scrub.value = String(t); elements.scrub.emit('input'); return this; },
    button(id) { elements[id].emit('click'); return this; },
  };
}

function pose(state) { return state.lines.map(({ x, y, w, h, opacity, litOpacity, blur, scale, highlight, active, visible }) => ({ x, y, w, h, opacity, litOpacity, blur, scale, highlight, active, visible })); }
function finite(state) {
  for (const [index, line] of state.lines.entries()) for (const key of ['x', 'y', 'w', 'h', 'opacity', 'litOpacity', 'blur', 'scale', 'highlight'])
    assert.ok(Number.isFinite(line[key]), `line ${index} ${key}: ${line[key]}`);
}
function nearPose(actual, expected) {
  assert.equal(actual.lines.length, expected.lines.length);
  for (let n = 0; n < actual.lines.length; n++) for (const key of ['x', 'y', 'w', 'h', 'opacity', 'litOpacity', 'blur', 'scale', 'highlight'])
    assert.ok(Math.abs(actual.lines[n][key] - expected.lines[n][key]) <= 1e-8, `line ${n} ${key}`);
}

test('runtime initializes one persistent SVG and patches existing line nodes', () => {
  const h = harness();
  assert.equal(h.htmlWrites, 1);
  const nodes = [...h.elements.player.childrenById.entries()];
  assert.ok(nodes.length > 0);
  h.advance(.3);
  for (const [id, node] of nodes) assert.equal(h.elements.player.querySelector('#' + id), node, id);
  assert.equal(h.htmlWrites, 1); assert.ok(h.patchCount > 10); finite(h.state);
  for (const [id, attrs] of Object.entries(S.attributes(h.state))) for (const [key, value] of Object.entries(attrs))
    assert.equal(h.elements.player.querySelector('#' + id).getAttribute(key), String(value), `${id}.${key}`);
});

test('scrub seeks absolute source seconds immediately and pauses playback', () => {
  const h = harness();
  const t = M.referenceSpec.start + .6 * (M.referenceSpec.end - M.referenceSpec.start);
  h.scrub(t);
  assert.deepEqual(pose(h.state), pose(M.referenceAt(t)));
  const before = pose(h.state); h.advance(.8);
  assert.deepEqual(pose(h.state), before); assert.equal(h.frames, 0);
  for (const at of [M.referenceSpec.start, M.referenceSpec.end, t]) {
    h.scrub(at);
    for (const [id, attrs] of Object.entries(S.attributes(h.state))) for (const [key, value] of Object.entries(attrs))
      assert.equal(h.elements.player.querySelector('#' + id).getAttribute(key), String(value), `${id}.${key}`);
  }
});

test('manual takeover at zero displacement preserves every visible line field', () => {
  const h = harness().scrub(M.referenceSpec.start + .43 * (M.referenceSpec.end - M.referenceSpec.start));
  const before = pose(h.state);
  h.pointer('pointerdown', 320); h.pointer('pointermove', 320);
  assert.deepEqual(pose(h.state), before);
  h.pointer('pointercancel', 320); h.advance(1); finite(h.state);
  assert.equal(h.elements.player.captures.size, 0);
});

test('manual scroll displacement is scale independent and ignores secondary pointers', () => {
  const a = harness(), b = harness({ scale: .5 });
  for (const h of [a, b]) {
    h.scrub(M.referenceSpec.start + 1); h.pointer('pointerdown', 280); h.elapse(.2);
    h.pointer('pointermove', 410);
  }
  assert.deepEqual(pose(a.state), pose(b.state));
  const before = pose(a.state);
  a.pointer('pointerdown', 120, { pointerId: 2, isPrimary: false });
  a.pointer('pointermove', 180, { pointerId: 2, isPrimary: false });
  a.pointer('pointerup', 180, { pointerId: 2, isPrimary: false });
  assert.deepEqual(pose(a.state), before);
  for (const h of [a, b]) { h.pointer('pointercancel', 410); h.advance(1); }
});

test('non-primary and non-left-button pointers cannot acquire lyric-scroll ownership', () => {
  const h = harness().scrub(M.referenceSpec.start + 1);
  const before = pose(h.state);
  for (const extra of [{ isPrimary: false, pointerId: 2 }, { button: 2 }]) {
    h.pointer('pointerdown', 280, extra); h.pointer('pointermove', 480, extra);
    assert.deepEqual(pose(h.state), before);
    assert.equal(h.elements.player.captures.size, 0);
    h.pointer('pointerup', 480, extra);
  }
});

test('wheel pixel, line, and page units create bounded manual inspection and can resume following', () => {
  for (const [deltaMode, deltaY, expected] of [[0, 65, -65], [1, 3, -60], [2, 1, -M.referenceSpec.height]]) {
    const h = harness().scrub(M.referenceSpec.start + 1), before = h.state;
    const event = h.elements.player.emit('wheel', { deltaMode, deltaY });
    assert.equal(event.defaultPrevented, true);
    h.state.lines.forEach((line, n) => assert.ok(Math.abs(line.y - before.lines[n].y - expected) < 1e-8));
    assert.equal(h.state.follow, false);
    h.button('follow'); h.advance(1);
    assert.equal(h.state.follow, true);
    nearPose(h.state, M.referenceAt(h.state.time)); assert.equal(h.frames, 0);
  }
});

test('pointer cancellation and lost capture release ownership and return to follow', () => {
  for (const type of ['pointercancel', 'lostpointercapture']) {
    const h = harness().scrub(M.referenceSpec.start + 1);
    h.pointer('pointerdown', 280); h.elapse(.2); h.pointer('pointermove', 480);
    if (type === 'lostpointercapture') h.elements.player.captures.clear();
    h.pointer(type, 480); h.advance(1);
    assert.equal(h.elements.player.captures.size, 0, type);
    assert.deepEqual(pose(h.state), pose(M.referenceAt(Number(h.elements.scrub.value))), type);
    h.pointer('pointerdown', 280); h.pointer('pointermove', 320); h.pointer('pointerup', 320);
    finite(h.state);
  }
});

test('mode commands during pointer capture do not strand later input', () => {
  for (const action of ['play', 'replay', 'reverse', 'follow', 'scrub', 'keyboard']) {
    const h = harness().scrub(M.referenceSpec.start + 1);
    h.pointer('pointerdown', 260); h.pointer('pointermove', 400);
    if (action === 'scrub') h.scrub(M.referenceSpec.start + .5);
    else if (action === 'keyboard') h.elements.player.emit('keydown', { key: 'Escape' });
    else h.button(action);
    assert.doesNotThrow(() => h.pointer('pointermove', 440), action);
    assert.doesNotThrow(() => h.pointer('pointerup', 440), action);
    h.advance(1); finite(h.state);
    assert.equal(h.elements.player.captures.size, 0, action);
    assert.ok(h.frames <= 1, action);
  }
});

test('idle paused frames stop requesting RAF and repeated controls never multiply RAF', () => {
  const h = harness().scrub(M.referenceSpec.start + 1);
  h.advance(1); assert.equal(h.frames, 0);
  for (let n = 0; n < 12; n++) {
    h.button('play'); h.button('reverse'); h.button('follow');
    assert.ok(h.frames <= 1);
  }
  h.scrub(M.referenceSpec.start); h.advance(1); assert.equal(h.frames, 0);
});

test('hidden-page and bfcache clocks do not consume elapsed hidden time', () => {
  for (const lifecycle of ['visibility', 'bfcache']) {
    const a = harness().scrub(M.referenceSpec.start + 1), b = harness().scrub(M.referenceSpec.start + 1);
    a.button('play'); b.button('play'); a.advance(.2); b.advance(.2);
    const before = pose(a.state);
    if (lifecycle === 'visibility') { a.document.hidden = true; a.document.emit('visibilitychange'); }
    else a.window.emit('pagehide', { persisted: true });
    assert.equal(a.frames, 0, lifecycle); a.step(80);
    assert.deepEqual(pose(a.state), before, lifecycle);
    if (lifecycle === 'visibility') { a.document.hidden = false; a.document.emit('visibilitychange'); }
    else a.window.emit('pageshow', { persisted: true });
    a.step(); b.step();
    nearPose(a.state, b.state);
    assert.ok(a.frames <= 1);
  }
});

test('visibility freeze preserves an in-progress follow-return clock as well as playback', () => {
  const a = harness().scrub(M.referenceSpec.start + 1), b = harness().scrub(M.referenceSpec.start + 1);
  for (const h of [a, b]) {
    h.elements.player.emit('wheel', { deltaMode: 0, deltaY: 180 });
    h.button('follow'); h.advance(.1);
  }
  const before = pose(a.state);
  a.document.hidden = true; a.document.emit('visibilitychange'); a.step(80);
  assert.deepEqual(pose(a.state), before);
  a.document.hidden = false; a.document.emit('visibilitychange');
  a.step(); b.step(); nearPose(a.state, b.state);
  a.advance(.8); b.advance(.8); nearPose(a.state, b.state);
  assert.equal(a.frames, 0); assert.equal(a.state.follow, true);
});

test('Space toggles once, key repeats do nothing, arrows seek and pause, and Escape follows', () => {
  const h = harness().scrub(M.referenceSpec.start + 1);
  const space = h.elements.player.emit('keydown', { key: ' ' });
  assert.equal(space.defaultPrevented, true); assert.equal(h.state.playing, true);
  h.elements.player.emit('keydown', { key: ' ', repeat: true });
  assert.equal(h.state.playing, true);
  h.advance(.1);
  const before = h.state.time;
  const right = h.elements.player.emit('keydown', { key: 'ArrowRight' });
  assert.equal(right.defaultPrevented, true); assert.equal(h.state.playing, false);
  assert.ok(Math.abs(h.state.time - before - .1) < 1e-8);
  h.elements.player.emit('keydown', { key: 'ArrowLeft' });
  assert.ok(Math.abs(h.state.time - before) < 1e-8);
  h.elements.player.emit('wheel', { deltaMode: 0, deltaY: 180 });
  const escape = h.elements.player.emit('keydown', { key: 'Escape' });
  assert.equal(escape.defaultPrevented, true); h.advance(1);
  assert.equal(h.state.follow, true); assert.equal(h.frames, 0);
  const poseBefore = pose(h.state);
  const other = h.elements.player.emit('keydown', { key: 'q' });
  assert.equal(other.defaultPrevented, undefined); assert.deepEqual(pose(h.state), poseBefore);
});

test('reduced-motion startup prevents autoplay/replay/reverse but permits explicit still-frame seeking', () => {
  const h = harness({ reduced: true });
  assert.equal(h.state.playing, false); assert.equal(h.elements.play.disabled, true); assert.equal(h.frames, 0);
  for (const id of ['play', 'replay', 'reverse']) {
    h.button(id); h.advance(.1);
    assert.equal(h.state.playing, false); assert.equal(h.frames, 0);
    assert.ok(h.state.lines.every(line => line.blur === 0));
  }
  const t = M.referenceSpec.start + .4 * (M.referenceSpec.end - M.referenceSpec.start);
  h.scrub(t); assert.equal(h.state.time, t);
  h.elements.player.emit('keydown', { key: 'ArrowRight' });
  assert.ok(Math.abs(h.state.time - t - .1) < 1e-8); assert.equal(h.state.playing, false);
});

test('live reduced motion pauses playback, snaps a pending return, and does not auto-resume when disabled', () => {
  const h = harness(); h.advance(.2);
  h.elements.player.emit('wheel', { deltaMode: 0, deltaY: 180 });
  h.button('follow'); h.advance(.1); assert.equal(h.state.follow, false);
  h.systemReduce(true);
  const heldTime = h.state.time;
  assert.equal(h.state.follow, true); assert.equal(h.state.playing, false);
  assert.ok(h.state.lines.every(line => line.blur === 0));
  h.advance(1); assert.equal(h.state.time, heldTime); assert.equal(h.frames, 0);
  h.systemReduce(false); h.advance(.2);
  assert.equal(h.state.playing, false); assert.equal(h.state.time, heldTime); assert.equal(h.frames, 0);
  assert.equal(h.elements.play.disabled, false);
  h.button('play'); h.advance(.1); assert.ok(h.state.time > heldTime);
});

test('SVG has unique attributes, unique IDs, and no nonfinite transform serialization', () => {
  for (const fraction of [0, .13, .39, .67, 1]) {
    const state = M.referenceAt(M.referenceSpec.start + fraction * (M.referenceSpec.end - M.referenceSpec.start));
    const svg = S.render(state), ids = new Set();
    assert.doesNotMatch(svg, /(?:NaN|Infinity)/);
    for (const tag of svg.matchAll(/<[a-zA-Z][^>]*>/g)) {
      const seen = new Set();
      for (const attr of tag[0].matchAll(/\s([\w:-]+)="([^"]*)"/g)) {
        assert.ok(!seen.has(attr[1]), 'duplicate attribute ' + attr[1]); seen.add(attr[1]);
        if (attr[1] === 'id') { assert.ok(!ids.has(attr[2]), 'duplicate id ' + attr[2]); ids.add(attr[2]); }
      }
    }
    if (S.attributes) for (const id of Object.keys(S.attributes(state))) assert.ok(ids.has(id), 'missing dynamic node ' + id);
  }
});

test('independent line geometry and appearance channels affect scene attributes', () => {
  const original = M.referenceAt(M.referenceSpec.start + .5 * (M.referenceSpec.end - M.referenceSpec.start));
  const baseline = S.attributes(original);
  for (const [key, change] of [['x', 17], ['y', 23], ['w', 11], ['opacity', .13], ['litOpacity', .09], ['blur', .7], ['scale', .07], ['highlight', .17]]) {
    const state = structuredClone(original);
    state.lines[0][key] += change;
    assert.notDeepEqual(S.attributes(state), baseline, key + ' must reach the rendered scene');
  }
});
