# Run and validation

Run `npm start` and open port 8040. Move across the chart to scrub time. Arrow keys move one minute; Home/End select endpoints; Replay restores the recorded sequence. Reduced motion starts paused.

Reuse `curve.js` for path-distance sampling, `model.js` for input and `scene.js` for drawing. Marker and guide positions are separate tracks. The source's matching endpoint state closes the replay without an extra bridge.

- Test: `npm test`
- Still: `npm install`, then `node render.cjs <seconds> <output.png>`
- Sequence: `node render.cjs all <folder>`
- Raster checks: `node verify.cjs` (optional comma-separated frame indices)
- Full export: `node export.cjs <new-folder>` (FFmpeg; refuses an existing directory)

Tests use a DOM stub; offline raster checks do not verify browser execution. Font contours, pointer details and the fitted curve approximate the reference.
