# Run

`index.html` plays the included preview; click or tap to replay. It is not a message composer or a connection to ChatGPT.

- Serve: `npm start` (Python 3), then open `http://127.0.0.1:4178`
- Test: `npm test` (Node 20+)
- Render: `npm install && npm run render` (FFmpeg and Noto Sans CJK SC required)

Reuse `src/motion.mjs` for sampled spring/easing math and `src/pipeline.mjs` for geometry, separate animation tracks, spacing and grouped-row layout. `scripts/scene.mjs` draws a 360 × 480 CSS-space scene at 2× raster scale.
