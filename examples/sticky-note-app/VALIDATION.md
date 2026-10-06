# Validation

- `node --check scene.js`, `node --check app.js` and `node --check motion-data.js`: passed.
- `node --test tests/*.test.cjs`: 8 passed, 0 failed. Full output is in `tests/results.txt`.
- Tests cover repeated forward/reverse navigation, swipe, filters, reset, Escape, takeover of recorded playback, finite geometry and counter timing independent of paper color, and measured underline draw-on phases.
- Actual browser runtime not executed in this validation; preview rendered offline from shared scene code. DOM-event adapter tests do not establish browser rendering/performance.
- The MP4 is a 1080×1080, 24 fps, 456-frame, 19-second offline Canvas render of the same scene used by the browser demo. The GIF has 380 frames at 20 fps, 864×864, and loops indefinitely.
- Original-frame comparison uses all 383 encoded source frames at their exact ffprobe timestamps. Every source/replica pair was visually inspected, then re-inspected after corrections. Numerical diagnostics and full-frame coverage were not used as substitutes for that inspection.
- The first 16 seconds follow the source recording. The final 3 seconds are an independently authored return to the first note. All 72 closing frames were inspected; first, last encoded scene state and 19-second scene state have identical raw RGBA hashes.
- `REVIEW-BINDING.json` binds the final media and code. `FILES.sha256` covers every payload file except itself. Reference footage and source comparison crops remain outside this package.

The demo changes local state only. It does not join meetings or contact any remote service.

## Run locally

Run `python3 -m http.server 4173` here, then open `http://localhost:4173`.

Use the arrow buttons or left/right keys to browse, switch categories, or press Escape to replay.
