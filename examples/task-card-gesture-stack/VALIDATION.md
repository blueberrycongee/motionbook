# Run and validation

Open `index.html` directly or serve this directory with `python3 -m http.server 8000` and visit the local address. There is no build step, application dependency, network request, account or API key.

The native-timed demo replays automatically. Drag a card horizontally, press Enter or an arrow key while the card is focused, or use Snooze, Complete and Next to dismiss it. After completion, an action restarts the stack. `R` replays and Escape stops autoplay. Reduced-motion preference starts with a still state and makes explicit dismissals immediate.

## Tests

Run `node test.cjs`. It checks all 372 native/tail states, finite scene output, four card phases, completion/reset, modulo seam, pointer drag, action buttons, keyboard behavior, restart, Escape and reduced-motion handling using a simulated DOM.

These are offline code and SVG checks. A real browser interaction test has not been completed. Local Chromium launch and local-site browser access were denied earlier in the project; no bypass was attempted. Offline preview media is not a browser recording. A public remote browser cannot establish the behavior of these unpublished local files.

## Preview reproduction

`node render.cjs` uses the same `scene.js` and native timing as the web demo. It requires Node, Sharp and FFmpeg in the build environment. The checked-in web demo does not require them. Rendering uses isolated 32-frame SVG chunks with two worker threads, followed by separate MP4 encoding and a two-pass GIF palette. Set `AUDIT_DIR` to retain the PNG sequence outside the package; `--encode-existing` reuses that sequence.

The MP4 contains all 348 observed native frames plus a 24-frame authored neutral loop tail, 372 frames at 60 fps, 6.2 seconds. The animated GIF is a 30 fps sampling of the same complete sequence. Neither includes original footage, labels, scores or comparison panels.

## Visual review

All 348 original native frames and their final replica counterparts were inspected consecutively, plus all 24 authored tail frames. Enlarged checks cover the four gestures, promotion, completion, device scaling and return. The exact source PTS, current code/media hashes, complete frame bindings and review coverage are retained in the external audit report. Sixteen fresh scene renders match the reviewed PNGs; first and last loop pixels match exactly. The independent implementation uses substitute font contours and authored vector symbols. Fine glyph contours, hand-drawn symbol strokes, low-contrast shadow falloff and subpixel softness are not claimed pixel-identical. Native edge and luminance measurements have video-compression/threshold uncertainty; they are not recovered original CSS.

## Focused revision

Independent review led to a softness-only correction: incoming card content resolves later, the returning card keeps its observed blur, and completion lines retain their separate exit visibility. All 88 changed native frames and 10 enclosing boundary frames were inspected in 13 consecutive delta sheets. Exact RGB comparisons preserve the prior complete review for the other 260 native frames and all 24 tail frames. Geometry, gestures, fonts and the device remain unchanged. Fine horizontal variation within the source’s exiting middle completion line remains approximate.
