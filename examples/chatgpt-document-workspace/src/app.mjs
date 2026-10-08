import { initialState, reduce, layout, geometry, spring, clamp, beginZoom, sampleZoom, composerLayout, accumulateWheel, beginMotion, sampleMotion, beginComposerMotion, sampleComposerLayout, conversationKey } from './model.mjs';
import { renderScene } from './scene.mjs';
import { documents } from './documents.mjs';
const host = document.querySelector('#workspace');
const input = document.querySelector('#composer');
const status = document.querySelector('#status');
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
let state = initialState(), side = { value: 1, velocity: 0 }, previous = 0, frame = 0, dirty = true;
let size = { width: innerWidth, height: innerHeight }, drag = null, replyTimers = new Set(), zoomTransition = null, lastMenuTriggerKey = null, pendingFocusKey = null, focusActiveTab = false, wheelGesture = null;
let panelMotion = { split: null, thumbnails: null }, composerMotion = null, pressedControl = null, pendingInputFocus = false;
const panelTarget = name => Number(state[name] && state.active !== 'chat');
const panelValue = (name, now = performance.now()) => panelMotion[name]
  ? sampleMotion(panelMotion[name], now, reduced.matches) : panelTarget(name);
const baseLayout = (now = performance.now()) => layout(size.width, size.height, side.value, panelValue('split', now), panelValue('thumbnails', now), state.active === 'chat');
const getLayout = (now = performance.now()) => sampleComposerLayout(state, baseLayout(now), composerMotion, now, reduced.matches);
function measureSingleLineOverflow() {
  // scrollHeight includes the animated element height. Measure the compact target,
  // then restore presentation in this task so an interrupted collapse cannot latch.
  const { height, width } = input.style;
  input.style.height = '22px';
  input.style.width = `${baseLayout().composerWidth - 121}px`;
  const overflow = Number.isFinite(input.scrollHeight) ? input.scrollHeight > 24 : undefined;
  input.style.height = height;
  input.style.width = width;
  return overflow;
}
function announce(message) { status.textContent = message; }
function dispatch(action) {
  const now = performance.now();
  const oldPanels = Object.fromEntries(['split', 'thumbnails'].map(name => [name, { value: panelValue(name, now), target: panelTarget(name) }]));
  const oldActive = state.active;
  const oldComposer = getLayout(now);
  const oldComposerTarget = composerLayout(state, baseLayout(now));
  if (['open', 'close', 'split', 'thumbnails', 'sidebar', 'resize'].includes(action.type) || (action.type === 'zoom' && !action.wheel)) wheelGesture = null;
  const oldMenu = state.menu;
  const activeControlKey = document.activeElement?.dataset?.controlKey;
  if (action.type === 'menu' && !oldMenu) lastMenuTriggerKey = activeControlKey || null;
  if (oldMenu && ['zoom', 'dismiss', 'open'].includes(action.type)) pendingFocusKey = lastMenuTriggerKey;
  if (action.type === 'close' && document.activeElement?.closest?.('[data-type]')) focusActiveTab = true;
  const from = sampleZoom(state, zoomTransition, performance.now(), reduced.matches);
  const oldRequest = state.nextRequest;
  state = reduce(state, action, getLayout(now));
  const nextComposer = composerLayout(state, baseLayout(now));
  if (oldActive !== state.active || action.type === 'resize') composerMotion = null;
  else if (['expansion', 'bodyHeight', 'headerProgress', 'transcriptHeight'].some(key => nextComposer[key] !== oldComposerTarget[key])) {
    composerMotion = beginComposerMotion(oldComposer, nextComposer, now);
  }
  for (const name of ['split', 'thumbnails']) {
    if (oldPanels[name].target !== panelTarget(name)) {
      panelMotion[name] = beginMotion(oldPanels[name].value, panelTarget(name), now, name === 'split' ? 300 : 150);
    }
  }
  if (action.type === 'zoom') zoomTransition = beginZoom(from, state, getLayout(), performance.now());
  else if (['scroll', 'scrollTo', 'page', 'open', 'close', 'resize', 'split', 'thumbnails', 'sidebar'].includes(action.type)) zoomTransition = null;
  dirty = true;
  if (oldActive !== state.active) { if (document.activeElement === input) input.blur(); drag = null; input.value = state.drafts[conversationKey(state)]; announce(`Opened ${documents[state.active]?.title || 'conversation'}`); }
  if (action.type === 'send' && state.nextRequest !== oldRequest) scheduleReply();
  if (action.type === 'composerRestore') pendingInputFocus = true;
  input.placeholder = state.requestContext === state.active ? 'What would you like to change?' : 'Ask anything';
  if (action.type === 'requestChanges') input.focus();
  if (!frame) frame = requestAnimationFrame(draw);
}
function scheduleReply() {
  const id = conversationKey(state), request = state.requests[id];
  if (!request) return;
  input.value = '';
  const timer = setTimeout(() => {
    replyTimers.delete(timer);
    const body = id === 'resume'
      ? 'The portfolio connects research, design systems, and thoughtful interaction. The second page gives those ideas more room, with two selected projects.'
      : id === 'notes'
        ? 'The central idea is continuity: keep the document in view, preserve its reading position, and keep each question close to its context.'
        : 'Choose a document above to continue. Each file keeps its own position, zoom, and conversation.';
    dispatch({ type: 'reply', id, request, body });
    announce('Local example reply ready.');
  }, 650);
}
function draw(now) {
  frame = 0;
  const target = Number(state.sidebar), dt = previous ? (now - previous) / 1000 : 1 / 60;
  previous = now;
  const moving = Math.abs(side.value - target) > 0.0001 || Math.abs(side.velocity) > 0.0001;
  if (moving) { side = spring(side.value, side.velocity, target, dt, reduced.matches); state = reduce(state, { type: 'resize' }, getLayout()); dirty = true; }
  let panelsMoving = false;
  for (const name of ['split', 'thumbnails']) {
    const motion = panelMotion[name];
    if (motion) {
      dirty = true;
      if (reduced.matches || now - motion.start >= motion.duration) panelMotion[name] = null;
      else panelsMoving = true;
    }
  }
  if (panelsMoving) state = reduce(state, { type: 'resize' }, getLayout(now));
  const composerMoving = composerMotion && !reduced.matches && now - composerMotion.start < composerMotion.duration;
  if (composerMotion) dirty = true;
  if (composerMotion && !composerMoving) composerMotion = null;
  const zooming = zoomTransition && now - zoomTransition.start < 150;
  if (zoomTransition) dirty = true;
  if (zoomTransition && !zooming) zoomTransition = null;
  if (dirty && !pressedControl) {
    // Preserve keyboard focus through SVG updates. Input is a stable native element.
    const focused = document.activeElement?.closest?.('[data-type]');
    const focusKey = pendingFocusKey || focused?.dataset.controlKey;
    host.innerHTML = renderScene(sampleZoom(state, zoomTransition, now, reduced.matches), { ...size, sidebar: side.value, split: panelValue('split', now), thumbnails: panelValue('thumbnails', now), nativeInput: true, composerMotion, now, reduced: reduced.matches });
    if (focusKey) {
      const match = [...host.querySelectorAll('[data-type]')].find(el => el.dataset.controlKey === focusKey && el.getAttribute('tabindex') !== '-1');
      if (match) match.focus({ preventScroll: true });
      else host.querySelector(`[role=tab][data-id="${state.active}"]`)?.focus({ preventScroll: true });
    }
    if (focusActiveTab) host.querySelector(`[role=tab][data-id="${state.active}"]`)?.focus({ preventScroll: true });
    pendingFocusKey = null; focusActiveTab = false;
    const l = getLayout(now);
    Object.assign(input.style, { display: l.minimized ? 'none' : '', left: `${l.inputX}px`, top: `${l.inputY}px`, width: `${l.inputWidth}px`, height: `${l.bodyHeight}px` });
    if (pendingInputFocus && !l.minimized) { pendingInputFocus = false; input.focus({ preventScroll: true }); }
    input.setAttribute('aria-label', `Ask about ${documents[state.active]?.short || 'your work'}`);
    dirty = false;
    // A narrower pane can wrap existing text without an input event.
    if (!state.multiline[conversationKey(state)] && input.value && measureSingleLineOverflow()) {
      dispatch({ type: 'composerOverflow', overflow: true });
    }
  }
  if (!frame && (moving || zooming || panelsMoving || composerMoving)) frame = requestAnimationFrame(draw);
}
function activate(el) {
  if (!el || el.getAttribute('aria-disabled') === 'true') return;
  const { type, id, value } = el.dataset;
  if (type === 'menu') dispatch({ type, menu: id });
  else if (type === 'zoom') dispatch({ type, value: value === 'fit' ? 'fit' : Number(value) });
  else if (type === 'history') dispatch({ type, delta: Number(value) });
  else if (type === 'page') dispatch({ type, page: Number(value) });
  else if (type === 'voice') { dispatch({ type: 'notice', text: 'Voice is not connected in this local demo.' }); announce('Voice is not connected in this local demo.'); }
  else if (type === 'download') download();
  else if (type === 'dockChoice') dispatch(id === 'left' ? { type: 'composerDock' } : id === 'minimize' ? { type: 'composerMinimize' } : { type: 'composerFull' });
  else dispatch({ type, id });
}
host.addEventListener('click', event => {
  const target = event.target.closest('[data-type]');
  if (target) activate(target);
  else if (event.target.closest('[data-composer-header]')) dispatch({ type: 'composerExpand' });
  else if (state.menu) dispatch({ type: 'menu', menu: state.menu });
});
host.addEventListener('keydown', event => {
  if (event.target.getAttribute('role') === 'tab' && ['ArrowLeft', 'ArrowRight'].includes(event.key)) {
    event.preventDefault(); const i = state.tabs.indexOf(state.active);
    dispatch({ type: 'open', id: state.tabs[(i + (event.key === 'ArrowRight' ? 1 : -1) + state.tabs.length) % state.tabs.length] });
    requestAnimationFrame(() => host.querySelector(`[role=tab][data-id="${state.active}"]`)?.focus()); return;
  }
  if (['Enter', ' '].includes(event.key) && event.target.closest('[data-type]')) { event.preventDefault(); activate(event.target.closest('[data-type]')); }
});
// Whitespace belongs to the editor's hit area; nested controls keep their own actions.
host.addEventListener('mousedown', event => {
  const control = event.target.closest('[data-type]');
  if (event.button === 0 && (control?.dataset?.type === 'menu' && control.dataset.id === 'dock'
    || !control && event.target.closest('[data-composer-header]'))) { event.preventDefault(); return; }
  if (event.button !== 0 || event.defaultPrevented || !event.target.closest('[data-composer-shell]')
    || event.target.closest('[data-type],a,button,input,select,textarea,[contenteditable],[draggable="true"],[role="button"],[role="link"],[role="menuitem"],[role="option"],[tabindex]')) return;
  event.preventDefault();
  input.focus({ preventScroll: true });
});
function ownsComposerFocus(target) {
  return target === input || Boolean(target?.closest?.('[data-composer-owned]'));
}
function composerBlur(event = {}) {
  if (ownsComposerFocus(event.relatedTarget)) return;
  if (event.relatedTarget) dispatch({ type: 'composerOutside' });
  else queueMicrotask(() => {
    if (!ownsComposerFocus(document.activeElement)) dispatch({ type: 'composerFocus', focused: false });
  });
}
input.addEventListener('focus', () => dispatch({ type: 'composerFocus', focused: true }));
input.addEventListener('blur', composerBlur);
host.addEventListener('focusout', event => { if (ownsComposerFocus(event.target)) composerBlur(event); });
window.addEventListener('pointerdown', event => {
  if (ownsComposerFocus(event.target)) return;
  dispatch({ type: 'composerOutside' });
});
input.addEventListener('input', () => dispatch({ type: 'draft', text: input.value,
  overflow: measureSingleLineOverflow() }));
input.addEventListener('keydown', event => {
  if (event.key === 'Enter' && !event.shiftKey && !event.isComposing) { event.preventDefault(); dispatch({ type: 'send' }); }
});
host.addEventListener('wheel', event => {
  const l = getLayout(), g = geometry(state, l);
  if (!g || ownsComposerFocus(event.target) || event.clientX < l.x || event.clientY < l.top || event.target.closest('[data-type]')) return;
  event.preventDefault();
  if (event.ctrlKey || event.metaKey) {
    wheelGesture = accumulateWheel(wheelGesture, { scale: g.scale, delta: event.deltaY, time: performance.now(), id: state.active });
    dispatch({ type: 'zoom', value: wheelGesture.target, x: event.clientX, y: event.clientY, wheel: true });
  } else dispatch({ type: 'scroll', dx: event.shiftKey ? event.deltaY : event.deltaX, dy: event.shiftKey ? 0 : event.deltaY });
}, { passive: false });
host.addEventListener('pointerdown', event => {
  const control = event.target.closest('[data-type]');
  if (control) pressedControl = control.dataset.controlKey;
  else if (event.target.closest('[data-composer-header]')) pressedControl = 'composer-header';
  const l = getLayout(), g = geometry(state, l);
  if (!g || ownsComposerFocus(event.target) || event.clientX < l.x || event.clientY < l.top || event.target.closest('[data-type]')) return;
  if (event.pointerType === 'touch' || event.button === 1 || event.target.hasAttribute('data-scroll-thumb')) {
    event.preventDefault();
    drag = { id: event.pointerId, x: event.clientX, y: event.clientY, thumb: event.target.hasAttribute('data-scroll-thumb') };
    host.setPointerCapture(event.pointerId);
  }
});
host.addEventListener('pointermove', event => {
  if (!drag || drag.id !== event.pointerId) return;
  const g = geometry(state, getLayout());
  if (!g) { drag = null; return; }
  const factor = drag.thumb ? -(g.totalHeight / getLayout().viewHeight) : 1;
  dispatch({ type: 'scroll', dx: (drag.x - event.clientX) * factor, dy: (drag.y - event.clientY) * factor });
  drag.x = event.clientX; drag.y = event.clientY;
});
function release(event) {
  if (pressedControl) { pressedControl = null; dirty = true; if (!frame) frame = requestAnimationFrame(draw); }
  if (drag?.id === event.pointerId) { drag = null; if (host.hasPointerCapture(event.pointerId)) host.releasePointerCapture(event.pointerId); } }
host.addEventListener('pointerup', release); host.addEventListener('pointercancel', release);
window.addEventListener('pointerup', release); window.addEventListener('pointercancel', release); host.addEventListener('lostpointercapture', () => drag = null);
window.addEventListener('blur', () => { drag = null; pressedControl = null; dispatch({ type: 'composerFocus', focused: false }); });
window.addEventListener('resize', () => { size = { width: innerWidth, height: innerHeight }; dispatch({ type: 'resize' }); });
window.addEventListener('keydown', event => {
  if (event.key === 'Escape') { dispatch({ type: 'dismiss' }); return; }
  if (event.target === input) return;
  const l = getLayout(), g = geometry(state, l);
  if ((event.ctrlKey || event.metaKey) && ['+', '=', '-', '0'].includes(event.key)) {
    event.preventDefault(); if (g) dispatch({ type: 'zoom', value: event.key === '0' ? 'fit' : g.scale * (event.key === '-' ? 1 / 1.1 : 1.1) });
  } else if (event.key === 'PageDown' || event.key === 'PageUp') {
    event.preventDefault(); dispatch({ type: 'scroll', dy: l.viewHeight * .85 * (event.key === 'PageDown' ? 1 : -1) });
  } else if (event.key === 'Home') { event.preventDefault(); dispatch({ type: 'scrollTo', y: 0 }); }
  else if (event.key === 'End' && g) { event.preventDefault(); dispatch({ type: 'scrollTo', y: g.maxY }); }
  else if ((event.ctrlKey || event.metaKey) && event.key === 'b') { event.preventDefault(); dispatch({ type: 'sidebar' }); }
});
function download() {
  const doc = documents[state.active]; if (!doc) return;
  const a = document.createElement('a');
  if (doc.type === 'pdf') { a.href = 'fixtures/alex-morgan-portfolio.pdf'; a.download = 'Alex Morgan - Portfolio.pdf'; a.click(); }
  else {
    const text = doc.lines.map(([kind, body]) => (['name', 'section'].includes(kind) ? '# ' : kind === 'bullet' ? '- ' : '') + body).join('\n\n');
    const url = URL.createObjectURL(new Blob([text], { type: 'text/markdown' }));
    a.href = url; a.download = doc.title; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
}
// A small, read-only surface for deterministic browser checks; no external side effects.
window.workspaceDemo = { getState: () => structuredClone(state), dispatch, getLayout };
dispatch({ type: 'resize' });
