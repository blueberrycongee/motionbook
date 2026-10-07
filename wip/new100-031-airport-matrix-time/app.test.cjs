'use strict';
// DOM-adapter unit tests. This deliberately is not a browser/runtime fidelity test.
const assert = require('node:assert/strict');
const test = require('node:test');
const fs = require('node:fs');
const vm = require('node:vm');
const MatrixScene = require('./scene');
const MatrixController = require('./controller');

function harness({ reduced = false } = {}) {
  let now = 0, sequence = 0, activeElement = null;
  const frames = new Map();
  class Element {
    constructor(tag = 'div') {
      this.tag = tag; this.style = {}; this.dataset = {}; this.attributes = {};
      this.listeners = {}; this.children = []; this.hidden = false; this.value = '';
      this.textContent = ''; this.html = ''; this.writes = 0;
      this.classList = { toggle() {} };
    }
    set innerHTML(value) { this.html = value; this.writes++; }
    get innerHTML() { return this.html; }
    setAttribute(name, value) { this.attributes[name] = value; }
    removeAttribute(name) { delete this.attributes[name]; }
    addEventListener(name, fn) { (this.listeners[name] ||= []).push(fn); }
    emit(name, details = {}) {
      const event = { target: this, preventDefault() { this.defaultPrevented = true; }, ...details };
      for (const listener of this.listeners[name] || []) listener(event);
      return event;
    }
    focus() { activeElement = this; }
    replaceChildren() { this.children = []; }
    append(child) { this.children.push(child); }
    closest(selector) {
      if (selector === 'button,input' && ['button', 'input'].includes(this.tag)) return this;
      if (selector === '[data-city]' && this.dataset.city) return this;
      return null;
    }
  }
  const elements = Object.fromEntries(['scene','query','city-button','palette-button','results','summary'].map(id => [id, new Element(id === 'query' ? 'input' : id.endsWith('button') ? 'button' : 'div')]));
  const stage = new Element(), themes = [new Element('button'), new Element('button')];
  themes[0].dataset.theme = 'light'; themes[1].dataset.theme = 'dark';
  const document = new Element();
  Object.assign(document, {
    body: new Element(),
    getElementById: id => elements[id],
    querySelector: () => stage,
    querySelectorAll: () => themes,
    createElement: tag => new Element(tag)
  });
  const media = new Element(); media.matches = reduced;
  vm.runInNewContext(fs.readFileSync(require.resolve('./app.js'), 'utf8'), {
    MatrixScene, MatrixController, document,
    performance: { now: () => now }, matchMedia: () => media,
    requestAnimationFrame: fn => { frames.set(++sequence, fn); return sequence; },
    cancelAnimationFrame: id => frames.delete(id)
  }, { filename: 'app.js' });
  function tick(time) {
    now = time;
    const callbacks = [...frames.values()]; frames.clear();
    for (const callback of callbacks) callback(time);
  }
  return { elements, stage, themes, document, media, frames, tick, active: () => activeElement };
}

test('DOM adapter opens, filters, selects by keyboard, restores focus and stops idle redraw', () => {
  const h = harness(), e = h.elements;
  h.tick(0); h.tick(1800);
  assert.equal(h.frames.size, 0);
  const writes = e.scene.writes;
  h.tick(2000);
  assert.equal(e.scene.writes, writes);
  e['city-button'].emit('click');
  assert.equal(e.query.hidden, false);
  assert.equal(h.active(), e.query);
  e.query.value = 'sao'; e.query.emit('input');
  assert.equal(e.results.children.length, 1);
  assert.equal(e.results.children[0].dataset.city, 'São Paulo');
  assert.equal(e.query.emit('keydown', { key: 'ArrowDown' }).defaultPrevented, true);
  assert.equal(e.query.attributes['aria-activedescendant'], 'city-result-0');
  e.query.emit('keydown', { key: 'Enter' });
  assert.equal(e.query.hidden, true);
  assert.equal(h.active(), e['city-button']);
  assert.match(e.summary.textContent, /SAO PAULO/);
  h.tick(2000); h.tick(3800);
  assert.equal(h.frames.size, 0);
});

test('DOM adapter supports pointer selection, outside dismissal and Escape', () => {
  const h = harness(), e = h.elements;
  e['city-button'].emit('click');
  e.results.emit('click', { target: e.results.children[1] });
  assert.match(e['city-button'].attributes['aria-label'], /San Francisco/);
  e['city-button'].emit('click');
  h.stage.emit('click', { target: e.scene });
  assert.equal(e.query.hidden, true);
  e['palette-button'].emit('click');
  assert.ok(h.themes.every(button => !button.hidden));
  h.document.emit('keydown', { key: 'Escape' });
  assert.ok(h.themes.every(button => button.hidden));
  assert.equal(h.active(), e['palette-button']);
});

test('DOM adapter changes theme, handles interruptions and respects reduced motion', () => {
  const h = harness({ reduced: true }), e = h.elements;
  h.tick(0);
  assert.equal(h.frames.size, 0);
  e['palette-button'].emit('click');
  h.themes[0].emit('click'); h.tick(0);
  assert.match(e.scene.innerHTML, /rgb\(235,235,235\)/);
  assert.equal(h.frames.size, 0);
  h.themes[1].emit('click'); h.tick(0);
  assert.match(e.scene.innerHTML, /rgb\(23,23,23\)/);
  assert.equal(h.frames.size, 0);
  h.media.matches = false;
  h.media.emit('change'); h.tick(5000);
  assert.equal(h.frames.size, 0);
});

test('DOM adapter leaves typed r alone and does not hijack modified browser shortcuts', () => {
  const h = harness(), e = h.elements;
  h.tick(1800);
  e['city-button'].emit('click'); h.tick(1800);
  h.document.emit('keydown', { key: 'r', target: e.query });
  assert.equal(h.frames.size, 0);
  h.document.emit('keydown', { key: 'r', ctrlKey: true });
  assert.equal(h.frames.size, 0);
  h.document.emit('keydown', { key: 'r' }); h.tick(1800);
  assert.equal(h.frames.size, 1);
});
