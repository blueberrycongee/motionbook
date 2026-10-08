import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import test from 'node:test';
import * as model from '../src/model.mjs';
import { documents } from '../src/documents.mjs';
import { renderScene } from '../src/scene.mjs';

// This shim does not simulate SVG hit-testing, native DOM layout, or browser focus rules.
test('fake-DOM event regression harness (not browser verification)', () => {
  let now = 0, callbacks = [], microtasks = [], timers = [], renders = [], elements = [], lastScene = '';
  const capture = new Set(), events = {}, checks = [];
  const body = { closest: () => null };
  const doc = { activeElement: body };
  const reduced = { matches: false };
  const input = {
    value: '', style: {}, setAttribute() {},
    addEventListener(key, handler) { events['input:' + key] = handler; },
    focus() { if (doc.activeElement !== this) { doc.activeElement = this; events['input:focus']?.(); } },
    blur(relatedTarget = null) { if (doc.activeElement === this) { doc.activeElement = relatedTarget || body; events['input:blur']?.({ relatedTarget }); } }
  };
  let contentScrollHeight;
  Object.defineProperty(input, 'scrollHeight', {
    get() { return contentScrollHeight === undefined ? undefined : Math.max(contentScrollHeight, parseFloat(this.style.height) || 22); },
    set(value) { contentScrollHeight = value; }
  });
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
  function ownedAt(svg, offset) {
    const groups = [];
    for (const token of svg.slice(0, offset).matchAll(/<\/?g(?:\s[^>]*)?>/g)) {
      if (token[0].startsWith('</')) groups.pop();
      else groups.push(token[0].includes('data-composer-owned'));
    }
    return groups.some(Boolean);
  }
  Object.defineProperty(host, 'innerHTML', {
    set(svg) {
      lastScene = svg;
      if (elements.includes(doc.activeElement)) doc.activeElement = body;
      elements = [...svg.matchAll(/<g\s([^>]*data-control-key[^>]*)>/g)].map(match => {
        const attrs = Object.fromEntries([...match[1].matchAll(/([\w-]+)="([^"]*)"/g)].map(a => [a[1], a[2]]));
        const dataset = Object.fromEntries(Object.entries(attrs)
          .filter(([key]) => key.startsWith('data-'))
          .map(([key, value]) => [key.slice(5).replace(/-([a-z])/g, (_, char) => char.toUpperCase()), value]));
        const owned = ownedAt(svg, match.index);
        return {
          attrs, dataset,
          closest(selector) {
            if (selector === '[data-composer-owned]') return owned ? this : null;
            return this;
          },
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
    queueMicrotask(handler) { microtasks.push(handler); },
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
    while (microtasks.length) microtasks.shift()();
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
  const shell = { closest: selector => selector === '[data-composer-shell]' ? shell : null };
  let prevented = 0;
  for (let i = 0; i < 3; i++) events['host:mousedown']({ button: 0, target: shell, preventDefault() { prevented++; } });
  check('repeated left clicks in composer whitespace focus the stable input', () => {
    assert.equal(doc.activeElement, input);
    assert.equal(prevented, 3);
    assert.equal(demo.getState().nextRequest, 1);
    assert.equal(demo.getLayout().composerHeight, 44);
  });
  doc.activeElement = body;
  events['host:mousedown']({ button: 2, target: shell, preventDefault() { prevented++; } });
  events['host:mousedown']({ button: 0, target: body, preventDefault() { prevented++; } });
  const nestedControl = { closest: () => shell };
  events['host:mousedown']({ button: 0, target: nestedControl, preventDefault() { prevented++; } });
  check('right click, document click, and nested controls are not intercepted', () => {
    assert.equal(doc.activeElement, body);
    assert.equal(prevented, 3);
  });
  demo.dispatch({ type: 'requestChanges' });
  input.value = 'Make this shorter';
  events['input:input'](); run(1);
  check('change-request placeholder survives typing and redraw', () => {
    assert.equal(input.placeholder, 'What would you like to change?');
    assert.equal(doc.activeElement, input);
    assert.equal(demo.getState().requestContext, 'resume');
  });
  demo.dispatch({ type: 'resize' });
  check('unrelated actions retain change-request placeholder', () => {
    assert.equal(input.placeholder, 'What would you like to change?');
  });
  events['window:keydown']({ key: 'Escape', target: input });
  check('Escape clears change-request placeholder but retains draft', () => {
    assert.equal(input.placeholder, 'Ask anything');
    assert.equal(demo.getState().requestContext, null);
    assert.equal(input.value, 'Make this shorter');
    assert.equal(demo.getState().drafts.resume, 'Make this shorter');
  });
  demo.dispatch({ type: 'requestChanges' });
  demo.dispatch({ type: 'open', id: 'notes' });
  check('document switch cannot leak a change-request placeholder', () => {
    assert.equal(input.placeholder, 'Ask anything');
    assert.equal(demo.getState().requestContext, null);
    assert.equal(input.value, '');
    assert.equal(doc.activeElement, body);
    assert.equal(demo.getState().composerFocused, false);
  });
  demo.dispatch({ type: 'open', id: 'resume' });
  demo.dispatch({ type: 'draft', text: '' }); input.value = '';
  demo.dispatch({ type: 'zoom', value: 2 });
  run(75); run(166);
  check('delayed zoom renders exact final target', () => {
    assert.equal(renders.at(-1), 2); assert.equal(callbacks.length, 0);
  });

  demo.dispatch({ type: 'draft', text: 'First' });
  demo.dispatch({ type: 'requestChanges' });
  demo.dispatch({ type: 'send' });
  check('successful Send clears change-request placeholder with its context', () => {
    assert.equal(input.placeholder, 'Ask anything');
    assert.equal(demo.getState().requestContext, null);
  });
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
  events['input:input'](); run(900); run(1220);
  check('native textarea geometry follows multiline composer', () => {
    assert.equal(input.style.height, '66px');
    assert.equal(demo.getLayout().composerHeight, 118);
  });

  reduced.matches = true;
  demo.dispatch({ type: 'zoom', value: 2 }); run(1240);
  check('reduced-motion zoom immediately renders target', () => assert.equal(renders.at(-1), 2));
  input.focus(); input.value = '';
  events['input:input'](); run(1260);
  check('reduced-motion composer immediately settles without CSS double-animation', () => {
    assert.equal(input.style.height, '22px');
    assert.equal(demo.getLayout().composerHeight, 44);
  });
  reduced.matches = false;
  input.value = 'One\nTwo'; events['input:input'](); run(1360);
  const halfway = demo.getLayout();
  check('native input and SVG share an intermediate composer geometry', () => {
    assert.ok(halfway.composerHeight > 44 && halfway.composerHeight < 96);
    assert.equal(input.style.top, `${halfway.inputY}px`);
    assert.equal(input.style.height, `${halfway.bodyHeight}px`);
  });
  input.value = ''; events['input:input']();
  check('clearing midway reverses from the visible geometry', () => {
    assert.equal(demo.getLayout().composerHeight, halfway.composerHeight);
  });
  run(1680);
  check('reversed composer reaches its exact compact endpoint', () => {
    assert.equal(demo.getLayout().composerHeight, 44);
    assert.equal(input.style.height, '22px');
  });
  input.value = 'Overflow example'; input.scrollHeight = 44;
  events['input:input'](); run(2000);
  input.value = 'x'; input.scrollHeight = 22;
  events['input:input'](); input.blur(); run(2020);
  events['window:keydown']({ key: 'Escape', target: body }); run(2040);
  check('measured overflow remains stacked after shortening, blur, and Escape', () => {
    assert.equal(demo.getState().multiline.resume, true);
    assert.equal(demo.getState().drafts.resume, 'x');
    assert.equal(demo.getState().composerFocused, false);
    assert.equal(demo.getLayout().composerHeight, 96);
  });
  input.value = ''; input.scrollHeight = 22;
  events['input:input'](); run(2050);
  input.value = 'short'; events['input:input']();
  check('typing during collapse measures compact content rather than the animated client height', () => {
    assert.ok(parseFloat(input.style.height) > 22);
    assert.ok(input.scrollHeight > 24);
    assert.equal(demo.getState().multiline.resume, false);
    assert.equal(demo.getState().drafts.resume, 'short');
  });
  run(2380);
  input.scrollHeight = 44;
  events['window:resize'](); run(2400);
  check('layout overflow after resize is measured even without a new input event', () => {
    assert.equal(demo.getState().multiline.resume, true);
  });
  run(2720);
  input.focus();
  const pressedSend = get('send');
  events['host:pointerdown']({ target: pressedSend, button: 0, pointerId: 5 });
  input.blur(pressedSend); pressedSend.focus(); run(2740);
  check('input blur does not replace a pressed Send target before its click', () => {
    assert.equal(get('send'), pressedSend);
    const request = demo.getState().nextRequest;
    events['host:pointerup']({ pointerId: 5 });
    events['host:click']({ target: pressedSend });
    assert.equal(demo.getState().nextRequest, request + 1);
  });
  run(3100);
  if (demo.getState().split) demo.dispatch({ type: 'split' });
  input.focus(); run(3450);
  check('native focus reveals the conversation header without opening transcript', () => {
    assert.equal(demo.getLayout().headerHeight, 46);
    assert.equal(demo.getState().drawer, false);
    assert.ok(get('composerMinimize'));
    assert.ok(get('menu', 'dock'));
  });
  const blankHeader = {
    closest: selector => ['[data-composer-owned]', '[data-composer-header]'].includes(selector) ? blankHeader : null,
    hasAttribute: () => false
  };
  let headerDefaultPrevented = false;
  events['host:pointerdown']({ target: blankHeader, button: 0, pointerId: 6 });
  events['host:mousedown']({ target: blankHeader, button: 0, preventDefault() { headerDefaultPrevented = true; } });
  events['window:pointerdown']({ target: blankHeader }); run(3480);
  events['window:pointerup']({ pointerId: 6 });
  events['host:click']({ target: blankHeader }); run(3820);
  check('blank header press retains focus and separately expands transcript', () => {
    assert.equal(headerDefaultPrevented, true);
    assert.equal(demo.getState().drawer, true);
    assert.equal(demo.getLayout().surfaceHeight, 640);
  });
  const transcript = { closest: selector => selector === '[data-composer-owned]' ? transcript : null, hasAttribute: () => false };
  const readingBefore = demo.getState().views.resume.scrollY;
  events['window:pointerdown']({ target: transcript });
  events['host:pointerdown']({ target: transcript, pointerType: 'touch', pointerId: 7, clientX: 850, clientY: 800, preventDefault() { throw new Error('Composer touch must not drag the document'); } });
  events['host:wheel']({ target: transcript, clientX: 850, clientY: 800, deltaY: 100, preventDefault() { throw new Error('Composer wheel must not scroll the document'); } });
  check('transcript interaction remains owned and does not move the document', () => {
    assert.equal(ownedAt(lastScene, lastScene.indexOf('id="conversationClip"')), true);
    assert.equal(demo.getState().drawer, true);
    assert.equal(demo.getState().views.resume.scrollY, readingBefore);
  });
  const grip = get('menu', 'dock');
  let gripDefaultPrevented = false;
  events['host:mousedown']({ target: grip, button: 0, preventDefault() { gripDefaultPrevented = true; } });
  events['host:click']({ target: grip }); run(3840);
  check('Dock grip preserves native focus and opens its menu', () => {
    assert.equal(gripDefaultPrevented, true);
    assert.equal(demo.getState().menu, 'dock');
    assert.ok(get('dockChoice', 'full'));
  });
  demo.dispatch({ type: 'menu', menu: 'dock' }); run(3860);
  const minimize = get('composerMinimize');
  events['host:pointerdown']({ target: minimize, button: 0, pointerId: 8 });
  events['window:pointerdown']({ target: minimize });
  input.blur(minimize); run(3880);
  events['window:pointerup']({ pointerId: 8 });
  events['host:click']({ target: minimize }); run(4220);
  events['window:pointerdown']({ target: body }); run(4240);
  const restore = get('composerRestore');
  assert.equal(restore.closest('[data-composer-owned]'), restore);
  events['host:pointerdown']({ target: restore, button: 0, pointerId: 9 });
  events['window:pointerdown']({ target: restore });
  events['window:pointerup']({ pointerId: 9 });
  events['host:click']({ target: restore }); run(4600);
  check('minimize, outside click, and restore preserve expanded presentation and refocus input', () => {
    assert.equal(demo.getState().drawer, true);
    assert.equal(demo.getState().composerMinimized, false);
    assert.equal(doc.activeElement, input);
    assert.equal(input.style.display, '');
  });
  events['window:keydown']({ key: 'Escape', target: input }); run(4940);
  check('Escape collapses transcript but leaves focused header visible', () => {
    assert.equal(demo.getState().drawer, false);
    assert.equal(demo.getLayout().headerHeight, 46);
  });
  demo.dispatch({ type: 'menu', menu: 'zoom' }); run(4980);
  const zoomChoice = get('zoom', undefined, 1.5);
  events['host:pointerdown']({ target: zoomChoice, button: 0, pointerId: 10 });
  events['window:pointerdown']({ target: zoomChoice }); run(5000);
  check('outside-composer press does not destroy unrelated zoom menu before click', () => {
    assert.equal(demo.getState().menu, 'zoom');
    assert.equal(get('zoom', undefined, 1.5), zoomChoice);
    events['window:pointerup']({ pointerId: 10 });
    events['host:click']({ target: zoomChoice });
    assert.equal(demo.getState().views.resume.zoom, 1.5);
  });
  assert.equal(checks.length, 36);
});
