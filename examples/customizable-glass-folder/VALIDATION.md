# Run and validation

Open `index.html`. New folder creates the folder; swatches change its color. Activate its label or press F2 to rename, Enter to save and Escape to cancel. Drag on the glass to draw; Enter/Space draws the sample heart. Delete clears the drawing; Escape returns to the menu. Reduced motion uses immediate states.

- Test: `node test.cjs`
- Render: `node render.cjs` with Sharp and FFmpeg; add `--stills` for PNGs only

Tests cover finite scenes, loop endpoints, phases, text escaping and simulated events. Numeric arc lengths preserve partial strokes across renderers. Offline previews do not verify browser SVG, fonts, pointer capture, focus or performance.
