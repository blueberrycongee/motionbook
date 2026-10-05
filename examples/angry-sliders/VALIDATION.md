# Run and validation

Run `npm start`, then open `http://127.0.0.1:4173`. The full demonstration loops automatically. Drag any slider away from its track and release to launch its handle. Click a track to move its starting point. Arrow keys adjust the focused value; Home and End select its bounds. R or Escape restarts playback. Reduced-motion preference disables automatic playback and settles released handles immediately.

Tests: `npm test`. Re-render: `npm install && npm run render` (FFmpeg required). The browser demo has no package dependency; the offline renderer uses sharp/librsvg. Rendering in this workspace used sharp 0.35.4; full component versions are recorded in `preview/render-info.json`.

## Every-native-frame review

All 990 original source frames and all 990 same-PTS final vector renders were inspected chronologically at 733 × 794 working resolution. UI-region sheets cover every frame; all full-frame images from 660–989 additionally cover the cursor outside that region. Detailed source/replica comparisons cover all four pulls, prediction changes, release streaks, flight, landing hops and settled states.

Review corrected occluded handle-center measurements, OCR ambiguities, residual forked cords immediately after release, white-center fading on press, cursor anchoring when its dark outline is occluded by the bright knob, five open-hand classification errors, and per-frame fill/color timing. The source's early timestamp gap is retained. The final drawing is generated from original vector geometry, not source-video playback.

The limited native-frame diagnostics at 733 px width are:

- Purple-circle center error on 699 unoccluded, sufficiently supported frames: median 0.040 px, 95th percentile 0.413 px, maximum 0.878 px
- RGB mean absolute error over the moving-interface region (x=150–579, y=240–634): 0.833 median, 1.152 at the 95th percentile, and 1.371 maximum per frame, on a 0–255 scale

The circle diagnostic excludes cursor-obscured or inadequately supported masks. The RGB region includes dark background and does not isolate every contour. Neither is a whole-image similarity percentage or proof of pixel identity. Exact measurements are in [the native-frame audit](validation/native-frame-audit.json).

Remaining differences include system-font contours/spacing, small cursor-outline details, subtle dotted-arc and streak opacity/antialiasing, and tiny tether-edge differences. The original audio is omitted. The reset tail and unrecorded live interaction behavior are authored additions.

## Passed checks

Seven Node tests cover all 990 native controls, the early timing gap, all final values, a clean loop, finite bounded ballistic prediction, drag cancellation, secondary-pointer rejection, replacing an in-flight interaction, keyboard bounds, reduced motion, new track anchors, and DOM-stub pointer capture/replay behavior. Thirty-four fresh final-code renders match the reviewed native PNGs byte for byte in decoded RGBA.

The full MP4 is 1466 × 1588 at 60 fps, 19.2 seconds, 1152 frames. The infinite-loop GIF is 733 × 794 at 30 fps, 576 frames. Both decode completely. They are offline renders of the same parametric SVG scene used by the demo, not browser captures. The source is VFR; the preview is a resampling of its native-time model with the documented reset tail.

## Runtime limits

Actual browser rendering, focus, pointer hit testing, real capture/event dispatch and mobile behavior were not tested. Local Chromium and cloud-browser local URLs were already blocked in this task; no restriction was bypassed. Node DOM stubs and offline SVG rendering do not establish a browser-runtime pass. Verify these behaviors in a browser before production use.
