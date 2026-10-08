import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import test from 'node:test';
import * as model from '../src/model.mjs';
import { documents } from '../src/documents.mjs';
import { renderScene } from '../src/scene.mjs';

// This shim does not simulate SVG hit-testing, native DOM layout, or browser focus rules.
test('fake-DOM event regression harness (not browser verification)', () => {
  let now = 0, callbacks = [], timers = [], renders = [], elements = [];
  const capture = new Set(), events = {}, checks = [];
  const body = { closest: () => null };
  const doc = { activeElement: body };
  const reduced = { matches: false };
  const input = {
    value: '', style: {}, setAttribute() {},
    addEventListener(key, handler) { events['input:' + key] = handler; },
    focus() { doc.activeElement = this; }
  };
  const host = {
    addEventListener(key, handler) { events['host:' + key] = handler; },
    querySelectorAll() { return elements; },
    querySelector(selector) {
      const id = selector.match(/data-id="([^"]+)"/)?.[1];
      return elements.find(el => el.attrs.role === 'tab' && el.dataset.id === id);
    },
    setPointerCapture(id) { capture.add(id); },
    hasPointerCapture(id) { return capture.has(id); },
    releasePointerCapture(id) { capture.delete(id); }
  };
  Object.defineProperty(host, 'innerHTML', {
    set(svg) {
      if (elements.includes(doc.activeElement)) doc.activeElement = body;
      elements = [...svg.matchAll(/<g\s([^>]*data-control-key[^>]*)>/g)].map(match => {
        const attrs = Object.fromEntries([...match[1].matchAll(/([\w-]+)="([^"]*)"/g)].map(a => [a[1], a[2]]));
        const dataset = Object.fromEntries(Object.entries(attrs)
          .filter(([key]) => key.startsWith('data-'))
          .map(([key, value]) => [key.slice(5).replace(/-([a-z])/g, (_, char) => char.toUpperCase()), value]));
        return {
          attrs, dataset,
          closest() { return this; },
          getAttribute(key) { return this.attrs[key]; },
          focus() { doc.activeElement = this; }
        };
      });
    }
  });
  const status = {};
  doc.querySelector = id => ({ '#composer': input, '#workspace': host, '#status': status })[id];
  const context = {
    ...model, documents, structuredClone, console,
    performance: { now: () => now },
    renderScene(state, options) {
      renders.push(model.geometry(state, model.layout())?.scale);
      return renderScene(state, options);
    },
    document: doc,
    matchMedia: () => reduced,
    innerWidth: 1280, innerHeight: 1180,
    requestAnimationFrame(handler) { callbacks.push(handler); return callbacks.length; },
    setTimeout(handler) { timers.push(handler); return timers.length; },
    window: { addEventListener(key, handler) { events['window:' + key] = handler; } }
  };
  const source = fs.readFileSync(new URL('../src/app.mjs', import.meta.url), 'utf8').replace(/^import .*\n/gm, '');
  vm.runInNewContext(source, context);
  const demo = context.window.workspaceDemo;
  function run(time) {
    now = time;
    const pending = callbacks;
    callbacks = [];
    for (const callback of pending) callback(time);
  }
  function key(element, name = 'Enter') {
    element.focus();
    events['host:keydown']({ key: name, target: element, preventDefault() {} });
  }
  const get = (type, id, value) => elements.find(el => el.dataset.type === type
    && (id === undefined || el.dataset.id === id)
    && (value === undefined || el.dataset.value === String(value)));
  function check(name, assertion) { assertion(); checks.push(name); }

  run(0);
  demo.dispatch({ type: 'zoom', value: 2 });
  run(75); run(166);
  check('delayed zoom renders exact final target', () => {
    assert.equal(renders.at(-1), 2); assert.equal(callbacks.length, 0);
  });

  demo.dispatch({ type: 'draft', text: 'First' });
  demo.dispatch({ type: 'send' });
  input.value = 'Next';
  events['input:input']();
  events['input:keydown']({ key: 'Enter', shiftKey: false, isComposing: false, preventDefault() {} });
  check('pending Send retains native draft and queues one reply', () => {
    assert.equal(timers.length, 1);
    assert.equal(input.value, 'Next');
    assert.equal(demo.getState().drafts.resume, 'Next');
  });

  demo.dispatch({ type: 'open', id: 'notes' });
  timers[0]();
  check('late reply stays in originating document', () => {
    assert.equal(demo.getState().active, 'notes');
    assert.equal(demo.getState().messages.resume.length, 2);
    assert.equal(demo.getState().messages.notes.length, 0);
  });

  demo.dispatch({ type: 'open', id: 'resume' }); run(190);
  key(get('sidebar')); run(206);
  check('sidebar toggle retains focus', () => assert.equal(doc.activeElement.dataset?.type, 'sidebar'));
  key(doc.activeElement); run(223);
  check('keyboard focus reverses sidebar animation', () => {
    assert.equal(demo.getState().sidebar, true);
    assert.equal(doc.activeElement.dataset?.type, 'sidebar');
  });

  key(get('split')); run(240);
  check('split toggle retains focus', () => assert.equal(doc.activeElement.dataset?.type, 'split'));
  key(doc.activeElement); run(256);

  key(get('menu', 'zoom')); run(272);
  key(get('zoom', undefined, 1.5)); run(290); run(450);
  check('zoom preset returns focus to stable trigger', () => {
    assert.equal(doc.activeElement.dataset?.type, 'menu');
    assert.equal(doc.activeElement.dataset?.id, 'zoom');
    assert.equal(demo.getState().views.resume.zoom, 1.5);
  });

  key(get('menu', 'zoom')); run(466);
  get('zoom', undefined, 1).focus();
  events['window:keydown']({ key: 'Escape', target: doc.activeElement }); run(482);
  check('Escape returns menu focus to opener', () => assert.equal(doc.activeElement.dataset?.id, 'zoom'));

  demo.dispatch({ type: 'open', id: 'notes' }); run(500);
  key(get('close', 'notes')); run(516);
  check('closing tab focuses remaining active tab', () => {
    assert.equal(doc.activeElement.attrs.role, 'tab');
    assert.equal(doc.activeElement.dataset.id, demo.getState().active);
  });

  demo.dispatch({ type: 'zoom', value: 1 }); run(700);
  for (let i = 0; i < 20; i++) events['host:wheel']({
    clientX: 900, clientY: 600, ctrlKey: true, deltaY: 1,
    target: body, preventDefault() {}
  });
  check('small trackpad deltas accumulate beyond snap stop', () => assert.equal(demo.getState().views.resume.zoom, 0.9));

  const thumb = { closest: () => null, hasAttribute: () => true };
  events['host:pointerdown']({
    clientX: 1270, clientY: 300, target: thumb,
    pointerId: 1, pointerType: 'mouse', button: 0, preventDefault() {}
  });
  demo.dispatch({ type: 'open', id: 'chat' });
  events['host:pointermove']({ pointerId: 1, clientX: 1270, clientY: 350 });
  check('drag interrupted by chat tab is safe', () => assert.equal(demo.getState().active, 'chat'));

  demo.dispatch({ type: 'open', id: 'resume' });
  demo.dispatch({ type: 'zoom', value: 'fit' });
  demo.dispatch({ type: 'scrollTo', y: 99999 });
  demo.dispatch({ type: 'split' });
  check('split clamps fit document to changed extent', () => {
    const g = model.geometry(demo.getState(), demo.getLayout());
    assert.ok(g.view.scrollY <= g.maxY);
  });

  input.value = 'One\nTwo\nThree';
  events['input:input'](); run(900);
  check('native textarea geometry follows multiline composer', () => {
    assert.equal(input.style.height, '66px');
    assert.equal(demo.getLayout().composerHeight, 88);
  });

  reduced.matches = true;
  demo.dispatch({ type: 'zoom', value: 2 }); run(920);
  check('reduced-motion zoom immediately renders target', () => assert.equal(renders.at(-1), 2));
  assert.equal(checks.length, 14);
});
