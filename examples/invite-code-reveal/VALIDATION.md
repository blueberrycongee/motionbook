# Run and validation

Run `npm start` and open `http://127.0.0.1:4173`. Click the lid to open/close and Copy to copy `LoveSwiftUI`. Escape/R restarts; reduced motion uses immediate states. Clipboard failure is reported.

Reuse `src/scene.mjs` for the projected lid and `src/controls.mjs` for reversible toggling and clipboard feedback. Contour and glyph outlines share one projective denominator, including edge-on states. The 7.2-second preview contains three cycles plus a neutral tail; the recorded source does not demonstrate Copy.

- Test: `npm test`
- Render: `npm install && npm run render` (FFmpeg required)

Tests cover timing, finite geometry, reversal continuity, reset, reduced motion and clipboard success/failure through DOM stubs. Browser focus, hit testing and system clipboard behavior remain unverified; typography and fine shading are approximations.
