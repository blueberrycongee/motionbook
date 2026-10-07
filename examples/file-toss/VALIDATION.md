# Run and validation

Run `npm start` and open port 8030. Drag/flick the file toward the bin, or drop it inside. A miss returns the file. Enter/Space deletes it; Undo restores it; Escape or pointer cancellation releases a drag. Replay restarts the sequence. Reduced motion starts paused and resolves deletion immediately. All actions are local demo state.

Reuse `model.js` for toss state and `scene.js` for the vector bin/paper. The 9.4-second replay adds a 1-second return-to-start tail.

- Test: `npm test`
- Still: `npm install`, then `node render.cjs <seconds> <output.png>`
- Sequence: `node scripts/render-sequence.cjs <empty-folder>`
- Encode: `python3 scripts/export.py <frame-folder> <new-media-folder>` (FFmpeg)
- Raster checks: `node scripts/verify-raster.cjs --all`

Tests cover drop/miss, reset, cancellation, replay and reduced motion using a DOM stub. Offline raster checks are environment-dependent; browser execution and performance remain unverified. Paper shading and fine contours approximate the reference.
