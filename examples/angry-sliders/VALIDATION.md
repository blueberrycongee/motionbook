# Run and validation

Run `npm start`, then open `http://127.0.0.1:4173`. Drag a slider away from its track and release to launch its handle. Click a track to move its starting point. Arrow keys adjust the focused value; Home/End select bounds; R or Escape restarts playback. Reduced motion disables autoplay and settles released handles immediately.

Reuse `src/controls.mjs` for controls and ballistic motion, and `src/scene.mjs` for SVG rendering. Replay follows native timestamps, including the 0.083333–0.416667-second hold. The silent preview adds an authored reset at 17.8–18.55 seconds.

- Test: `npm test`
- Render: `npm install && npm run render` (FFmpeg required)

Tests cover motion, cancellation, pointer ownership, keyboard bounds and simulated-DOM wiring. Offline previews do not verify real-browser rendering, hit testing, capture or mobile behavior; live physics and unrecorded interaction branches are authored additions.
