import test from 'node:test';
import assert from 'node:assert/strict';
import { initialState, reduce, layout, composerLayout, composerEase, beginComposerMotion, sampleComposerLayout } from '../src/model.mjs';
import { renderScene } from '../src/scene.mjs';

test('conversation focus reveals 46px chrome without resizing input or expanding transcript', () => {
  let s = initialState();
  const before = composerLayout(s, layout());
  s = reduce(s, { type: 'composerFocus', focused: true });
  s = reduce(s, { type: 'composerFocus', focused: true });
  assert.equal(s.composerFocused, true);
  const focused = composerLayout(s, layout());
  for (const key of ['composerHeight', 'bodyHeight', 'inputX', 'inputY', 'inputWidth', 'composerWidth', 'transcriptHeight']) assert.equal(focused[key], before[key]);
  assert.equal(focused.headerHeight, 46);
  assert.equal(focused.surfaceHeight, before.surfaceHeight + 46);
  assert.equal(s.drawer, false);
  s = reduce(s, { type: 'composerFocus', focused: false });
  assert.deepEqual(composerLayout(s, layout()), before);
});

test('newline and measured overflow enter stacked layout; short text stays stacked until empty', () => {
  for (const action of [{ text: 'First\nSecond' }, { text: 'Wide text', overflow: true }]) {
    let s = reduce(initialState(), { type: 'draft', ...action });
    assert.equal(s.multiline.resume, true);
    s = reduce(s, { type: 'draft', text: 'x', overflow: false });
    assert.equal(s.multiline.resume, true);
    const l = composerLayout(s, layout());
    assert.ok(l.controlsY > l.inputY + l.bodyHeight);
    assert.equal(l.composerY + l.composerHeight, l.height - 16);
    s = reduce(s, { type: 'draft', text: '' });
    assert.equal(s.multiline.resume, false);
    assert.equal(composerLayout(s, layout()).composerHeight, 44);
  }
});

test('overflow measurement is authoritative; no overflow on an empty draft', () => {
  let s = reduce(initialState(), { type: 'composerOverflow', overflow: true });
  assert.equal(s.multiline.resume, false);
  s = reduce(s, { type: 'draft', text: 'A'.repeat(100), overflow: false });
  assert.equal(s.multiline.resume, false);
  s = reduce(s, { type: 'composerOverflow', overflow: true });
  assert.equal(s.multiline.resume, true);
});

test('blur and Escape preserve draft and multiline layout; switching blurs and retains per-file draft', () => {
  let s = reduce(initialState(), { type: 'draft', text: 'One\nTwo' });
  s = reduce(s, { type: 'composerFocus', focused: true });
  for (const action of [{ type: 'composerFocus', focused: false }, { type: 'dismiss' }]) {
    s = reduce(s, action);
    assert.equal(s.drafts.resume, 'One\nTwo');
    assert.equal(s.multiline.resume, true);
  }
  s = reduce(s, { type: 'composerFocus', focused: true });
  s = reduce(s, { type: 'open', id: 'notes' });
  assert.equal(s.composerFocused, false);
  assert.equal(s.multiline.notes, false);
  s = reduce(s, { type: 'open', id: 'resume' });
  assert.equal(s.drafts.resume, 'One\nTwo');
  assert.equal(s.multiline.resume, true);
});

test('Send clears stacked state; pending Send and late replies cannot clear a newer draft', () => {
  let s = reduce(initialState(), { type: 'draft', text: 'One\nTwo' });
  s = reduce(s, { type: 'send' });
  assert.equal(s.multiline.resume, false);
  s = reduce(s, { type: 'draft', text: 'Next\nQuestion' });
  s = reduce(s, { type: 'send' });
  assert.equal(s.drafts.resume, 'Next\nQuestion');
  assert.equal(s.multiline.resume, true);
  s = reduce(s, { type: 'open', id: 'notes' });
  s = reduce(s, { type: 'reply', id: 'resume', request: 1, body: 'Local reply.' });
  assert.equal(s.drafts.resume, 'Next\nQuestion');
  assert.equal(s.multiline.resume, true);
  assert.equal(s.active, 'notes');
});

test('composer geometry uses 300 ms CSS bezier, reverses continuously, and honors reduced motion', () => {
  const base = layout();
  const closed = initialState(), opened = reduce(closed, { type: 'draft', text: 'One\nTwo' });
  const a = composerLayout(closed, base), b = composerLayout(opened, base);
  const motion = beginComposerMotion(a, b, 100);
  assert.equal(motion.duration, 300);
  assert.deepEqual(sampleComposerLayout(opened, base, motion, 100), a);
  const mid = sampleComposerLayout(opened, base, motion, 220);
  assert.ok(mid.composerHeight > a.composerHeight && mid.composerHeight < b.composerHeight);
  assert.equal(mid.composerY + mid.composerHeight, base.height - 16);
  const reverse = beginComposerMotion(mid, a, 220);
  assert.deepEqual(sampleComposerLayout(closed, base, reverse, 220), mid);
  assert.deepEqual(sampleComposerLayout(closed, base, reverse, 520), a);
  assert.deepEqual(sampleComposerLayout(opened, base, motion, 101, true), b);
  assert.equal(composerEase(0), 0);
  assert.equal(composerEase(1), 1);
  assert.ok(Math.abs(composerEase(.5) - .966) < .002);
});

test('stacked scene stays finite and bounded across compact, split, and reader layouts', () => {
  for (const width of [390, 900, 1280, 1920]) {
    let s = reduce(initialState(), { type: 'draft', text: 'One\nTwo\nThree' });
    for (const split of [false, true]) {
      s = { ...s, split };
      const l = composerLayout(s, layout(width, 844, 1, split));
      assert.ok(l.inputWidth > 0);
      assert.ok(l.inputX >= l.composerX);
      assert.ok(l.inputX + l.inputWidth <= l.composerX + l.composerWidth);
      const svg = renderScene(s, { width, height: 844 });
      assert.ok(!/NaN|Infinity/.test(svg));
      assert.match(svg, /data-composer-shell/);
    }
  }
});

test('standalone file-preview configuration has no focus header', () => {
  let s = initialState({ composerVariant: 'standalone' });
  s = reduce(s, { type: 'composerFocus', focused: true });
  assert.equal(composerLayout(s, layout()).headerHeight, 0);
  assert.doesNotMatch(renderScene(s), /aria-label="Minimize chat"/);
});

test('header reveal reverses from current height and opacity while editor stays anchored', () => {
  const base = layout(), closed = initialState();
  const opened = reduce(closed, { type: 'composerFocus', focused: true });
  const a = composerLayout(closed, base), b = composerLayout(opened, base);
  const motion = beginComposerMotion(a, b, 0);
  const mid = sampleComposerLayout(opened, base, motion, 100);
  assert.ok(mid.headerHeight > 0 && mid.headerHeight < 46);
  assert.equal(mid.headerHeight, 46 * mid.headerProgress);
  assert.equal(mid.inputY, a.inputY);
  assert.equal(mid.surfaceY + mid.surfaceHeight, a.surfaceY + a.surfaceHeight);
  const reverse = beginComposerMotion(mid, a, 100);
  assert.deepEqual(sampleComposerLayout(closed, base, reverse, 100), { ...mid, headerVisible: false });
  assert.deepEqual(sampleComposerLayout(closed, base, reverse, 400), a);
  assert.equal(sampleComposerLayout(opened, base, motion, 1, true).headerHeight, 46);
});

test('header click toggles transcript; expanded header survives focus loss until outside dismissal', () => {
  let s = reduce(initialState(), { type: 'composerFocus', focused: true });
  s = reduce(s, { type: 'composerExpand' });
  assert.equal(composerLayout(s, layout()).surfaceHeight, 640);
  s = reduce(s, { type: 'composerFocus', focused: false });
  assert.equal(s.drawer, true);
  assert.equal(composerLayout(s, layout()).headerHeight, 46);
  s = reduce(s, { type: 'composerExpand' });
  assert.equal(s.drawer, false);
  s = reduce(s, { type: 'composerExpand' });
  s = reduce(s, { type: 'composerOutside' });
  assert.equal(s.drawer, false);
  assert.equal(composerLayout(s, layout()).headerHeight, 0);
});

test('owned menu retains header; Escape collapses transcript without clearing focused draft', () => {
  let s = reduce(initialState(), { type: 'menu', menu: 'dock' });
  assert.equal(composerLayout(s, layout()).headerHeight, 46);
  s = reduce(s, { type: 'draft', text: 'Retained draft' });
  s = reduce(s, { type: 'composerFocus', focused: true });
  s = reduce(s, { type: 'composerExpand' });
  s = reduce(s, { type: 'dismiss' });
  assert.equal(s.drawer, false);
  assert.equal(s.drafts.resume, 'Retained draft');
  assert.equal(composerLayout(s, layout()).headerHeight, 46);
});

test('minimize and restore preserve draft and prior presentation; dock hides floating chrome', () => {
  let s = reduce(initialState(), { type: 'draft', text: 'Keep this' });
  s = reduce(s, { type: 'composerExpand' });
  s = reduce(s, { type: 'composerMinimize' });
  const minimized = composerLayout(s, layout());
  assert.equal(minimized.surfaceHeight, 36);
  assert.equal(minimized.surfaceWidth, 36);
  assert.match(renderScene(s), /Restore floating chat/);
  assert.doesNotMatch(renderScene(s), /aria-label="Send message"/);
  s = reduce(s, { type: 'composerRestore' });
  assert.equal(s.drawer, true);
  assert.equal(s.composerFocused, true);
  assert.equal(s.drafts.resume, 'Keep this');
  s = reduce(s, { type: 'composerDock' });
  assert.equal(s.split, true);
  assert.equal(composerLayout(s, layout(1280, 1180, 1, 1)).headerHeight, 0);
});

test('sending from compact focus does not implicitly expand the transcript', () => {
  let s = reduce(initialState(), { type: 'composerFocus', focused: true });
  s = reduce(s, { type: 'draft', text: 'A local question' });
  s = reduce(s, { type: 'send' });
  assert.equal(s.drawer, false);
  assert.equal(composerLayout(s, layout()).transcriptHeight, 0);
  assert.equal(composerLayout(s, layout()).headerHeight, 46);
});

test('outside pointer preserves unrelated menus and minimized saved presentation', () => {
  let s = reduce(initialState(), { type: 'menu', menu: 'zoom' });
  s = reduce(s, { type: 'composerOutside' });
  assert.equal(s.menu, 'zoom');
  s = reduce(s, { type: 'composerExpand' });
  s = reduce(s, { type: 'composerMinimize' });
  s = reduce(s, { type: 'composerOutside' });
  s = reduce(s, { type: 'composerRestore' });
  assert.equal(s.drawer, true);
});

test('closing header immediately leaves tab order while its geometry fades', () => {
  const base = layout(), closed = initialState();
  const opened = reduce(closed, { type: 'composerFocus', focused: true });
  const motion = beginComposerMotion(composerLayout(opened, base), composerLayout(closed, base));
  const svg = renderScene(closed, { composerMotion: motion, now: 40 });
  assert.match(svg, /aria-hidden="true" inert="" pointer-events="none"/);
  assert.match(svg, /tabindex="-1" aria-label="Minimize chat" aria-disabled="true"/);
});

test('full view shares originating conversation drafts, messages and pending replies', () => {
  let s = reduce(initialState(), { type: 'draft', text: 'Question' });
  s = reduce(s, { type: 'send' });
  s = reduce(s, { type: 'draft', text: 'Next draft' });
  s = reduce(s, { type: 'composerFull' });
  assert.equal(s.active, 'chat');
  assert.equal(s.chatContext, 'resume');
  assert.match(renderScene(s), /Question/);
  assert.match(renderScene(s), /Next draft/);
  s = reduce(s, { type: 'reply', id: 'resume', request: 1, body: 'Origin reply' });
  assert.match(renderScene(s), /Origin reply/);
  s = reduce(s, { type: 'draft', text: 'Edited from full view' });
  s = reduce(s, { type: 'open', id: 'resume' });
  assert.equal(s.drafts.resume, 'Edited from full view');
});
