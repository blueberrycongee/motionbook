# Run and controls

Run `npm start`, then open `http://127.0.0.1:4173`. Any static HTTP server also works; no build or external assets are needed.

Get invoice takes control of the paper. Click outside or press Escape to close. Replay or R restarts. Reduced motion uses immediate still states. Download PDF creates an illustrative local document without a transaction or network request.

- `npm test` (Node 20+): projective geometry, glyphs, native timing, reverse folds, repeated/interrupted controls, reduced motion and PDF output.
- `npm install && node scripts/render.mjs rendered`: render the sequence with Sharp.

Previews are offline renders. Browser interaction and performance remain untested. Font contours, spacing, icons, pointer, shadows and colors differ from the reference. See [source and loop sequence](PROVENANCE.md).
