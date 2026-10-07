# Run and validation

Open `index.html`, or run `npm start` and visit `http://localhost:4186`. Click the yellow window button, Minimize/Restore or the Dock thumbnail. Space toggles, Escape restores and R replays. Slow motion, looping and scrubbing are optional; reduced motion uses immediate endpoints.

- Test: `npm test` (Node 20+)
- Render: `npm install --ignore-scripts && npm run render` (FFmpeg required)
- Slow preview: `node render.cjs --slow` (0.25×)
- Stills: `npm run render:stills`

Tests cover measured landmarks, time-varying mouth width, constant texture height, finite geometry, interruption, hidden-page handling and shared preview/runtime timing. The adapter uses a simulated DOM; previews use offline Canvas. Browser layout, accessibility, frame-rate performance and native-device parity remain unverified.
