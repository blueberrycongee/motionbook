# Run and validation

Open `index.html` in a browser. The page has no account, API key, build step or network dependency.

- Run pipeline / Replay restarts the complete sequence. Repeated activation starts a clean run.
- The small reset control and Escape return to a stable Ready state.
- Reduced motion starts Ready and completes an activated run immediately.

This is a visual demonstration. It does not run a retrieval service, generate an answer from an API or process credentials.

## Checks

Run `node test.cjs`. Tests cover all 935 selected native-PTS scene states, finite SVG output, bounded panel geometry, timer independence, exact loop endpoints, repeated restart, reset, Escape and reduced motion. `test-results.json` records the result.

To regenerate previews with Node, sharp and ffmpeg installed, run `node render.cjs`. Add `--stills` for the selected PNGs. Run `ffmpeg -v error -i preview/loop.mp4 -f null -` to check video decoding. `FILES.sha256` covers every payload file except the manifest itself.

## Runtime and preview distinction

GIF and MP4 are offline renders of the same SVG scene function used by the page. They are not browser recordings. Actual browser rendering, system-font substitution, pointer hit areas and performance remain unverified because local browser/socket access was restricted. Node event mocks are not a browser-runtime pass. No blocked route was bypassed.

Original native frame comparisons and source footage remain outside the deliverable. Automated checks do not establish visual fidelity; the visual review records coverage and remaining differences separately.

## Bound media

The MP4 contains 1,161 frames at 60fps and lasts 19.35 seconds. The GIF contains 581 frames at 30fps, with centisecond-quantized duration 19.36 seconds. `preview/media-validation.json` records decoding, frame count, actual animation and loop checks. `preview/still-bindings.json` records six fresh raster/PNG byte matches to the frozen scene and tracks.
