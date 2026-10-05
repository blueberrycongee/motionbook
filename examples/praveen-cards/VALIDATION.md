# Run and validation

Run `npm start` with Node.js 20+ and open `http://localhost:4177`. The browser demo has no runtime dependencies. Add Card toggles local state; Expand opens a live detail view. Escape closes it. Reduced-motion preferences start animation paused.

- `npm test`: 15 state/render tests.
- `npm install && npm run render:full`: regenerate 425 frames at 24 fps from the shared Canvas renderer. Encoding uses ffmpeg.
- Preview: offline Canvas render, not a browser recording. MP4 covers the full 17.708-second timeline. GIF covers its first six seconds.
- Approved left v3 / right v2 surface models are unchanged by the presentation cleanup.
- Browser execution was blocked by `socket() failed: Operation not permitted`; runtime interactions, mobile layout and performance remain unverified.
- Geometry, shading, glyphs, fonts and avatars are approximations; no original 3D model or whole-frame pixel match is claimed.
