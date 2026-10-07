import { documents } from './documents.mjs';
export const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n));
export function layout(width = 1280, height = 1180, sidebar = 1, split = false) {
  const rail = width < 650 ? 0 : 64;
  const side = width < 900 ? 0 : 275 * sidebar;
  const shellX = rail + side;
  const splitWidth = split && width - shellX > 740 ? 330 : 0;
  const x = shellX + splitWidth;
  const mainWidth = width - x;
  const top = 128;
  const viewHeight = Math.max(200, height - top);
  const composerWidth = splitWidth ? splitWidth - 32 : Math.min(670, mainWidth - 48);
  return { width, height, rail, side, x, shellX, splitWidth, mainWidth, top, viewHeight, composerWidth,
    composerX: splitWidth ? shellX + 16 : x + (mainWidth - composerWidth) / 2, composerY: height - 60,
    fitWidth: Math.max(220, mainWidth - 112), paperGap: 24 };
}
export function initialState() {
  return {
    active: 'resume', tabs: ['chat', 'resume'], sidebar: true, split: false, thumbnails: false, menu: null, drawer: false,
    views: Object.fromEntries(Object.keys(documents).map(id => [id, { zoom: 1, fit: true, scrollX: 0, scrollY: 0 }])),
    drafts: { chat: '', resume: '', notes: '' },
    messages: { chat: [], resume: [], notes: [] },
    requests: {}, nextRequest: 1, requestContext: null, notice: '',
    history: ['resume'], historyIndex: 0,
  };
}
export function geometry(state, l, id = state.active) {
  const doc = documents[id];
  if (!doc) return null;
  const view = state.views[id];
  const scale = view.fit ? Math.min(1, l.fitWidth / doc.width) : view.zoom;
  const paperWidth = doc.width * scale;
  const paperHeight = doc.height * scale;
  const totalHeight = (paperHeight + l.paperGap) * doc.pages - l.paperGap + 180;
  return { doc, view, scale, paperWidth, paperHeight, totalHeight,
    maxY: Math.max(0, totalHeight - l.viewHeight),
    maxX: Math.max(0, paperWidth - l.mainWidth + 64),
    paperX: l.x + Math.max(32, (l.mainWidth - paperWidth) / 2) - view.scrollX,
    paperY: l.top + 20 - view.scrollY,
    page: clamp(Math.floor((view.scrollY + l.viewHeight * 0.25) / (paperHeight + l.paperGap)) + 1, 1, doc.pages),
  };
}
function bounded(state, l) {
  const g = geometry(state, l);
  if (!g) return state;
  const v = { ...g.view, scrollX: clamp(g.view.scrollX, 0, g.maxX), scrollY: clamp(g.view.scrollY, 0, g.maxY) };
  return { ...state, views: { ...state.views, [state.active]: v } };
}
function open(state, id, track = true) {
  if (id !== 'chat' && !documents[id]) return state;
  const history = track && state.active !== id ? [...state.history.slice(0, state.historyIndex + 1), id] : state.history;
  return { ...state, active: id, tabs: state.tabs.includes(id) ? state.tabs : [...state.tabs, id], menu: null,
    drawer: false, requestContext: null, history, historyIndex: track ? history.length - 1 : state.historyIndex };
}
export function reduce(state, action, l = layout()) {
  let next = state;
  const g = geometry(state, l);
  switch (action.type) {
    case 'open': return open(state, action.id);
    case 'close': {
      if (action.id === 'chat') return state;
      const tabs = state.tabs.filter(id => id !== action.id);
      next = { ...state, tabs, menu: null };
      return state.active === action.id ? open(next, tabs.at(-1) || 'chat') : next;
    }
    case 'history': {
      const index = clamp(state.historyIndex + action.delta, 0, state.history.length - 1);
      return { ...open(state, state.history[index], false), historyIndex: index };
    }
    case 'thumbnails': return { ...state, thumbnails: !state.thumbnails, menu: null };
    case 'split': return { ...state, split: !state.split, drawer: false, menu: null };
    case 'sidebar': return { ...state, sidebar: !state.sidebar, menu: null };
    case 'menu': return { ...state, menu: state.menu === action.menu ? null : action.menu };
    case 'dismiss': return { ...state, menu: null, drawer: false, requestContext: null, notice: '' };
    case 'drawer': return { ...state, drawer: !state.drawer, menu: null };
    case 'draft': return { ...state, drafts: { ...state.drafts, [state.active]: action.text.slice(0, 4000) } };
    case 'requestChanges': return { ...state, requestContext: state.active, menu: null, drawer: false };
    case 'send': {
      const body = state.drafts[state.active].trim();
      if (!body || state.requests[state.active]) return state;
      const request = state.nextRequest;
      return { ...state, drawer: true, requestContext: null, nextRequest: request + 1,
        requests: { ...state.requests, [state.active]: request },
        drafts: { ...state.drafts, [state.active]: '' },
        messages: { ...state.messages, [state.active]: [...state.messages[state.active], { role: 'user', body, request }] } };
    }
    case 'reply': {
      if (state.requests[action.id] !== action.request) return state;
      const requests = { ...state.requests }; delete requests[action.id];
      return { ...state, requests, messages: { ...state.messages, [action.id]: [...state.messages[action.id],
        { role: 'assistant', body: action.body, request: action.request }] } };
    }
    case 'scroll': {
      if (!g) return state;
      next = { ...state, views: { ...state.views, [state.active]: { ...g.view,
        scrollX: g.view.scrollX + (action.dx || 0), scrollY: g.view.scrollY + (action.dy || 0) } } };
      return bounded(next, l);
    }
    case 'scrollTo': {
      if (!g) return state;
      next = { ...state, views: { ...state.views, [state.active]: { ...g.view,
        scrollY: action.y, scrollX: action.x ?? g.view.scrollX } } };
      return bounded(next, l);
    }
    case 'page': {
      if (!g) return state;
      return reduce(state, { type: 'scrollTo', y: (clamp(action.page, 1, g.doc.pages) - 1) * (g.paperHeight + l.paperGap) }, l);
    }
    case 'zoom': {
      if (!g) return state;
      const fit = action.value === 'fit';
      const scale = fit ? Math.min(1, l.fitWidth / g.doc.width) : clamp(Number(action.value), 0.3, 8);
      if (!Number.isFinite(scale)) return state;
      // Preserve the document point underneath the anchor instead of jumping to page top.
      const anchorY = action.y ?? l.top + l.viewHeight * 0.38;
      const anchorX = action.x ?? l.x + l.mainWidth / 2;
      const offsetY = anchorY - g.paperY;
      const anchorPage = clamp(Math.floor(offsetY / (g.paperHeight + l.paperGap)), 0, g.doc.pages - 1);
      const pageY = (offsetY - anchorPage * (g.paperHeight + l.paperGap)) / g.scale;
      const newOffsetY = anchorPage * (g.doc.height * scale + l.paperGap) + pageY * scale;
      const docX = (anchorX - g.paperX) / g.scale;
      const newPaperX = l.x + Math.max(32, (g.doc.width * scale - l.mainWidth) / -2);
      next = { ...state, menu: null, views: { ...state.views, [state.active]: { fit, zoom: scale,
        scrollY: newOffsetY - (anchorY - l.top - 20), scrollX: newPaperX + docX * scale - anchorX } } };
      return bounded(next, l);
    }
    case 'resize': return bounded(state, l);
    case 'notice': return { ...state, notice: action.text, menu: null };
    default: return state;
  }
}
export function spring(value, velocity, target, dt, reduced = false) {
  if (reduced) return { value: target, velocity: 0 };
  const step = Math.min(dt, 1 / 30);
  const nextVelocity = velocity + ((target - value) * 320 - velocity * 32) * step;
  const nextValue = value + nextVelocity * step;
  return Math.abs(target - nextValue) < 0.0001 && Math.abs(nextVelocity) < 0.0001
    ? { value: target, velocity: 0 } : { value: nextValue, velocity: nextVelocity };
}

// Author-written interpolation; source-backed duration, independent easing implementation.
export function beginZoom(from, to, l, now = 0) {
  const a = geometry(from, l), b = geometry(to, l);
  if (!a || !b || from.active !== to.active) return null;
  return { id: to.active, start: now, from: { zoom: a.scale, scrollX: a.view.scrollX, scrollY: a.view.scrollY }, to: { zoom: b.scale, scrollX: b.view.scrollX, scrollY: b.view.scrollY } };
}
export function sampleZoom(state, transition, now = 0, reduced = false) {
  if (!transition || transition.id !== state.active || reduced) return state;
  const t = clamp((now - transition.start) / 150, 0, 1);
  if (t >= 1) return state;
  const k = 1 - Math.pow(1 - t, 3);
  const view = { ...state.views[state.active], fit: false };
  for (const name of ['zoom', 'scrollX', 'scrollY']) view[name] = transition.from[name] + (transition.to[name] - transition.from[name]) * k;
  return { ...state, views: { ...state.views, [state.active]: view } };
}
