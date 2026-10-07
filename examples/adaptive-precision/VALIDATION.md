# Run and validation

Run `npm start` and open `http://localhost:8035`. Drag up or down to create a quarter-hour interval; reverse across the anchor during a drag. Use the replay, timeline and reset controls to inspect the motion. Keyboard: arrows move by quarter hours, Space starts/releases, Escape cancels.

Reuse `src/model.js` for interval interaction, `src/scene.js` for vectors, and `src/trace.js` for replay. Live interaction and replay share the scene; the live response model is independently inferred.

- Test: `npm test`
- Render: `npm install`, then `node scripts/render.cjs all preview/frames`
- Loop frames: `node scripts/loop.cjs preview/loop-frames preview/frames`
- Optional browser smoke test: start the server, then `npm run test:browser`

The full MP4 preserves the reference span; the GIF adds a pointer-return bridge. Tests cover the model, mock DOM and native-time geometry. Real-browser behavior remains unverified; Inter, antialiasing and the inferred live model may differ from the reference.
