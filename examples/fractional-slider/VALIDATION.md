# Run and validation

Run `python3 -m http.server 8038` and open `http://localhost:8038`. Scrub the timeline to inspect a pose. Try it enables drag, scroll, arrows and Shift for finer changes. Home, double-click or Reset returns to zero; Escape cancels a gesture.

Reuse `src/model.js` for signed input and bounds, `src/scene.js` for ruler/rings and `src/trace.js` for replay. Selection colors, press rings and cursor changes have independent tracks; the six-second replay closes without an added tail.

- Test: `npm install && npm test`
- Render sequence: `npm run render -- OUTPUT_DIR`
- Render pose: `node scripts/render-frame.cjs 160 frame.png`

Rendering uses Sharp; media encoding requires FFmpeg. Tests cover input, cancellation, scrubbing, finite interpolation and loop equality with simulated DOM. Browser fonts, touch and accessibility remain unverified; Inter and analytic ring textures approximate the reference.

[Source and asset provenance](PROVENANCE.md)
