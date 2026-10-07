import { initialState, reduce, layout, geometry, spring, clamp, beginZoom, sampleZoom } from './model.mjs';
import { renderScene } from './scene.mjs';
import { documents } from './documents.mjs';
const host = document.querySelector('#workspace');
const input = document.querySelector('#composer');
const status = document.querySelector('#status');
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
let state = initialState(), side = { value: 1, velocity: 0 }, previous = 0, frame = 0, dirty = true;
let size = { width: innerWidth, height: innerHeight }, drag = null, replyTimers = new Set(), zoomTransition = null;
const getLayout = () => layout(size.width, size.height, side.value, state.split);
function announce(message) { status.textContent = message; }
function dispatch(action) {
  const oldActive = state.active;
  const from = sampleZoom(state, zoomTransition, performance.now(), reduced.matches);
  const oldRequest = state.nextRequest;
  state = reduce(state, action, getLayout());
  if (action.type === 'zoom') zoomTransition = beginZoom(from, state, getLayout(), performance.now());
  else if (['scroll', 'scrollTo', 'page', 'open', 'close', 'resize'].includes(action.type)) zoomTransition = null;
  dirty = true;
  if (oldActive !== state.active) { input.value = state.drafts[state.active]; announce(`Opened ${documents[state.active]?.title || 'conversation'}`); }
  if (action.type === 'send' && state.nextRequest !== oldRequest) scheduleReply();
  if (action.type === 'requestChanges') { input.placeholder = 'What would you like to change?'; input.focus(); }
  else input.placeholder = 'Ask anything';
  if (!frame) frame = requestAnimationFrame(draw);
}
function scheduleReply() {
  const id = state.active, request = state.requests[id];
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
  if (moving) { side = spring(side.value, side.velocity, target, dt, reduced.matches); dirty = true; }
  const zooming = zoomTransition && now - zoomTransition.start < 150;
  if (zooming) dirty = true;
  if (dirty) {
    // Preserve keyboard focus through SVG updates. Input is a stable native element.
    const focused = document.activeElement?.closest?.('[data-type]');
    const focusKey = focused ? [focused.dataset.type, focused.dataset.id, focused.dataset.value] : null;
    host.innerHTML = renderScene(sampleZoom(state, zoomTransition, now, reduced.matches), { ...size, sidebar: side.value, nativeInput: true });
    if (focusKey) {
      const match = [...host.querySelectorAll('[data-type]')].find(el => el.dataset.type === focusKey[0] && el.dataset.id === focusKey[1] && el.dataset.value === focusKey[2]);
      match?.focus({ preventScroll: true });
    }
    const l = getLayout();
    Object.assign(input.style, { left: `${l.composerX + 57}px`, top: `${l.composerY + 11}px`, width: `${l.composerWidth - 121}px`, height: '24px' });
    input.setAttribute('aria-label', `Ask about ${documents[state.active]?.short || 'your work'}`);
    dirty = false;
  }
  if (moving || zooming) frame = requestAnimationFrame(draw);
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
  else dispatch({ type, id });
}
host.addEventListener('click', event => {
  const target = event.target.closest('[data-type]');
  if (target) activate(target);
  else if (state.menu) dispatch({ type: 'menu', menu: state.menu });
});
host.addEventListener('keydown', event => {
  if (event.target.getAttribute('role') === 'tab' && ['ArrowLeft', 'ArrowRight'].includes(event.key)) {
    event.preventDefault(); const i = state.tabs.indexOf(state.active);
    dispatch({ type: 'open', id: state.tabs[(i + (event.key === 'ArrowRight' ? 1 : -1) + state.tabs.length) % state.tabs.length] });
    host.querySelector(`[role=tab][data-id="${state.active}"]`)?.focus(); return;
  }
  if (['Enter', ' '].includes(event.key) && event.target.closest('[data-type]')) { event.preventDefault(); activate(event.target.closest('[data-type]')); }
});
input.addEventListener('input', () => dispatch({ type: 'draft', text: input.value }));
input.addEventListener('keydown', event => {
  if (event.key === 'Enter' && !event.shiftKey && !event.isComposing) { event.preventDefault(); dispatch({ type: 'send' }); }
});
host.addEventListener('wheel', event => {
  const l = getLayout(), g = geometry(state, l);
  if (!g || event.clientX < l.x || event.clientY < l.top || event.target.closest('[data-type]')) return;
  event.preventDefault();
  if (event.ctrlKey || event.metaKey) {
    const delta = clamp(event.deltaY, -20, 20);
    let zoom = g.scale * Math.exp(-delta * 0.005);
    const stops = [.3, .4, .5, .67, .75, .9, 1, 1.1, 1.25, 1.5, 1.75, 2, 2.5, 3, 4, 5, 6, 7, 8];
    const snap = stops.find(stop => Math.abs(zoom - stop) / stop < .02);
    if (snap) zoom = snap;
    dispatch({ type: 'zoom', value: zoom, x: event.clientX, y: event.clientY });
  } else dispatch({ type: 'scroll', dx: event.shiftKey ? event.deltaY : event.deltaX, dy: event.shiftKey ? 0 : event.deltaY });
}, { passive: false });
host.addEventListener('pointerdown', event => {
  const l = getLayout(), g = geometry(state, l);
  if (!g || event.clientX < l.x || event.clientY < l.top || event.target.closest('[data-type]')) return;
  if (event.pointerType === 'touch' || event.button === 1 || event.target.hasAttribute('data-scroll-thumb')) {
    event.preventDefault();
    drag = { id: event.pointerId, x: event.clientX, y: event.clientY, thumb: event.target.hasAttribute('data-scroll-thumb') };
    host.setPointerCapture(event.pointerId);
  }
});
host.addEventListener('pointermove', event => {
  if (!drag || drag.id !== event.pointerId) return;
  const g = geometry(state, getLayout());
  const factor = drag.thumb ? -(g.totalHeight / getLayout().viewHeight) : 1;
  dispatch({ type: 'scroll', dx: (drag.x - event.clientX) * factor, dy: (drag.y - event.clientY) * factor });
  drag.x = event.clientX; drag.y = event.clientY;
});
function release(event) { if (drag?.id === event.pointerId) { drag = null; if (host.hasPointerCapture(event.pointerId)) host.releasePointerCapture(event.pointerId); } }
host.addEventListener('pointerup', release); host.addEventListener('pointercancel', release); host.addEventListener('lostpointercapture', () => drag = null);
window.addEventListener('blur', () => drag = null);
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
