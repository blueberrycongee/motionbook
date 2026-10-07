# Run and validation

Open `index.html`. Drag the center, a tip or a strand to take control. The center springs home; detached tips fall or snap to anchors. R or the upper-right control restarts; color controls change the background.

- Test: `npm test`
- Render one pose: `npm install`, then `node scripts/render.cjs 115 frame.png`
- Render sequence: `node scripts/render.cjs --all frames`
- Raster checks: `npm run verify` or `npm run verify -- --all`

Tests cover dragging, reassignment, free ends, reset, native timing, folded geometry, replay-to-physics conversion and the loop seam. RGB checks depend on Sharp/librsvg and fonts. Offline previews do not verify browser execution or performance; fine contours and live behavior may differ from the reference.
