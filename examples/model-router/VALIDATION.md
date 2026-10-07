# Run and validation

Run `npm install && npm start` and open port 8041. Select a policy, hover routes/rows, toggle fallback or choose a source model. Conflicting destinations swap. Escape closes the menu; reduced motion starts paused and applies changes immediately. Deploy updates only the local demo baseline; the reference shows no deployment result.

Reuse `model.js` for routing state, `motion.js` for transitions and `scene.js` for coordinated graph/table visuals. Replay uses native variable timestamps plus an authored two-second return.

- Test: `npm test`
- Raster checks: `node verify-raster.cjs` (add `--all` for every state)
- Still: `node render.cjs <seconds> <output.png> --native` (`--full` uses direct full-SVG rasterization)
- Export frames: `node export.cjs <new-output-folder> --render-only`
- Encode: `node export.cjs <same-folder> --encode-only` (FFmpeg required)

Checks use mocked DOM and offline SVG. Actual browser behavior remains unverified; fonts, pointer contours, particle overlaps and shading approximate the reference.
