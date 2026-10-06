# Run and validation

Run `npm start` and open port 8030. Drag and flick the example file toward the bin, or drop it inside. A miss returns the file and updates the counter. Enter or Space on the file deletes the example; Undo restores it. Escape or pointer cancellation releases a drag. Replay restarts the recorded sequence. Reduced-motion mode starts paused and resolves a live deletion without animated travel. These controls affect only the demo’s local state.

The preview preserves all 282 original native frame times at 30 fps, then adds 30 authored closing frames. Its duration is 10.4 seconds. Every native source/replica pair and every closing pose was inspected, including enlarged complete-card and paper-transition details. Both media files decode fully, and the GIF is animated with matching endpoints.

Run `npm test` for nine Node checks of observed states, direct drop, miss/return, keyboard deletion, reset, time wrapping, cancellation, Replay during dragging, repeated action and reduced motion. DOM checks use a stub. Browser execution and performance remain unverified.

Install the declared Sharp development dependency with `npm install`. Run `node scripts/verify-raster.cjs --all` to freshly compare all 312 offline RGBA states with the included hashes. Exact hashes depend on the rendering environment. Run `node scripts/render-sequence.cjs <empty-folder>` to generate PNGs, then `python3 scripts/export.py <frame-folder> <new-media-folder>` to encode the previews with FFmpeg. `node render.cjs <seconds> <output.png>` renders one still.

The bin, paper, document, smoke and cursors are independently drawn SVG artwork. Fine paper crease silhouettes and changing surface shading differ from the reference’s apparent 3D paper. Fine cursor and font contours, compression and antialiasing also differ. The closing return and unrecorded live gestures are authored extensions. No pixel identity or unmeasured fidelity percentage is claimed.
