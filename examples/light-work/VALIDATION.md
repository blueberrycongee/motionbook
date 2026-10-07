# Run and validation

Open `index.html`. Hover over the card to control its light; activate the chrome switch to toggle Easy Mode. Leaving resets the switch/light. The switch supports keyboard activation; R replays.

Reuse `controller.js` for hover state and `light-field.js`/`scene.js` for analytic lighting and traveling border strokes.

- Test: `node --test test.cjs`
- Render pose: install Sharp 0.35.4, then `node scripts/render.cjs 8.35 output.png` (add `--native` for full resolution)
- Render sequence: `node scripts/render.cjs all output-directory`
- Regenerate the light field: `make-light-field.py` uses Python, NumPy, Pillow and SciPy

Tests cover reversal, leave/reset, repeated toggles, native timestamps, finite states and loop closure. Offline previews do not verify browser fonts, SVG or performance; the chrome/light field and substitute typeface approximate the reference.
