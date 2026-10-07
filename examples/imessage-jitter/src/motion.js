(function (root, factory) {
  const tracks = typeof module === 'object' ? require('./tracks.js') : root.JitterTracks;
  const api = factory(tracks);
  if (typeof module === 'object') module.exports = api; else root.JitterMotion = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function (TRACKS) {
  'use strict';
  const DURATION = 2.0353667;
  const FPS = 30000 / 1001;
  const clamp = (x, lo, hi) => Math.min(hi, Math.max(lo, Number.isFinite(x) ? x : lo));
  const smooth = x => { x = clamp(x, 0, 1); return x * x * (3 - 2 * x); };
  function graphemes(text) {
    const clean = String(text).replace(/[\r\n\t]/g, ' ').slice(0, 240);
    return typeof Intl.Segmenter === 'function' ? Array.from(new Intl.Segmenter(undefined, { granularity: 'grapheme' }).segment(clean), x => x.segment) : Array.from(clean);
  }
  function pose(index, seconds, fontSize = 35, reducedMotion = false) {
    if (reducedMotion || seconds <= 0 || seconds >= DURATION || !Number.isFinite(seconds)) return { x: 0, y: 0, rotation: 0 };
    const f = clamp(seconds * FPS, 0, TRACKS.length - 1), n = Math.floor(f), alpha = f - n;
    const a = TRACKS[n][index % 9], b = TRACKS[Math.min(n + 1, TRACKS.length - 1)][index % 9];
    const envelope = smooth(seconds / .067) * smooth((DURATION - seconds) / .1);
    const lerp = k => (a[k] * (1 - alpha) + b[k] * alpha) * envelope;
    return { x: lerp(0) * fontSize / 35, y: lerp(1) * fontSize / 35, rotation: lerp(2) * Math.PI / 180 };
  }
  function glyphPose(offset, seconds, fontSize = 35, reducedMotion = false) {
    const p = pose(8, seconds, fontSize, reducedMotion);
    return { x: p.x + (Math.cos(p.rotation) - 1) * offset, y: p.y + Math.sin(p.rotation) * offset, rotation: p.rotation };
  }
  function layout(text, measure, { fontSize = 24, maxWidth = 330 } = {}) {
    const glyphs = graphemes(text);
    const natural = glyphs.map((char, i) => ({ char, width: Math.max(0, measure(char, fontSize)), index: i }));
    const total = natural.reduce((s, a) => s + a.width, 0);
    const scale = Math.min(1, maxWidth / Math.max(1, total));
    let x = 0;
    return { fontSize: fontSize * scale, width: total * scale, glyphs: natural.map(g => { const r = { ...g, x, width: g.width * scale }; x += r.width; return r; }) };
  }
  class Controller {
    constructor({ reducedMotion = false } = {}) { this.epoch = 0; this.elapsed = 0; this.playing = false; this.reducedMotion = reducedMotion; this.generation = 0; }
    replay(now) { this.generation++; this.epoch = now; this.elapsed = 0; this.playing = !this.reducedMotion; return this.generation; }
    sample(now) { if (this.playing) { this.elapsed = clamp((now - this.epoch) / 1000, 0, DURATION); if (this.elapsed >= DURATION) this.playing = false; } return this.elapsed; }
    pause(now) { this.sample(now); this.playing = false; }
    resume(now) { if (!this.reducedMotion && this.elapsed < DURATION) { this.epoch = now - this.elapsed * 1000; this.playing = true; } }
    cancel() { this.generation++; this.elapsed = 0; this.playing = false; }
    setReducedMotion(value) { this.reducedMotion = Boolean(value); if (value) this.cancel(); }
  }
  function previewTime(t) { const phase = ((t % 4.5) + 4.5) % 4.5; return { selected: phase >= .65, seconds: phase >= .65 ? Math.min(DURATION, phase - .65) : 0, phase }; }
  return { DURATION, FPS, pose, glyphPose, layout, graphemes, Controller, previewTime, smooth, clamp };
});
