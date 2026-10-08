import test from 'node:test';
import assert from 'node:assert/strict';
import { initialState, layout, geometry, reduce, beginMotion, sampleMotion } from '../src/model.mjs';
import { renderScene } from '../src/scene.mjs';
const near = (actual, expected) => assert.ok(Math.abs(actual - expected) < .001, `${actual} ≠ ${expected}`);

test('thumbnail reservation precedes paper fit and centering throughout reveal', () => {
  const s = initialState();
  for (const progress of [0, .125, .5, .875, 1]) {
    const l = layout(1280, 1180, 1, 0, progress), g = geometry(s, l);
    assert.ok(g.paperX >= l.readerX + 32);
    assert.ok(g.paperX + g.paperWidth <= 1280 - 32);
  }
  const closed = geometry(s, layout()), open = geometry(s, layout(1280, 1180, 1, 0, 1));
  near(closed.paperX, 413.5); near(open.paperX, 545); near(open.paperWidth, 699);
  assert.ok(open.paperX >= 339 + 8 + 166 + 24);
});

test('thumbnail layout changes preserve finite bounded zoom and page navigation', () => {
  let s = reduce(initialState(), { type: 'thumbnails' });
  const l = layout(1280, 1180, 1, 0, 1);
  s = reduce(s, { type: 'page', page: 2 }, l);
  assert.equal(geometry(s, l).page, 2);
  s = reduce(s, { type: 'zoom', value: 1.5, x: 950, y: 400 }, l);
  const g = geometry(s, l);
  assert.ok(Number.isFinite(g.paperX)); assert.ok(g.view.scrollY <= g.maxY);
  const t = beginMotion(0, 1, 100, 150);
  near(sampleMotion(t, 100), 0); near(sampleMotion(t, 250), 1);
  near(sampleMotion(t, 100, true), 1);
});

test('split paper and composer share the same reversible 300 ms progress', () => {
  const opening = beginMotion(0, 1, 100, 300);
  const start = layout(), end = layout(1280, 1180, 1, 1);
  for (const now of [100, 150, 200, 300, 400]) {
    const progress = sampleMotion(opening, now), l = layout(1280, 1180, 1, progress);
    near(l.x, start.x + (end.x - start.x) * progress);
    near(l.composerX, start.composerX + (end.composerX - start.composerX) * progress);
    near(l.composerWidth, start.composerWidth + (end.composerWidth - start.composerWidth) * progress);
  }
  const interrupted = sampleMotion(opening, 200), reverse = beginMotion(interrupted, 0, 200, 300);
  near(sampleMotion(reverse, 200), interrupted);
  near(sampleMotion(reverse, 500), 0); near(sampleMotion(reverse, 200, true), 0);
});

test('reader composer keeps 22 px right clearance; split composer has symmetric 16 px insets', () => {
  for (const [w, h] of [[390, 844], [800, 600], [1280, 1180], [1920, 1080]]) {
    const l = layout(w, h); near(w - l.composerX - l.composerWidth, 22);
  }
  const l = layout(1280, 1180, 1, 1);
  near(l.composerX - l.shellX, 16); near(l.x - l.composerX - l.composerWidth, 16);
});

test('sidebar rows use the full 275 px column with 10 px left and right insets', () => {
  const svg = renderScene(initialState());
  for (const [y, h] of [[105, 38], [245, 33], [487, 34]]) {
    assert.ok(svg.includes(`x="74" y="${y}" width="255" height="${h}"`));
  }
});

test('header toolbar icons and tabs share the y=24 centerline', () => {
  const svg = renderScene(initialState());
  // A 34 px hit target at y=7 and an 18 px icon at y=15 both center at 24.
  const controls = [...svg.matchAll(/<g data-control-key="[^\"]*"[^>]*>[\s\S]*?<\/title><rect[^>]*y="7"[^>]*height="34"[^>]*>[\s\S]*?<\/g>/g)];
  assert.ok(controls.length >= 6);
  assert.ok(svg.includes('y="6" width="251" height="36"'));
  assert.ok(svg.includes('15.5) scale(0.7083333333333334)'));
});

test('narrow split frames explicitly clip chat and retain full-width text layout', () => {
  let s = { ...initialState(), split: true };
  s = reduce(s, { type: 'draft', text: 'What connects these projects?' });
  s = reduce(s, { type: 'send' });
  s = reduce(s, { type: 'reply', id: 'resume', request: 1, body: 'A shared focus on clarity: make complex work easy to navigate, and keep the conversation close to the document.' });
  for (const progress of [.01, .1, .4, 1]) {
    const svg = renderScene(s, { split: progress });
    assert.ok(svg.includes('clipPath id="chatPaneClip" clipPathUnits="userSpaceOnUse"'));
    assert.ok(svg.includes('clip-path="url(#chatPaneClip)"'));
    assert.ok(svg.includes('clipPath id="conversationClip" clipPathUnits="userSpaceOnUse"'));
    assert.ok(svg.includes('clip-path="url(#conversationClip)"'));
    assert.ok(svg.includes('A shared focus on clarity: make complex'));
  }
});
