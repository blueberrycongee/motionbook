# Run and validation

Run `npm start` and open `http://127.0.0.1:4173`. Hover/focus illuminates, click selects, Left/Right/Home/End navigate, and R replays. Reduced motion uses immediate states.

Reuse `src/scene.mjs` for analytic reflections and `src/measured.mjs` for underline growth/collapse, text brightness and light intensity. The six-second loop adds one neutral frame.

- Test: `npm test`
- Render: `npm install && npm run render` (FFmpeg required)

Tests cover timing, loop equality, rapid reversal, finite SVG and simulated control events. Offline previews share the scene but do not verify browser rendering, focus or hit testing; font/icon contours and reflection edges are approximations.
