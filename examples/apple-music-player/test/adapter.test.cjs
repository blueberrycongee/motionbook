'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const M = require('../src/motion.js');
const S = require('../src/scene.js');
const ROOT = path.join(__dirname, '..');

// Dependency-free event/attribute simulation, deliberately not a browser or
// accessibility-tree test. Real layout, touch latency, and paint are unverified.
function harness({ reduced = false, scale = 1 } = {}) {
  let now = 0, next = 0, renderCount = 0, htmlWrites = 0, lastState;
  const frames = new Map(), controllers = [];
  class Element {
    constructor(id = '', tagName = 'DIV') {
      this.id = id;
      this.tagName = tagName;
      this.handlers = {};
      this.attrs = {};
      this.dataset = {};
      this.childrenById = new Map();
      this.style = {};
      this.value = '';
      this.textContent = '';
      this.hidden = false;
      this.disabled = false;
      this.captures = new Set();
    }
    addEventListener(name, fn) { (this.handlers[name] ||= []).push(fn); }
    removeEventListener(name, fn) { this.handlers[name] = (this.handlers[name] || []).filter(f => f !== fn); }
    setAttribute(name, value) {
      this.attrs[name] = String(value);
      if (name.startsWith('data-')) this.dataset[name.slice(5).replace(/-([a-z])/g, (_, c) => c.toUpperCase())] = String(value);
    }
    getAttribute(name) { return this.attrs[name] ?? null; }
    removeAttribute(name) { delete this.attrs[name]; }
    getBoundingClientRect() { return { top: 20, left: 10, width: M.W * scale, height: M.H * scale }; }
    setPointerCapture(id) { this.captures.add(id); }
    hasPointerCapture(id) { return this.captures.has(id); }
    releasePointerCapture(id) { this.captures.delete(id); }
    focus() { document.activeElement = this; }
    closest(selector) { return /button|input|select|textarea|a/.test(selector) && ['BUTTON', 'INPUT', 'SELECT', 'TEXTAREA', 'A'].includes(this.tagName) ? this : null; }
    querySelector(selector) { return this.childrenById.get(selector.replace(/^#/, '')) || null; }
    querySelectorAll(selector) { return selector === '[id]' ? [...this.childrenById.values()] : []; }
    emit(type, props = {}) {
      const event = { type, target: this, currentTarget: this, pointerId: 1, button: 0, isPrimary: true,
        clientX: 100, clientY: 820, preventDefault() { this.defaultPrevented = true; }, stopPropagation() {}, ...props };
      for (const fn of this.handlers[type] || []) fn(event);
      return event;
    }
    set innerHTML(value) {
      this._html = value;
      htmlWrites++;
      this.childrenById.clear();
      for (const match of value.matchAll(/<([\w:-]+)\b[^>]*\bid="([^"]+)"[^>]*>/g)) {
        const child = new Element(match[2], match[1].toUpperCase());
        for (const attr of match[0].matchAll(/([\w:-]+)="([^"]*)"/g)) child.setAttribute(attr[1], attr[2]);
        this.childrenById.set(child.id, child);
      }
    }
    get innerHTML() { return this._html; }
  }
  const document = new Element();
  document.hidden = false;
  const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
  const elements = {};
  for (const match of html.matchAll(/<([\w:-]+)\b[^>]*\bid="([^"]+)"[^>]*>/g)) {
    const element = elements[match[2]] = new Element(match[2], match[1].toUpperCase());
    for (const attr of match[0].matchAll(/([\w:-]+)="([^"]*)"/g)) element.setAttribute(attr[1], attr[2]);
  }
  document.getElementById = id => elements[id] || null;
  document.querySelector = selector => elements[selector.replace(/^#/, '')] || null;
  const media = new Element();
  media.matches = reduced;
  const window = new Element();
  window.matchMedia = () => media;
  window.PlayerMotion = { ...M, Controller: class extends M.Controller {
    constructor(options) { super(options); controllers.push(this); }
  } };
  window.PlayerScene = { ...S,
    render(state) { lastState = state; return S.render(state); },
    patch(root, state) { lastState = state; renderCount++; return S.patch(root, state); },
  };
  const requestAnimationFrame = fn => { frames.set(++next, fn); return next; };
  const cancelAnimationFrame = id => frames.delete(id);
  Object.assign(window, { requestAnimationFrame, cancelAnimationFrame });
  const context = { window, document, performance: { now: () => now },
    requestAnimationFrame, cancelAnimationFrame, console, setTimeout, clearTimeout,
    location: { search: '' }, URLSearchParams };
  vm.runInNewContext(fs.readFileSync(path.join(ROOT, 'src/app.js'), 'utf8'), context);
  return { elements, document, window, media,
    get state() { return lastState; }, get frames() { return frames.size; },
    get controller() { return controllers.at(-1); }, get renderCount() { return renderCount; },
    get htmlWrites() { return htmlWrites; },
    elapse(seconds) { now += seconds * 1000; },
    step(seconds = 1 / 60) {
      now += seconds * 1000;
      const work = [...frames.values()]; frames.clear(); work.forEach(fn => fn(now));
    },
    advance(seconds) { for (let n = 0; n < Math.ceil(seconds * 60); n++) this.step(); },
    systemReduce(matches) { media.matches = matches; media.emit('change', { matches }); },
    pointer(type, y, extra = {}) { return elements.player.emit(type, { clientY: 20 + y * scale, clientX: 10 + 210 * scale, ...extra }); },
    tap(y = 820) {
      this.pointer('pointerdown', y); this.pointer('pointerup', y);
      elements.player.emit('click', { clientY: 20 + y * scale, clientX: 10 + 210 * scale, detail: 1 });
    },
    interactive() { elements.interactive.emit('click'); return this; },
    expand() { elements.expand.emit('click'); this.advance(2); return this; },
  };
}

test('reference initializes once and patches the persistent SVG and shared cover', () => {
  const h = harness();
  assert.equal(h.htmlWrites, 1);
  assert.equal(h.elements.replay.getAttribute('aria-pressed'), 'true');
  assert.equal(h.frames, 1);
  const cover = h.elements.player.querySelector('#shared-cover');
  assert.ok(cover);
  h.advance(.8);
  assert.equal(h.elements.player.querySelector('#shared-cover'), cover);
  assert.equal(h.htmlWrites, 1);
  assert.ok(h.renderCount > 0);
  assert.ok(Number(h.elements.scrub.value) >= M.referenceSpec.start);
});

test('expanded and compact buttons reach endpoints and keep aria-expanded current', () => {
  const h = harness();
  h.expand();
  assert.equal(h.state.progress, 1);
  assert.equal(h.elements.player.getAttribute('aria-expanded'), 'true');
  h.elements.collapse.emit('click'); h.advance(2);
  assert.equal(h.state.progress, 0);
  assert.equal(h.elements.player.getAttribute('aria-expanded'), 'false');
});

test('mid-animation button reversal keeps current progress and only one pending frame', () => {
  const h = harness();
  h.elements.expand.emit('click'); h.advance(.12);
  const before = h.state.progress;
  h.elements.collapse.emit('click');
  assert.equal(h.state.progress, before);
  assert.ok(h.frames <= 1);
  h.advance(2); assert.equal(h.state.progress, 0);
});

test('idle interactive and paused scrub modes stop requesting animation frames', () => {
  const h = harness().interactive();
  h.advance(1.2); // Allow the optional source-pose handoff to finish first.
  assert.equal(h.frames, 0);
  h.elements.scrub.value = String((M.referenceSpec.start + M.referenceSpec.end) / 2);
  h.elements.scrub.emit('input'); h.step();
  assert.equal(h.frames, 0);
});

test('source scrub uses absolute seconds, patches immediately, and pauses replay', () => {
  const h = harness();
  const t = (M.referenceSpec.start + M.referenceSpec.end) / 2;
  h.elements.scrub.value = String(t); h.elements.scrub.emit('input');
  assert.deepEqual(h.state, M.referenceAt(t));
  assert.equal(h.elements.replay.getAttribute('aria-pressed'), 'false');
  assert.equal(h.elements['time-label'].textContent, t.toFixed(3) + ' s');
  const before = JSON.stringify(h.state); h.advance(.3);
  assert.equal(JSON.stringify(h.state), before);
});

test('one pointer tap expands, drag takeover closes, and a second pointer is ignored', () => {
  const h = harness().interactive();
  h.tap(); h.advance(2); assert.equal(h.state.progress, 1);
  h.pointer('pointerdown', 150);
  h.pointer('pointerdown', 250, { pointerId: 2 });
  h.elapse(.5); h.pointer('pointermove', 700);
  const moved = h.state.progress;
  assert.ok(moved > 0 && moved < 1);
  h.pointer('pointermove', 0, { pointerId: 2 });
  assert.equal(h.state.progress, moved);
  h.pointer('pointerup', 700); h.advance(2);
  assert.equal(h.state.progress, 0);
});

test('pointer coordinates normalize to source pixels at responsive sizes', () => {
  const a = harness({ scale: 1 }).expand();
  const b = harness({ scale: .5 }).expand();
  for (const h of [a, b]) {
    h.pointer('pointerdown', 150); h.elapse(.2); h.pointer('pointermove', 350);
  }
  assert.equal(a.state.progress, b.state.progress);
  assert.ok(a.state.progress < 1 && a.state.progress > .5);
});

test('pointercancel restores the pre-drag endpoint rather than committing the displacement', () => {
  const h = harness().expand();
  h.pointer('pointerdown', 100); h.elapse(.5); h.pointer('pointermove', 800);
  assert.ok(h.state.progress < .5);
  h.pointer('pointercancel', 800); h.advance(2);
  assert.equal(h.state.progress, 1);
  assert.equal(h.elements.player.captures.size, 0);
});

test('lost pointer capture cancels safely, and the next gesture still works', () => {
  const h = harness().expand();
  h.pointer('pointerdown', 100); h.elapse(.3); h.pointer('pointermove', 500);
  h.elements.player.captures.clear();
  h.pointer('lostpointercapture', 500); h.advance(2);
  assert.equal(h.state.progress, 1);
  h.pointer('pointerdown', 100); h.elapse(.5); h.pointer('pointermove', 900);
  h.pointer('pointerup', 900); h.advance(2);
  assert.equal(h.state.progress, 0);
});

test('button and keyboard commands during a captured drag cannot strand or crash subsequent input', () => {
  for (const action of ['expand', 'collapse', 'replay', 'keyboard', 'scrub']) {
    const h = harness().expand();
    h.pointer('pointerdown', 100); h.elapse(.1); h.pointer('pointermove', 250);
    if (action === 'keyboard') h.elements.player.emit('keydown', { key: 'Escape' });
    else if (action === 'scrub') {
      h.elements.scrub.value = String(M.referenceSpec.start); h.elements.scrub.emit('input');
    } else h.elements[action].emit('click');
    assert.doesNotThrow(() => h.pointer('pointermove', 350), action + ' then pointermove');
    assert.doesNotThrow(() => h.pointer('pointerup', 350), action + ' then pointerup');
    h.advance(2);
    assert.ok(Number.isFinite(h.state.progress));
    assert.equal(h.elements.player.captures.size, 0);
  }
});

test('Enter and Space activate once; repeat is ignored, and Escape closes', () => {
  const h = harness().interactive();
  const first = h.elements.player.emit('keydown', { key: 'Enter', repeat: false });
  assert.equal(first.defaultPrevented, true);
  h.elements.player.emit('keydown', { key: 'Enter', repeat: true });
  h.advance(2); assert.equal(h.state.progress, 1);
  h.elements.player.emit('keydown', { key: 'Escape' }); h.advance(2);
  assert.equal(h.state.progress, 0);
  h.elements.player.emit('keydown', { key: ' ' }); h.advance(2);
  assert.equal(h.state.progress, 1);
});

test('assistive click activation works without pointer events', () => {
  const h = harness().interactive();
  h.elements.player.emit('click', { detail: 0 }); h.advance(2);
  assert.equal(h.state.progress, 1);
});

test('compact library content outside the mini-player does not start a gesture', () => {
  const h = harness().interactive();
  h.pointer('pointerdown', 220);
  assert.notEqual(h.controller.mode, 'dragging');
  assert.equal(h.elements.player.captures.size, 0);
  h.pointer('pointerup', 220); h.advance(2);
  assert.equal(h.state.progress, 0);
});

test('reduced motion initializes with no auto-replay and snaps endpoint commands immediately', () => {
  const h = harness({ reduced: true });
  assert.equal(h.elements.replay.getAttribute('aria-pressed'), 'false');
  h.elements.expand.emit('click');
  assert.equal(h.state.progress, 1);
  assert.equal(h.frames, 0);
  h.elements.collapse.emit('click');
  assert.equal(h.state.progress, 0);
  assert.equal(h.frames, 0);
});

test('system reduced motion also blocks reference replay from being restarted', () => {
  const h = harness({ reduced: true });
  h.elements.replay.emit('click'); h.advance(.5);
  assert.notEqual(h.elements.replay.getAttribute('aria-pressed'), 'true');
  assert.equal(h.frames, 0);
});

test('reduced-motion lost capture and mode-button cancellation render the restored endpoint immediately', () => {
  for (const cancellation of ['lostpointercapture', 'interactive', 'visibilitychange']) {
    const h = harness({ reduced: true });
    h.elements.expand.emit('click');
    h.pointer('pointerdown', 100); h.elapse(.2); h.pointer('pointermove', 400);
    assert.ok(h.state.progress > 0 && h.state.progress < 1);
    if (cancellation === 'lostpointercapture') {
      h.elements.player.captures.clear(); h.pointer('lostpointercapture', 400);
    } else if (cancellation === 'interactive') h.elements.interactive.emit('click');
    else {
      h.document.hidden = true; h.document.emit('visibilitychange');
      h.document.hidden = false; h.document.emit('visibilitychange');
    }
    assert.equal(h.controller.progress, 1, cancellation + ' model endpoint');
    assert.equal(h.state.progress, 1, cancellation + ' visible endpoint');
    assert.equal(h.frames, 0);
  }
});

test('live system preference pauses the exact replay frame without further animation', () => {
  const h = harness();
  h.advance(.5);
  const before = JSON.stringify(h.state);
  h.systemReduce(true); h.step();
  assert.equal(JSON.stringify(h.state), before);
  assert.equal(h.frames, 0);
  assert.equal(h.elements.replay.getAttribute('aria-pressed'), 'false');
});

test('keyboard toggle from an expanded reference frame closes the visible player', () => {
  const h = harness();
  const expanded = M.data.samples.reduce((best, row) => row.cardY < best.cardY ? row : best);
  h.elements.scrub.value = String(expanded.t); h.elements.scrub.emit('input');
  assert.ok(h.state.progress > .95);
  h.elements.player.emit('keydown', { key: 'Enter' }); h.advance(2);
  assert.equal(h.state.progress, 0);
});

test('taking over the independent closing reference preserves every visible layer at zero input delta', () => {
  const observations = M.data.samples.filter(row => row.t >= M.referenceSpec.start && row.t <= M.referenceSpec.end);
  // Find the observation where the independent reference channels differ most
  // from the supplemental progress model. This prevents testing only the easy
  // opening path, where those trajectories happen to align fairly closely.
  const selected = observations.reduce((best, row) => {
    const state = M.referenceAt(row.t), model = M.stateForProgress(state.progress);
    const delta = Math.abs(state.cover.size - model.cover.size);
    return delta > best.delta ? { t: row.t, delta } : best;
  }, { t: M.referenceSpec.start, delta: -1 });
  for (const action of ['drag', 'expand', 'collapse']) {
    const h = harness();
    h.elements.scrub.value = String(selected.t); h.elements.scrub.emit('input');
    const before = S.attributes(h.state);
    if (action === 'drag') {
      h.pointer('pointerdown', 550); h.pointer('pointermove', 550);
    } else h.elements[action].emit('click');
    assert.deepEqual(S.attributes(h.state), before, action + ' keeps the current rendered pose');
    if (action === 'drag') h.pointer('pointerup', 550);
    h.advance(3);
    assert.ok(h.state.progress === 0 || h.state.progress === 1, action + ' reaches an endpoint');
    assert.deepEqual(S.attributes(h.state), S.attributes(M.stateForProgress(h.state.progress)), action + ' converges to the final model geometry');
    assert.equal(h.frames, 0);
  }
});

test('drag takeover from an already paused source frame schedules the time-based pose correction', () => {
  const h = harness();
  const row = M.data.samples.filter(row => row.t >= M.referenceSpec.start && row.t <= M.referenceSpec.end)
    .reduce((best, row) => {
      const s = M.referenceAt(row.t);
      const delta = Math.abs(s.cover.size - M.stateForProgress(s.progress).cover.size);
      return delta > best.delta ? { t: row.t, delta } : best;
    }, { t: M.referenceSpec.start, delta: -1 });
  h.elements.scrub.value = String(row.t); h.elements.scrub.emit('input');
  h.step(); assert.equal(h.frames, 0);
  h.pointer('pointerdown', 550); h.pointer('pointermove', 550);
  assert.equal(h.frames, 1, 'handoff clock must not age invisibly between pointer events');
  h.advance(1.2);
  assert.deepEqual(S.attributes(h.state), S.attributes(M.stateForProgress(h.controller.progress)));
  assert.equal(h.frames, 0);
  h.pointer('pointercancel', 550); h.advance(2);
  assert.ok(h.state.progress === 0 || h.state.progress === 1);
});

test('visibility pauses source replay and resumes without a long hidden-time jump', () => {
  const h = harness(); h.advance(.2);
  const before = h.state;
  h.document.hidden = true; h.document.emit('visibilitychange');
  assert.equal(h.frames, 0); h.step(80);
  assert.deepEqual(h.state, before);
  const sourceBefore = Number(h.elements.scrub.value);
  h.document.hidden = false; h.document.emit('visibilitychange'); h.step();
  assert.ok(Number(h.elements.scrub.value) - sourceBefore < .02);
});

test('visibility pauses interactive settling without jumping straight to its endpoint', () => {
  const h = harness(); h.elements.expand.emit('click'); h.advance(.1);
  const before = h.state.progress;
  assert.ok(before > 0 && before < 1);
  h.document.hidden = true; h.document.emit('visibilitychange'); h.step(80);
  assert.equal(h.state.progress, before);
  h.document.hidden = false; h.document.emit('visibilitychange'); h.step();
  assert.ok(h.state.progress < 1);
  assert.ok(h.state.progress - before < .2);
  h.advance(2); assert.equal(h.state.progress, 1);
});

test('visibility pause freezes the supplemental per-layer handoff clock as well as controller time', () => {
  const row = M.data.samples.filter(row => row.t >= M.referenceSpec.start && row.t <= M.referenceSpec.end)
    .reduce((best, row) => {
      const s = M.referenceAt(row.t);
      const delta = Math.abs(s.cover.size - M.stateForProgress(s.progress).cover.size);
      return delta > best.delta ? { t: row.t, delta } : best;
    }, { t: M.referenceSpec.start, delta: -1 });
  const paused = harness(), control = harness();
  for (const h of [paused, control]) {
    h.elements.scrub.value = String(row.t); h.elements.scrub.emit('input');
    h.elements.interactive.emit('click'); h.advance(.1);
  }
  paused.document.hidden = true; paused.document.emit('visibilitychange'); paused.step(80);
  paused.document.hidden = false; paused.document.emit('visibilitychange');
  paused.step(); control.step();
  assert.deepEqual(S.attributes(paused.state), S.attributes(control.state));
});

test('page lifecycle stops pending frames and resumes a bfcache-restored reference', () => {
  const h = harness(); h.window.emit('pagehide');
  assert.equal(h.frames, 0);
  h.window.emit('pageshow', { persisted: true });
  assert.equal(h.frames, 1);
});

test('SVG outputs have unique attributes and persistent dynamic node identifiers', () => {
  for (const p of [0, .25, .5, .75, 1]) {
    const svg = S.render(M.stateForProgress(p));
    const ids = new Set();
    for (const tag of svg.matchAll(/<[a-zA-Z][^>]*>/g)) {
      const seen = new Set();
      for (const attr of tag[0].matchAll(/\s([\w:-]+)="([^"]*)"/g)) {
        assert.ok(!seen.has(attr[1]), 'duplicate attribute ' + attr[1]);
        seen.add(attr[1]);
        if (attr[1] === 'id') { assert.ok(!ids.has(attr[2]), 'duplicate id ' + attr[2]); ids.add(attr[2]); }
      }
    }
    for (const id of Object.keys(S.attributes(M.stateForProgress(p)))) assert.ok(ids.has(id), 'missing dynamic node ' + id);
    assert.equal((svg.match(/id="shared-cover"/g) || []).length, 1);
  }
});

test('responsive CSS scales the root SVG without overriding nested thumbnail dimensions', () => {
  const css = fs.readFileSync(path.join(ROOT, 'style.css'), 'utf8');
  assert.ok(!/#player\s+svg\s*\{[^}]*width\s*:\s*100%/.test(css), 'descendant selector overrides nested SVG dimensions');
  assert.match(css, /#player\s*>\s*svg\s*\{/);
});

test('rapid keyboard and assistive activation reverse the pending endpoint before halfway', () => {
  for (const input of ['Enter', ' ', 'assistive click']) {
    for (const initial of [0, 1]) {
      const h = harness().interactive(); h.advance(1.2);
      if (initial) h.expand();
      const activate = () => input === 'assistive click'
        ? h.elements.player.emit('click', { detail: 0 })
        : h.elements.player.emit('keydown', { key: input, repeat: false });
      activate(); h.advance(.05);
      assert.ok(initial ? h.state.progress > .5 : h.state.progress < .5);
      activate();
      assert.equal(h.controller.target, initial, input + ' reverses the pending target');
      assert.ok(h.frames <= 1);
      h.advance(2); assert.equal(h.state.progress, initial);
      activate(); h.advance(.03); activate(); h.advance(.03); activate();
      h.advance(2); assert.equal(h.state.progress, 1 - initial);
    }
  }
});

test('held activation keys suppress their browser default without repeating the command', () => {
  const h = harness().interactive(); h.advance(1.2);
  h.elements.player.emit('keydown', { key: ' ' });
  for (const key of [' ', 'Enter', 'Escape']) {
    const repeated = h.elements.player.emit('keydown', { key, repeat: true });
    assert.equal(repeated.defaultPrevented, true, JSON.stringify(key));
    assert.equal(h.controller.target, 1);
  }
  h.advance(2); assert.equal(h.state.progress, 1);
});
