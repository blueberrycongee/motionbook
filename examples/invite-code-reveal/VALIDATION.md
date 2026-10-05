# Run and validation

Run `npm start`, then open `http://127.0.0.1:4173`. The three-cycle demonstration loops automatically. Click the lid to open/close it, and use Copy to copy `LoveSwiftUI`. Escape or R restarts playback. Reduced-motion preference uses immediate selected states. Clipboard failure is reported without claiming success.

Tests: `npm test`. Re-render: `npm install && npm run render` (FFmpeg required).

## Full native-frame review

All 383 original VFR frames were inspected, including each opening, overshoot, edge-on crossing, spring recoil, hold and closing. All 383 final projected SVG renders were reviewed at exactly the same native timestamps at 720 × 720 working resolution. This is an original-media audit, not a gallery-preview or nominal-fps frame count.

The limited geometry diagnostics at 720 px are:

- Lid-top ridge: absolute error median 0, 95th percentile 0, maximum 2 px over 382 measurable frames
- Back-lid width: 0 / 1 / 2 px over 204 back-facing frames
- Front green-circle center: 0.5 / 1 / 1.5 px over 350 measured x/y coordinates

The top-ridge detector requires 12 bright pixels per row. Frame 35 is nearly edge-on and lacks adequate support; it was visually inspected and its height was separately refined from the green-pixel centroid. An earlier “any bright pixel” detector reported a 6 px error there based on only three isolated bright source pixels. That distinction is recorded rather than presenting the supported-ridge measurement as complete contour identity.

Across all 383 frames, the RGB mean absolute error in the moving-card region (x=45–674, y=140–439) has a per-frame median 3.44, 95th percentile 3.86, and maximum 5.79 on a 0–255 scale. These are limited diagnostics, not a whole-image similarity percentage. See the [native-frame audit](validation/native-frame-audit.json).

Review corrected insufficient back-lid width, inaccurate near-edge-on interpolation, a clipped shadow and the shadow's changing spread. The geometry, text outlines and arrow share a projective transform. No reference raster is embedded.

Remaining differences include the licensed substitute typeface's contours and spacing, localized pointer/rim details, and the exact horizontal shadow falloff and small green highlights. No 100% or pixel-identity claim is made.

## Passed checks

Five Node tests cover all 383 timestamped poses, all three observed cycles, finite vector output, the clean loop, repeated target reversal with continuous pose, reduced motion, clipboard success/failure and stale-response guarding through DOM stubs, and reset behavior. Fifteen fresh scene renders are byte-identical to the corresponding reviewed native rasters.

The complete 7.2-second MP4 is 720 × 720 at 60 fps (432 frames). The infinite-loop GIF is 720 × 720 at 30 fps. Both decode completely. They are offline sharp/librsvg renders of the same vector scene used by the demo, not browser captures or playback of the reference video. The full source sequence is preserved with a short neutral tail.

## Runtime limits

Actual browser rendering, focus, pointer hit testing, real event dispatch and system clipboard behavior were not tested. Local Chromium and cloud-browser local URLs were already blocked in this task; restrictions were not bypassed. DOM stubs and offline SVG rendering do not establish a browser-runtime pass. Check these behaviors in a browser before production use.
