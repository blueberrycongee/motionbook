// Export sampling only. The interactive runtime's 180 ms reveal remains unchanged.
// 50 fps gives exact 20 ms GIF delays; place onset between samples so that the
// first visible sample retains the faint center ramp rather than skipping it.
const fps = 50;
const frameCount = 180;
const revealAtMs = 1320 - 1000 / 120; // first visible frame at +8.333 ms
const resetAtMs = 3050;
const click = {x: 240, y: 180};
const frameTimeMs = i => i * 1000 / fps;
module.exports = {fps, frameCount, revealAtMs, resetAtMs, click, frameTimeMs};
