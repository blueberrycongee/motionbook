(() => {
  'use strict';
  const S = MatrixScene, C = MatrixController;
  const stage = document.querySelector('.stage');
  const host = document.getElementById('scene');
  const input = document.getElementById('query');
  const cityButton = document.getElementById('city-button');
  const paletteButton = document.getElementById('palette-button');
  const listbox = document.getElementById('results');
  const themeButtons = [...document.querySelectorAll('[data-theme]')];
  const summary = document.getElementById('summary');
  const media = matchMedia('(prefers-reduced-motion: reduce)');
  let state = C.initial(performance.now());
  let frame = 0;
  let lastSvg = '';

  function place(element, rect) {
    element.style.left = `${rect.x / S.W * 100}%`;
    element.style.top = `${rect.y / S.H * 100}%`;
    element.style.width = `${rect.w / S.W * 100}%`;
    element.style.height = `${rect.h / S.H * 100}%`;
  }

  function syncControls() {
    place(cityButton, S.capsuleLayout(state.city, state.search));
    cityButton.hidden = state.search;
    cityButton.setAttribute('aria-expanded', String(state.search));
    cityButton.setAttribute('aria-label', `Change city: ${state.city}`);
    paletteButton.setAttribute('aria-expanded', String(state.controls));
    input.hidden = !state.search;
    input.setAttribute('aria-expanded', String(state.search));
    if (input.value !== state.query) input.value = state.query;
    input.style.color = state.light ? '#111' : '#fafafa';
    document.body.style.background = state.light ? '#ebebeb' : '#171717';
    stage.classList.toggle('light', state.light);
    listbox.hidden = !state.search;
    listbox.replaceChildren();
    const results = S.resultLayout(state.query);
    if (state.search) {
      for (const item of results) {
        const button = document.createElement('button');
        button.type = 'button';
        button.id = `city-result-${item.index}`;
        button.className = 'hit-target';
        button.dataset.city = item.city[0];
        button.setAttribute('role', 'option');
        button.setAttribute('aria-selected', String(item.index === state.activeIndex));
        button.setAttribute('aria-label', `${item.city[0]}, ${item.city[1]}, ${item.city[2]}`);
        button.tabIndex = -1;
        place(button, item);
        listbox.append(button);
      }
    }
    if (state.search && state.activeIndex >= 0) {
      input.setAttribute('aria-activedescendant', `city-result-${state.activeIndex}`);
    } else input.removeAttribute('aria-activedescendant');
    themeButtons.forEach(button => {
      button.hidden = !state.controls;
      button.setAttribute('aria-pressed', String((button.dataset.theme === 'light') === state.light));
    });
    summary.textContent = state.search
      ? `${results.length} ${results.length === 1 ? 'city' : 'cities'} found`
      : S.rows(state.city).map(([time, city]) => `${city}: ${time}`).join('. ');
  }

  function render(now) {
    frame = 0;
    const view = C.view(state, now, media.matches);
    const svg = S.svg(view.time, view.options);
    if (svg !== lastSvg) {
      host.innerHTML = svg;
      lastSvg = svg;
    }
    if (view.animating) frame = requestAnimationFrame(render);
  }

  function requestRender() {
    if (frame) cancelAnimationFrame(frame);
    frame = requestAnimationFrame(render);
  }

  function dispatch(action) {
    state = C.update(state, action, performance.now());
    syncControls();
    requestRender();
  }

  cityButton.addEventListener('click', () => {
    dispatch({ type: 'open-search' });
    input.focus();
  });
  paletteButton.addEventListener('click', () => dispatch({ type: 'toggle-controls' }));
  themeButtons.forEach(button => button.addEventListener('click', () => {
    dispatch({ type: 'theme', light: button.dataset.theme === 'light' });
  }));
  input.addEventListener('input', () => dispatch({ type: 'query', value: input.value }));
  input.addEventListener('keydown', event => {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      dispatch({ type: 'move', delta: event.key === 'ArrowDown' ? 1 : -1 });
    }
    if (event.key === 'Enter' && state.activeIndex >= 0) {
      event.preventDefault();
      dispatch({ type: 'select' });
      cityButton.focus();
    }
  });
  listbox.addEventListener('click', event => {
    const button = event.target.closest('[data-city]');
    if (!button) return;
    dispatch({ type: 'select', city: button.dataset.city });
    cityButton.focus();
  });
  stage.addEventListener('click', event => {
    if (!state.search || event.target.closest('button,input')) return;
    dispatch({ type: 'close-search' });
    cityButton.focus();
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      const searchWasOpen = state.search;
      dispatch({ type: 'escape' });
      (searchWasOpen ? cityButton : paletteButton).focus();
    }
    if (event.key.toLowerCase() === 'r' && event.target !== input && !event.ctrlKey && !event.metaKey && !event.altKey) {
      dispatch({ type: 'replay' });
    }
  });
  media.addEventListener('change', requestRender);
  syncControls();
  requestRender();
})();
