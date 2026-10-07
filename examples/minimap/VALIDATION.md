# Run and validation

Run `npm start` and open `http://localhost:8037`. Move over the ticks; arrows move a keyboard pointer and Escape leaves the field. Try it enables live hover, Replay follows the recorded trace, Reset clears deformation, and the timeline scrubs poses.

Reuse `src/model.js` for the live spring and `src/scene.js` for the field. All 49 x positions stay fixed at 18 px spacing; five accent ticks stay dark and the playhead does not advance.

- Test: `npm test`
- Render: `npm install`, then `node scripts/render.cjs all preview/frames`
- Native concat timeline: `python scripts/concat.py preview/frames preview/native.ffconcat`
- GIF loop frames: `node scripts/loop.cjs preview/frames preview/loop-work`
- Optional browser checks: start the server, then `npm run test:browser`

Encode the concat timeline with FFmpeg in VFR mode: its double-duration gaps must not be replaced by assumed constant-rate samples. The GIF adds a 0.1-second settling bridge; the MP4 does not.

Tests cover exit/re-entry, keyboard/reset/replay, timing gaps and finite geometry. Offline renders and mock DOM do not verify browser behavior; the live spring and pointer artwork are approximations.
