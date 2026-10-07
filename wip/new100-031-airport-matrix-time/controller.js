(function (root) {
  'use strict';
  const scene = typeof module !== 'undefined' ? require('./scene') : root.MatrixScene;
  const THEME_MS = 440;
  const REVEAL_MS = 1800;
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

  function initial(now = 0) {
    return {
      city: 'Tokyo', light: false, search: false, controls: false, query: '',
      activeIndex: -1, revealAt: now, changedRow: null,
      themeAt: now, themeFrom: 0, themeTo: 0
    };
  }

  function themeMix(state, now) {
    const progress = clamp((now - state.themeAt) / THEME_MS, 0, 1);
    return state.themeFrom + (state.themeTo - state.themeFrom) * progress;
  }

  function closeSearch(state) {
    return { ...state, search: false, query: '', activeIndex: -1 };
  }

  function update(state, action, now = 0) {
    switch (action.type) {
      case 'open-search':
        return { ...state, search: true, controls: false, query: '', activeIndex: -1 };
      case 'close-search':
        return closeSearch(state);
      case 'query':
        return { ...state, query: String(action.value), activeIndex: -1 };
      case 'move': {
        const count = scene.filtered(state.query).length;
        if (!state.search || count === 0) return { ...state, activeIndex: -1 };
        const next = state.activeIndex < 0
          ? (action.delta > 0 ? 0 : count - 1)
          : (state.activeIndex + action.delta + count) % count;
        return { ...state, activeIndex: next };
      }
      case 'select': {
        const city = action.city || scene.filtered(state.query)[state.activeIndex]?.[0];
        if (!state.search || !scene.cities.some(item => item[0] === city)) return state;
        return {
          ...closeSearch(state), city,
          changedRow: city === state.city ? state.changedRow : 4,
          revealAt: city === state.city ? state.revealAt : now
        };
      }
      case 'toggle-controls':
        return { ...closeSearch(state), controls: !state.controls };
      case 'theme': {
        const light = !!action.light;
        if (light === state.light) return state;
        return { ...state, light, themeFrom: themeMix(state, now), themeTo: light ? 1 : 0, themeAt: now };
      }
      case 'escape':
        return { ...closeSearch(state), controls: false };
      case 'replay':
        return { ...state, revealAt: now, changedRow: null };
      default:
        return state;
    }
  }

  function view(state, now, reduced = false) {
    return {
      time: reduced ? REVEAL_MS / 1000 : Math.max(0, now - state.revealAt) / 1000,
      options: { ...state, themeMix: reduced ? state.themeTo : themeMix(state, now) },
      animating: !reduced && (
        now - state.revealAt < REVEAL_MS ||
        (state.themeFrom !== state.themeTo && now - state.themeAt < THEME_MS)
      )
    };
  }

  const api = { THEME_MS, REVEAL_MS, initial, update, view, themeMix };
  if (typeof module !== 'undefined') module.exports = api;
  else root.MatrixController = api;
})(globalThis);
