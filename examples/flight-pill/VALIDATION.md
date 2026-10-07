# Run and validation

Serve with `python3 -m http.server 8000`, then open `index.html`. Click the pill; × or Escape closes it; R replays. Playback waits for bundled Inter. Reduced motion uses immediate states.

Reuse `scene.js` for the expanding pill, staged content and rolling digits; `app.js` handles local interaction.

- Test: `node test.cjs`
- Render: `npm install && node render.cjs` (FFmpeg required)

Tests cover timing, loop equality, finite SVG and simulated open/close, interruption, replay and reduced motion. Offline renders share the page's scene; actual browser behavior is unverified, and font, icon and blur details can differ from the reference.
