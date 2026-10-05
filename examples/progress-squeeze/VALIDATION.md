# Run and validation, revision 2

Run `npm start`, then open `http://127.0.0.1:4173`. Click the icon or press Space to pause/resume; R replays. Tests: `npm test`. Re-render: `npm install && npm run render` (FFmpeg required).

## Frame-by-frame work

All 312 actual encoded source frames were extracted at their original presentation timestamps and visually inspected in sequential numbered sheets. The SVG scene was regenerated at all 312 matching timestamps and those frames also inspected. Detailed crops cover the first pinch/recoil and control transformation; the entire second pinch/recoil was reviewed in the full timeline. Counter values were transcribed across all frames, cross-checked with OCR, and ambiguous OCR results checked visually at enlargement.

The original-media URL and hash are in PROVENANCE.md. No gallery-preview transcode was substituted. The earlier 653-frame count referred to a duplicated 120 fps resampling; it is corrected here.

## Quantitative checks

At 956 × 716, comparing unencoded SVG renders with the original:

- Unobstructed background maximum RGB-channel difference: median 0, 95th percentile 0, maximum 1 across all 312 frames.
- Baseline endpoint absolute difference: median 1 px, 95th percentile 2 px, maximum 2 px across 307 measurable frames; five low-contrast/empty frames are excluded from this signal metric.
- The prior 54–70 px weak-recoil overrun was corrected. Stroke geometry is terminally clipped to the actual progress edge and cap extent.

See [native frame measurements](validation/native-frame-audit.json). These signal metrics do not establish a whole-image “100%” match.

## Passed checks and media

Eight Node tests pass: measured plateaus, manual toggle/reset, bounded values, exact loop boundary, finite SVG states, DOM-stub controller wiring/reduced-motion freeze, live manual state after leaving measured playback, and separately timed counter changes. Complete GIF/MP4 decoding passes.

The 198-frame MP4 is 956 × 716 / 30 fps / 6.6 seconds; GIF is a clean 20 fps infinite loop. Offline sharp/librsvg rasterization calls the identical scene generator used by the browser. It is not a browser capture or a replay of reference footage.

## Remaining limits

Transient cubic contour curvature, font contours and antialiasing still differ slightly. The source pointer is omitted. A full pixel-identical match is not claimed; no similarity percentage is invented. Scalar color/endpoint agreement is reported separately from visual contour judgment.

Actual browser runtime remains unverified because local Chromium and the cloud browser's local-URL route were already blocked. These restrictions were not bypassed. DOM stubs do not verify real pointer hit-testing, focus or browser event dispatch. Check in a real browser before production use.
