# Run and validation

Run `npm start` and open `http://127.0.0.1:4173`. Choose or drop a file to replay using its name; contents are never read or uploaded. Escape/R restarts. Reduced motion displays the selected state immediately.

Reuse `src/scene.mjs` for the perspective folder, separate light envelopes and opaque document-occlusion mask; `src/controls.mjs` handles local picker/drop state. The preview adds a short settling tail.

- Test: `npm test`
- Render: `npm install && npm run render` (FFmpeg required)

Tests cover drag re-entry, selection/cancellation, filename escaping, finite scenes and simulated events. Offline previews do not verify browser masks, file-picker UI, focus or hit testing; lighting and fine contours approximate the reference.
