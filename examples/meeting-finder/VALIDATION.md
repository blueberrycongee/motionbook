# Run and validation

Open `index.html`. Drag the hour strip, or use Left/Right/Home/End. Find best time scans to 16:00 UTC; Escape resumes replay. Reduced motion begins still and makes direct choices immediate.

The four timezone offsets are fixed demo values, not a timezone database or scheduling service. Reuse `scene.js` and `app.js` for the grid and controls.

- Test: `node test.cjs`
- Render: `node render.cjs` with Sharp and FFmpeg installed; `--stills` exports selected PNGs

Tests cover all hour choices, day offsets, search/interruption, cancellation, keyboard, timing and loop closure using event mocks. Offline previews share the scene; browser rendering, focus, hit areas and performance remain unverified.
