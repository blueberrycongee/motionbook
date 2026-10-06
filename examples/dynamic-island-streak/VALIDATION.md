# Run and validation

Run `npm start`, then open `http://127.0.0.1:4173`. The observed sequence loops automatically. Click the capsule to expand/collapse it, Add to increase the count, Replay to repeat a celebration, or Switch to change its variant. R or Escape restarts the demonstration. Reduced-motion preference disables automatic playback and selects immediate interaction states.

Tests: `npm test`. Re-render: `npm install && npm run render` (FFmpeg required). Node 24.19.0 and sharp 0.35.4 were used here. The browser demo itself has no package dependency.

## Revision correction

Independent review identified an overly low counter clip, missing roll blur, and an incorrect day-dot burst/trace. This revision widens the active roll window to measured y258.45, applies blur outside the scaled glyph transform, and reconstructs the moving/fading prior dot, small center/ring stage, brief eight-lobed pulse and circular new marker. All 64 changed native frames (85–116 and 407–438) were visually re-inspected against the original. Exact decoded RGBA comparison across all 800 frames proves the remaining 736 frames unchanged; every changed pixel lies in the counter or dot-row regions. See [change scope](validation/revision-change-scope.json). The earlier frozen implementation is preserved separately.

## Every-native-frame review

All 800 original full frames and all 800 same-timestamp vector renders were visually inspected at the original 1144 × 720 resolution through chronological full-frame sheets. Enlarged capsule sheets cover frames 32–671; detailed comparisons cover the controls, all 99 projective ember poses, and two corrected cross-background pointer detections.

Review corrected real differences in the first-day fade versus following-day translation, independent flame-center motion, pressed-control scaling, tooltip size/type, late-closing layout constraints, clustered embers incorrectly treated as one shape, and two pointer false matches. The final ember uses a projective transform of an independently drawn rounded plane. No source raster is embedded.

Across all 800 frames:

- Capsule-extremum error at the measured horizontal/vertical centerlines: median 0, 95th percentile 0, maximum 1 px
- Capsule-region RGB mean absolute error per frame: median 2.055, 95th percentile 2.375, maximum 2.998
- Icon-region RGB mean absolute error: 1.500 / 3.888 / 4.361
- Controls-region RGB mean absolute error: 1.089 / 2.840 / 3.216

RGB values use a 0–255 scale. Regions include background; these scoped diagnostics are not a whole-image similarity percentage or proof of pixel identity. Exact regions and per-frame values are in [the native-frame audit](validation/native-frame-audit.json).

Remaining differences include substitute-font contours/spacing, tiny particle silhouettes, shading and overlap, small flame/star edge and gradient details, fine day-dot ring/blur edges, and cursor/icon outlines and antialiasing. These are recorded rather than claiming 100% fidelity. The neutral loop tail and unrecorded live interaction policies are authored additions.

## Passed checks

Seven Node tests cover all 800 finite native states, source count/celebration phases, exact loop reset, capsule continuity under rapid reversals, bounded counts, replay/mode changes, reduced motion, and DOM-stub activation, pressed states, pointer capture/cancellation, hover, accessible-label and keyboard-reset wiring. Sixty fresh final-code renders are byte-identical in decoded RGBA to the reviewed native PNGs.

The full MP4 is 1144 × 720, 60 fps, 14 seconds, 840 frames. The infinite-loop GIF is 858 × 540, 30 fps, 420 frames, including 355 distinct images. Both decode completely. They are offline sharp/librsvg renders of the same parametric SVG scene used by the demo, not browser captures or reference-video playback.

## Runtime limits

Actual browser rendering, real pointer hit testing, focus, event dispatch and mobile behavior were not tested. Local Chromium and cloud-browser local URLs were previously blocked in this task; no restriction was bypassed. Node DOM stubs and offline SVG rendering do not establish a browser-runtime pass. Verify these behaviors in a browser before production use.
