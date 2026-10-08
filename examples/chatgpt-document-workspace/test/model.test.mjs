import test from 'node:test';
import assert from 'node:assert/strict';
import { initialState, reduce, layout, geometry, spring, beginZoom, sampleZoom, accumulateWheel } from '../src/model.mjs';
import { renderScene } from '../src/scene.mjs';
const l = layout();
function act(state, type, values = {}) { return reduce(state, { type, ...values }, l); }

test('fit width is bounded at 100% and responds to the reader width', () => {
  const s = initialState(); assert.equal(geometry(s, l).scale, 1);
  const narrow = layout(840, 800, 1); assert.ok(geometry(s, narrow).scale <= 1);
  assert.equal(geometry(s, layout(2000, 1200, 0)).scale, 1);
});
test('zoom clamps at PDF bounds, ignores invalid numbers, and preserves finite state', () => {
  const s = initialState(); assert.equal(geometry(act(s, 'zoom', { value: 100 }), l).scale, 8);
  assert.equal(geometry(act(s, 'zoom', { value: .1 }), l).scale, .3);
  assert.deepEqual(act(s, 'zoom', { value: 'bad' }), s);
});
test('zoom preserves the document point under the pointer', () => {
  let s = act(initialState(), 'scroll', { dy: 350 });
  const a = geometry(s, l), x = 790, y = 560;
  const px = (x - a.paperX) / a.scale, py = (y - a.paperY) / a.scale;
  s = act(s, 'zoom', { value: 1.5, x, y }); const b = geometry(s, l);
  assert.ok(Math.abs((x - b.paperX) / b.scale - px) < .001);
  assert.ok(Math.abs((y - b.paperY) / b.scale - py) < .001);
});
test('zoom remains anchored on page two with a fixed inter-page gap', () => {
  let s = act(initialState(), 'page', { page: 2 }); const a = geometry(s, l), y = 380;
  const py = (y - (a.paperY + a.paperHeight + l.paperGap)) / a.scale;
  s = act(s, 'zoom', { value: 1.5, y }); const b = geometry(s, l);
  assert.ok(Math.abs((y - (b.paperY + b.paperHeight + l.paperGap)) / b.scale - py) < .001);
});
test('scrolling is bounded and page jumps keep the correct page', () => {
  let s = act(initialState(), 'scroll', { dx: -1000, dy: -1000 });
  assert.equal(s.views.resume.scrollY, 0); assert.equal(s.views.resume.scrollX, 0);
  s = act(s, 'scroll', { dx: 100000, dy: 100000 });
  assert.equal(s.views.resume.scrollY, geometry(s, l).maxY);
  s = act(s, 'page', { page: 2 }); assert.equal(geometry(s, l).page, 2);
  s = act(s, 'page', { page: -1 }); assert.equal(s.views.resume.scrollY, 0);
});
test('tabs restore independent zoom, reading positions and draft text', () => {
  let s = act(initialState(), 'zoom', { value: 1.5 });
  s = act(s, 'scroll', { dy: 123 }); s = act(s, 'draft', { text: 'Please review this.' });
  const view = structuredClone(s.views.resume);
  s = act(s, 'open', { id: 'notes' }); s = act(s, 'draft', { text: 'Different draft' });
  s = act(s, 'open', { id: 'resume' });
  assert.deepEqual(s.views.resume, view); assert.equal(s.drafts.resume, 'Please review this.');
  assert.equal(s.drafts.notes, 'Different draft'); assert.deepEqual(s.tabs, ['chat', 'resume', 'notes']);
});
test('tab close, reopen, Back and Forward stay deterministic', () => {
  let s = act(initialState(), 'open', { id: 'notes' });
  s = act(s, 'history', { delta: -1 }); assert.equal(s.active, 'resume');
  s = act(s, 'history', { delta: 1 }); assert.equal(s.active, 'notes');
  s = act(s, 'close', { id: 'notes' }); assert.equal(s.active, 'resume');
  s = act(s, 'close', { id: 'resume' }); assert.equal(s.active, 'chat');
  s = act(s, 'close', { id: 'chat' }); assert.deepEqual(s.tabs, ['chat']);
});
test('invalid file IDs and unknown actions cannot corrupt state', () => {
  const s = initialState(); assert.deepEqual(act(s, 'open', { id: '../../unknown' }), s);
  assert.deepEqual(act(s, 'unknown'), s);
});
test('empty and duplicate sends do not produce duplicate messages', () => {
  let s = initialState(); assert.equal(act(s, 'send').messages.resume.length, 0);
  s = act(s, 'draft', { text: '  Summarize this.  ' }); s = act(s, 'send');
  assert.equal(s.messages.resume.length, 1); assert.equal(s.messages.resume[0].body, 'Summarize this.');
  s = act(s, 'draft', { text: 'More' }); s = act(s, 'send'); assert.equal(s.messages.resume.length, 1);
});
test('async replies stay with the originating document; stale replies are ignored', () => {
  let s = act(initialState(), 'draft', { text: 'First' }); s = act(s, 'send');
  const request = s.requests.resume; s = act(s, 'open', { id: 'notes' });
  s = act(s, 'reply', { id: 'resume', request, body: 'Ready' });
  assert.equal(s.active, 'notes'); assert.equal(s.messages.resume.length, 2); assert.equal(s.messages.notes.length, 0);
  assert.deepEqual(act(s, 'reply', { id: 'resume', request, body: 'Duplicate' }), s);
});
test('Escape closes UI without deleting drafts or reading state', () => {
  let s = act(initialState(), 'draft', { text: 'Keep me' });
  s = act(s, 'menu', { menu: 'zoom' }); s = act(s, 'requestChanges'); s = act(s, 'dismiss');
  assert.equal(s.menu, null); assert.equal(s.requestContext, null); assert.equal(s.drafts.resume, 'Keep me');
});
test('responsive split mode has a safe width threshold', () => {
  const wide = layout(1440, 900, 1, true); assert.equal(wide.splitWidth, 330);
  const small = layout(650, 800, 1, true); assert.equal(small.splitWidth, 0);
  assert.ok(small.composerWidth > 100);
});
test('sidebar spring is interruptible and reduced motion settles immediately', () => {
  let s = { value: 1, velocity: 0 };
  for (let i = 0; i < 10; i++) s = spring(s.value, s.velocity, 0, 1 / 60);
  assert.ok(s.value < 1 && s.value > 0);
  for (let i = 0; i < 90; i++) s = spring(s.value, s.velocity, 1, 1 / 60);
  assert.ok(Math.abs(s.value - 1) < .001);
  assert.deepEqual(spring(.5, 10, 0, 1 / 60, true), { value: 0, velocity: 0 });
});
test('zoom transition continues from rendered geometry and respects reduced motion', () => {
  const a = initialState(), b = act(a, 'zoom', { value: 1.5 }); const t = beginZoom(a, b, l, 100);
  assert.equal(geometry(sampleZoom(b, t, 100), l).scale, 1);
  assert.ok(geometry(sampleZoom(b, t, 175), l).scale > 1);
  assert.equal(geometry(sampleZoom(b, t, 251), l).scale, 1.5);
  assert.equal(geometry(sampleZoom(b, t, 100, true), l).scale, 1.5);
});
test('user-entered strings are escaped before entering SVG markup', () => {
  let s = act(initialState(), 'draft', { text: '<script>alert("x")</script>' });
  const svg = renderScene(s); assert.ok(!svg.includes('<script>')); assert.ok(svg.includes('&lt;script&gt;'));
  assert.ok(!/\b(?:NaN|Infinity)\b/.test(svg));
});
test('rendered app exposes semantic tabs, named buttons, and no remote assets', () => {
  const svg = renderScene(initialState()); assert.ok(svg.includes('role="tablist"'));
  assert.ok(svg.includes('role="tab" aria-selected="true"'));
  assert.ok(svg.includes('aria-label="Hide sidebar"')); assert.ok(svg.includes('aria-label="Side-by-side view"'));
  assert.ok(!/https?:\/\//.test(svg.replace('http://www.w3.org/2000/svg', '')));
});
test('fit, scroll and menus render finite markup across narrow/tall/wide sizes', () => {
  for (const [width, height] of [[390, 844], [800, 600], [1280, 1180], [1920, 1080]]) {
    for (const menu of [null, 'files', 'zoom', 'attach']) {
      const s = { ...initialState(), menu };
      const svg = renderScene(s, { width, height });
      assert.ok(!/\b(?:NaN|Infinity)\b/.test(svg)); assert.ok(svg.endsWith('</svg>'));
    }
  }
});

test('entering split view clamps a bottom-scrolled fit document to its new extent', () => {
  let s = act(initialState(), 'scroll', { dy: 99999 });
  s = act(s, 'split');
  const split = layout(l.width, l.height, 1, true), g = geometry(s, split);
  assert.ok(g.view.scrollY <= g.maxY); assert.ok(g.view.scrollY >= 0);
});
test('reopening an inactive file normalizes its scroll position after viewport changes', () => {
  let s = act(initialState(), 'scroll', { dy: 99999 }); s = act(s, 'open', { id: 'notes' });
  s = reduce(s, { type: 'open', id: 'resume' }, layout(720, 600, 1));
  const g = geometry(s, layout(720, 600, 1)); assert.ok(g.view.scrollY <= g.maxY);
});
test('collapsed sidebar removes controls from the tab order and keeps chrome clear', () => {
  const s = { ...initialState(), sidebar: false };
  const svg = renderScene(s, { sidebar: 0 });
  const sidebar = svg.split('aria-hidden="true"')[1].split('<!--')[0];
  assert.ok(sidebar.includes('tabindex="-1"'));
  assert.ok(svg.includes('x="222" y="0"')); // Tabs start after the fixed chrome controls.
  const keys = [...svg.matchAll(/data-control-key="([^"]+)"/g)].map(m => m[1]);
  assert.equal(keys.length, new Set(keys).size);
});
test('chat tab ignores saved split preference and long tokens remain clipped', () => {
  let s = act(initialState(), 'split'); s = act(s, 'open', { id: 'chat' });
  s = act(s, 'draft', { text: 'x'.repeat(4000) }); s = act(s, 'send');
  const svg = renderScene(s);
  assert.ok(!svg.includes('x'.repeat(1000)));
  assert.ok(svg.includes('overflow="hidden"'));
  assert.ok(!/\b(?:NaN|Infinity)\b/.test(svg));
});


test('high-resolution wheel deltas accumulate instead of sticking to the snapped stop', () => {
  let gesture = null, scale = 1;
  for (let i = 0; i < 20; i++) {
    gesture = accumulateWheel(gesture, { scale, delta: 1, time: i * 8, id: 'resume' }); scale = gesture.target;
  }
  assert.ok(scale < .95); assert.ok(Math.abs(gesture.raw - Math.exp(-.1)) < .0001);
  const paused = accumulateWheel(gesture, { scale: 1.5, delta: 1, time: 900, id: 'resume' });
  assert.ok(paused.raw > 1.4);
  const changed = accumulateWheel(gesture, { scale: 2, delta: 1, time: 160, id: 'notes' });
  assert.ok(changed.raw > 1.9);
});

test('dynamic-label control keys remain stable across toggles', () => {
  const a = renderScene(initialState()), b = renderScene(act(initialState(), 'sidebar'));
  const key = svg => [...svg.matchAll(/data-control-key="([^"]+)"[^>]+data-type="sidebar"/g)].map(m=>m[1]);
  assert.deepEqual(key(a), key(b));
});
