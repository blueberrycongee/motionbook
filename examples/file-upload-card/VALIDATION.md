# Run and validation

Run `npm start`, then open `http://127.0.0.1:4173`. The demo loops automatically. Choose or drop a local file to replay the interaction using its name. Escape or R restarts the demonstration. Reduced-motion preference freezes motion and displays the selected state immediately.

Tests: `npm test`. Re-render: `npm install && npm run render` (FFmpeg required).

## Native-frame review

All 223 encoded frames of the original 60 fps media were inspected in chronological motion-region sheets, with enlarged source/replica pairs for rest, open hold, document descent, light peak, fade and close. All 223 corresponding final SVG renders were reviewed at the original timestamps at 720 × 720 working resolution. No gallery-preview cadence was substituted.

The all-frame comparison measures these limited coordinates at 720 px:

- Front tab top: median / 95th percentile / maximum absolute error 0 / 0 / 1 px
- Front long rim: 0 / 1 / 1 px
- Front left edge: 0 / 0 / 0 px
- Front right edge at y=320: 1 / 2 / 2 px

The upper-right extrema were deliberately excluded because the recorded cursor crosses that region. Using them initially distorted the reconstructed folder; that defect was corrected. A separate opaque occlusion mask also prevents the document from leaking through the folder's artistic bottom fade.

The grayscale mean absolute error over the folder region (x=180–544, y=180–429) has a per-frame median 3.26 and maximum 5.63 on a 0–255 scale. This region includes the moving document and pointer. These measurements are diagnostics, not a whole-image similarity percentage. See [native frame audit](validation/native-frame-audit.json).

Remaining differences include system-font contours, small corner and edge deviations, cursor contour details, and the exact light falloff/surface tint, especially around the back panel and inner bloom. No pixel-identity or 100% match is claimed.

## Checks

Six Node tests pass: native phases and loop; repeated drag enter/leave/re-entry; file selection and cancellation; escaped filenames and negative elapsed time; finite output through every authored frame; DOM-stub picker/drop/reset/reduced-motion wiring; and regressions for opaque occlusion and cursor-independent width (some checks share a test).

The 4-second MP4 is 720 × 720, 60 fps, 240 frames. The infinite-loop GIF is 720 × 720 at 30 fps. Both were completely decoded with FFmpeg. They are rendered offline by sharp/librsvg from the same `scene.mjs` used by the browser, not captured from a running browser and not reference-video playback.

## Runtime limits

Actual browser rendering, file-picker UI, pointer hit testing, focus and real event dispatch were not tested. Local Chromium and cloud-browser local URLs were previously blocked in this task, and those restrictions were not bypassed. Node model tests and DOM stubs do not establish a browser-runtime pass. Verify browser SVG/mask rendering and interactions before production use.
