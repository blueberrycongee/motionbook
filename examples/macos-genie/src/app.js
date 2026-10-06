/* Browser adapter: no framework, no network calls, no perpetual idle RAF. */
(async function () {
  'use strict';
  const M = window.GenieMotion, Scene = window.GenieScene;
  const $ = id => document.getElementById(id);
  const canvas = $('scene'), ctx = canvas.getContext('2d');
  const systemMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let state = M.initial(systemMotion.matches), renderer, hovered = false, raf = 0, last = 0;
  let systemReduced = systemMotion.matches, manualReduced = false;
  function announce() {
    const end = state.progress === 0 ? 'Window open' : state.progress === 1 ? 'Window minimized in Dock' : 'Window animation in progress';
    if ($('status').textContent !== end) $('status').textContent = end;
  }
  function paint() {
    if (!renderer) return;
    renderer.draw(ctx, state.progress, { ...state, hover: hovered });
    const moving = state.progress !== state.target;
    const minimized = state.target >= .5;
    $('toggle-label').textContent = minimized ? 'Restore' : 'Minimize';
    $('toggle').firstElementChild.textContent = minimized ? '↗' : '↙';
    $('toggle').setAttribute('aria-label', minimized ? 'Restore window' : 'Minimize window');
    $('window-minimize').hidden = state.progress !== 0;
    $('dock-restore').setAttribute('aria-label', state.progress > 0 ? 'Restore Field Notes from Dock' : 'Field Notes is already open');
    $('dock-restore').setAttribute('aria-disabled', String(state.progress === 0));
    $('progress').value = String(Math.round(state.progress * 1000));
    $('percent').textContent = Math.round(state.progress * 100) + '%';
    const phase = state.progress === 0 ? 'Open' : state.progress === 1 ? 'In Dock' : M.phases(state.progress, state.direction).pull < .01 ? 'Bend' : 'Flow';
    $('phase').textContent = phase;
    $('progress').setAttribute('aria-valuetext', Math.round(state.progress * 100) + ' percent, ' + phase.toLowerCase());
    $('slow').checked = state.speed < 1;
    $('loop').checked = state.mode === 'loop';
    $('reduce').checked = state.reduced;
    $('reduce').disabled = systemReduced;
    $('reduce').title = systemReduced ? 'Enabled by your system preference' : 'Use instant transitions';
    $('replay').disabled = state.reduced;
    $('loop').disabled = state.reduced;
    $('slow').disabled = state.reduced;
    $('progress').disabled = state.reduced;
    $('motion-note').hidden = !state.reduced;
    canvas.dataset.progress = state.progress.toFixed(6);
    canvas.dataset.mode = state.mode;
    canvas.dataset.moving = String(moving);
    canvas.dataset.reduced = String(state.reduced);
    announce();
  }
  function needsFrame() { return state.progress !== state.target || state.mode !== 'manual'; }
  function schedule() {
    if (raf || document.hidden || !needsFrame() || !renderer) return;
    last = performance.now(); raf = requestAnimationFrame(frame);
  }
  function frame(now) {
    raf = 0;
    state = M.tick(state, (now - last) / 1000); last = now;
    paint();
    if (!document.hidden && needsFrame()) raf = requestAnimationFrame(frame);
  }
  function dispatch(event) { state = M.action(state, event); paint(); schedule(); }
  $('toggle').addEventListener('click', () => dispatch({ type: 'toggle' }));
  $('window-minimize').addEventListener('click', () => { $('toggle').focus({ preventScroll: true }); dispatch({ type: 'minimize' }); });
  $('dock-restore').addEventListener('click', () => dispatch({ type: 'restore' }));
  $('dock-restore').addEventListener('mouseenter', () => { hovered = true; paint(); });
  $('dock-restore').addEventListener('mouseleave', () => { hovered = false; paint(); });
  $('dock-restore').addEventListener('focus', () => { hovered = true; paint(); });
  $('dock-restore').addEventListener('blur', () => { hovered = false; paint(); });
  $('replay').addEventListener('click', () => dispatch({ type: 'replay' }));
  $('slow').addEventListener('change', event => dispatch({ type: 'speed', slow: event.target.checked }));
  $('loop').addEventListener('change', event => dispatch({ type: 'loop', enabled: event.target.checked }));
  $('reduce').addEventListener('change', event => { manualReduced = event.target.checked; dispatch({ type: 'reduced', enabled: systemReduced || manualReduced }); });
  $('progress').addEventListener('input', event => dispatch({ type: 'scrub', progress: Number(event.target.value) / 1000 }));
  document.addEventListener('keydown', event => {
    if (event.repeat || event.ctrlKey || event.metaKey || event.altKey) return;
    if (event.key === 'Escape') { event.preventDefault(); dispatch({ type: 'restore' }); return; }
    if (event.target.closest('input, button, a, textarea, select, [contenteditable]')) return;
    if (event.code === 'Space') { event.preventDefault(); dispatch({ type: 'toggle' }); }
    if (event.key.toLowerCase() === 'r') dispatch({ type: 'replay' });
  });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && raf) { cancelAnimationFrame(raf); raf = 0; }
    else schedule();
  });
  systemMotion.addEventListener('change', event => {
    systemReduced = event.matches;
    dispatch({ type: 'reduced', enabled: systemReduced || manualReduced });
  });
  try {
    await Promise.all([document.fonts.load('400 14px "Genie Sans"'), document.fonts.load('500 14px "Genie Sans"')]);
    renderer = Scene.createRenderer((w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; });
    // Optional static frame URLs are useful for documentation and browser visual QA.
    const pose = new URLSearchParams(location.search).get('pose');
    if (pose !== null && !systemReduced) state = M.action(state, { type: 'scrub', progress: Number(pose) });
    $('loading').hidden = true; paint(); schedule();
  } catch (error) {
    $('loading').textContent = 'The desktop could not load. Please reload, or watch the preview linked below.';
    console.error(error);
  }
})();
