# Run and validation

Run `npm start` and open `http://127.0.0.1:4173`. Drag the age slider or use arrows; Replay/R restarts. A drag takes over from the current pose, bounded to 0–90 years. Reduced motion uses immediate states.

Reuse `src/fronts.mjs` for the fill/clear front and `src/controller.mjs` for input. The 90 × 52 grid keeps all 4,680 cells editable. Counters, age pill, row fronts, marker/pulse and sparse highlights are separate tracks; the marker can lag the count. The 16.8-second loop adds a hold and reset crossfade after the reference sequence.

- Test: `npm test` (Node 20+)
- Render: `npm install && node scripts/render.mjs rendered`
- Raster checks: `node scripts/verify-render.mjs rendered` (add `--all` for every frame)
- Encode: `python3 scripts/encode.py rendered exported` (FFmpeg)

Tests cover replay, interruption, handoff, endpoints and simulated-DOM controls. Offline rendering does not verify browser behavior or performance; font, pointer, halo and edge details may differ from the reference.
