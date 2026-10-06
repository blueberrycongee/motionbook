# Run

The browser demo has no build step and no runtime network dependency. From this directory run `python3 -m http.server 4173`, then visit `http://localhost:4173` in a Canvas-capable browser.

Use the arrow buttons or left/right keys to browse, switch categories, or press Escape to replay.

Keyboard-accessible transparent HTML controls overlay the independently drawn Canvas scene. Reduced-motion preference starts in manual mode.

Development-only offline preview generation: install the pinned `@napi-rs/canvas` dependency with `npm install`, ensure FFmpeg is available, then run `node --expose-gc render.cjs`. Run `node --test tests/*.test.cjs` for state and simulated DOM-event tests. Rendering is offline and is not a browser capture.
