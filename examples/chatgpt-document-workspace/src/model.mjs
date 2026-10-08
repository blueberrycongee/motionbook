import { documents } from './documents.mjs';
export const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n));
// Reserve page navigation before fitting and centering document content.
export function layout(width = 1280, height = 1180, sidebar = 1, split = 0, thumbnails = 0, chat = false) {
  const rail = width < 650 ? 0 : 64;
  const side = width < 900 ? 0 : 275 * sidebar;
  const shellX = rail + side;
  const splitTargetWidth = !chat && width - shellX > 740 ? 330 : 0;
  const splitProgress = splitTargetWidth ? clamp(Number(split), 0, 1) : 0;
  const splitWidth = splitTargetWidth * splitProgress;
  const x = shellX + splitWidth;
  const mainWidth = width - x;
  const thumbnailProgress = chat ? 0 : clamp(Number(thumbnails), 0, 1);
  const thumbnailWidth = chat ? 0 : 24 + 146 * thumbnailProgress;
  const readerX = x + thumbnailWidth, readerWidth = mainWidth - thumbnailWidth;
  const top = 128;
  const viewHeight = Math.max(200, height - top);
  const readerComposerWidth = Math.min(636, width - shellX - 48);
  const readerComposerX = width - 22 - readerComposerWidth;
  const composerWidth = chat ? Math.min(670, mainWidth - 48)
    : readerComposerWidth + (splitTargetWidth - 32 - readerComposerWidth) * splitProgress;
  const composerX = chat ? x + (mainWidth - composerWidth) / 2
    : readerComposerX + (shellX + 16 - readerComposerX) * splitProgress;
  return { width, height, rail, side, x, shellX, splitWidth, splitTargetWidth, splitProgress,
    thumbnailProgress, thumbnailWidth, readerX, readerWidth, mainWidth, top, viewHeight, composerWidth,
    composerX, composerY: height - 60,
    fitWidth: Math.max(220, readerWidth - 72), paperGap: 24 };
}
function stateLayout(state, l) {
  return layout(l.width, l.height, Number(state.sidebar), state.split && state.active !== 'chat', state.thumbnails, state.active === 'chat');
}
// Scalar ease-out transitions share one clock for paper, chat pane, and composer.
export function beginMotion(from, to, start = 0, duration = 300) {
  return { from, to, start, duration };
}
export function sampleMotion(transition, now = 0, reduced = false) {
  if (reduced) return transition.to;
  const t = clamp((now - transition.start) / transition.duration, 0, 1);
  return transition.from + (transition.to - transition.from) * (1 - Math.pow(1 - t, 3));
}
export function initialState({ composerVariant = 'conversation' } = {}) {
  return {
    active: 'resume', tabs: ['chat', 'resume'], sidebar: true, split: false, thumbnails: false, menu: null, drawer: false,
    views: Object.fromEntries(Object.keys(documents).map(id => [id, { zoom: 1, fit: true, scrollX: 0, scrollY: 0 }])),
    drafts: { chat: '', resume: '', notes: '' },
    chatContext: null, composerVariant, composerFocused: false, composerMinimized: false, multiline: { chat: false, resume: false, notes: false },
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
    maxX: Math.max(0, paperWidth - l.readerWidth + 64),
    paperX: l.readerX + Math.max(32, (l.readerWidth - paperWidth) / 2) - view.scrollX,
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
  return { ...state, composerFocused: state.active === id && state.composerFocused, active: id, tabs: state.tabs.includes(id) ? state.tabs : [...state.tabs, id], menu: null,
    drawer: false, requestContext: null, history, historyIndex: track ? history.length - 1 : state.historyIndex };
}
export function conversationKey(state) { return state.active === 'chat' ? state.chatContext || 'chat' : state.active; }
export function reduce(state, action, l = layout()) {
  let next = state;
  const g = geometry(state, l);
  switch (action.type) {
    case 'open': {
      next = open(state, action.id);
      return bounded(next, stateLayout(next, l));
    }
    case 'close': {
      if (action.id === 'chat') return state;
      const tabs = state.tabs.filter(id => id !== action.id);
      next = { ...state, tabs, menu: null };
      next = state.active === action.id ? open(next, tabs.at(-1) || 'chat') : next;
      return bounded(next, stateLayout(next, l));
    }
    case 'history': {
      const index = clamp(state.historyIndex + action.delta, 0, state.history.length - 1);
      next = { ...open(state, state.history[index], false), historyIndex: index };
      return bounded(next, stateLayout(next, l));
    }
    case 'thumbnails': {
      next = { ...state, thumbnails: !state.thumbnails, menu: null };
      return bounded(next, stateLayout(next, l));
    }
    case 'split': {
      next = { ...state, split: !state.split, drawer: false, menu: null };
      return bounded(next, stateLayout(next, l));
    }
    case 'sidebar': {
      next = { ...state, sidebar: !state.sidebar, menu: null };
      return bounded(next, stateLayout(next, l));
    }
    case 'menu': return { ...state, menu: state.menu === action.menu ? null : action.menu };
    case 'dismiss': return { ...state, menu: null, drawer: false, requestContext: null, notice: '' };
    case 'drawer': return { ...state, drawer: !state.drawer, menu: null };
    case 'composerOutside': return { ...state, composerFocused: false,
      drawer: state.composerMinimized ? state.drawer : false,
      menu: ['attach', 'dock'].includes(state.menu) ? null : state.menu };
    case 'composerFull': return { ...open(state, 'chat'), chatContext: conversationKey(state) };
    case 'composerExpand': return { ...state, drawer: !state.drawer, menu: null };
    case 'composerMinimize': return { ...state, composerMinimized: true, composerFocused: false, menu: null };
    case 'composerRestore': return { ...state, composerMinimized: false, composerFocused: true, menu: null };
    case 'composerDock': return bounded({ ...state, split: true, drawer: false, composerFocused: false, menu: null }, stateLayout({ ...state, split: true }, l));
    case 'composerFocus': return { ...state, composerFocused: Boolean(action.focused) };
    case 'composerOverflow': return !state.drafts[conversationKey(state)] || !action.overflow ? state
      : { ...state, multiline: { ...state.multiline, [conversationKey(state)]: true } };
    case 'draft': {
      const text = action.text.slice(0, 4000);
      const columns = Math.max(12, Math.floor((l.composerWidth - 121) / 7));
      const overflow = action.overflow ?? text.length > columns;
      const multiline = text.length > 0 && (state.multiline[conversationKey(state)] || text.includes('\n') || overflow);
      return { ...state, drafts: { ...state.drafts, [conversationKey(state)]: text },
        multiline: { ...state.multiline, [conversationKey(state)]: multiline } };
    }
    case 'requestChanges': return { ...state, requestContext: state.active, menu: null, drawer: false };
    case 'send': {
      const body = state.drafts[conversationKey(state)].trim();
      if (!body || state.requests[conversationKey(state)]) return state;
      const request = state.nextRequest;
      return { ...state, requestContext: null, nextRequest: request + 1,
        requests: { ...state.requests, [conversationKey(state)]: request },
        drafts: { ...state.drafts, [conversationKey(state)]: '' },
        multiline: { ...state.multiline, [conversationKey(state)]: false },
        messages: { ...state.messages, [conversationKey(state)]: [...state.messages[conversationKey(state)], { role: 'user', body, request }] } };
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
      const anchorX = action.x ?? l.readerX + l.readerWidth / 2;
      const offsetY = anchorY - g.paperY;
      const anchorPage = clamp(Math.floor(offsetY / (g.paperHeight + l.paperGap)), 0, g.doc.pages - 1);
      const pageY = (offsetY - anchorPage * (g.paperHeight + l.paperGap)) / g.scale;
      const newOffsetY = anchorPage * (g.doc.height * scale + l.paperGap) + pageY * scale;
      const docX = (anchorX - g.paperX) / g.scale;
      const newPaperX = l.readerX + Math.max(32, (g.doc.width * scale - l.readerWidth) / -2);
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

// Text wraps into a stacked editor/control layout and stays stacked until cleared.
// Pixel sizes are this study's layout; the transition curve and state rules are source-backed.
export function composerLayout(state, l, display = {}) {
  const multiline = Boolean(state.multiline[conversationKey(state)]);
  const expansion = display.expansion ?? Number(multiline);
  const inputInset = 57 + (14 - 57) * expansion;
  const inputWidth = l.composerWidth - 121 + (121 - 28) * expansion;
  const columns = Math.max(12, Math.floor((l.composerWidth - (multiline ? 28 : 121)) / 7));
  const rows = state.drafts[conversationKey(state)].split('\n').reduce((n, row) => n + Math.max(1, Math.ceil(row.length / columns)), 0);
  const bodyHeight = display.bodyHeight ?? (multiline ? Math.min(88, Math.max(44, rows * 22)) : 22);
  const composerHeight = bodyHeight + 22 + 30 * expansion;
  const composerY = l.height - 16 - composerHeight;
  const conversationSurface = state.composerVariant === 'conversation' && state.active !== 'chat' && !state.split;
  const headerVisible = conversationSurface && !state.composerMinimized
    && (state.composerFocused || state.drawer || ['attach', 'dock'].includes(state.menu));
  const headerProgress = display.headerProgress ?? Number(headerVisible);
  const headerHeight = 46 * headerProgress;
  const availableHeight = Math.max(composerHeight + 46, l.height - 48);
  const expandedHeight = Math.min(640, availableHeight);
  const transcriptHeight = display.transcriptHeight ?? (conversationSurface && state.drawer && !state.composerMinimized
    ? Math.max(0, expandedHeight - composerHeight - 46) : 0);
  const surfaceHeight = composerHeight + headerHeight + transcriptHeight;
  const minimized = conversationSurface && state.composerMinimized;
  return { ...l, composerY, composerHeight, bodyHeight, expansion, headerVisible, headerProgress, headerHeight, transcriptHeight, conversationSurface, minimized,
    surfaceX: minimized ? l.width - 52 : l.composerX, surfaceWidth: minimized ? 36 : l.composerWidth,
    surfaceY: minimized ? l.height - 52 : l.height - 16 - surfaceHeight, surfaceHeight: minimized ? 36 : surfaceHeight,
    inputX: l.composerX + inputInset, inputY: composerY + 11, inputWidth,
    controlsY: composerY + 5 + (composerHeight - 44) * expansion };
}
// Solve the CSS cubic-bezier's x coordinate before sampling y.
export function composerEase(progress) {
  if (progress <= 0) return 0;
  if (progress >= 1) return 1;
  let lo = 0, hi = 1;
  const coordinate = (t, a, b) => 3 * (1 - t) ** 2 * t * a + 3 * (1 - t) * t ** 2 * b + t ** 3;
  for (let i = 0; i < 24; i++) {
    const t = (lo + hi) / 2;
    if (coordinate(t, .23, .32) < progress) lo = t; else hi = t;
  }
  return coordinate((lo + hi) / 2, 1, 1);
}
export function beginComposerMotion(from, to, start = 0) {
  return { from: { expansion: from.expansion, bodyHeight: from.bodyHeight, headerProgress: from.headerProgress, transcriptHeight: from.transcriptHeight },
    to: { expansion: to.expansion, bodyHeight: to.bodyHeight, headerProgress: to.headerProgress, transcriptHeight: to.transcriptHeight }, start, duration: 300 };
}
export function sampleComposerLayout(state, l, transition, now = 0, reduced = false) {
  if (!transition || reduced || now - transition.start >= transition.duration) return composerLayout(state, l);
  const k = composerEase(clamp((now - transition.start) / transition.duration, 0, 1));
  const display = {};
  for (const key of ['expansion', 'bodyHeight', 'headerProgress', 'transcriptHeight']) display[key] = transition.from[key] + (transition.to[key] - transition.from[key]) * k;
  return composerLayout(state, l, display);
}

export function accumulateWheel(previous, { scale, delta, time, id }) {
  const continuing = previous && previous.id === id && time - previous.time < 200;
  const raw = clamp((continuing ? previous.raw : scale) * Math.exp(-clamp(delta, -20, 20) * .005), .3, 8);
  const stops = [.3, .4, .5, .67, .75, .9, 1, 1.1, 1.25, 1.5, 1.75, 2, 2.5, 3, 4, 5, 6, 7, 8];
  const near = stops.find(stop => Math.abs(raw - stop) / stop < .02);
  return { raw, target: near ?? raw, time, id };
}
