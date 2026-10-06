# Run and validation

Run `npm start`, then open http://127.0.0.1:4173 . A static HTTP server also works. The browser demo needs no build step or external assets.

Get invoice takes control of the paper. Click outside or press Escape to close. Replay or R restarts the observed sequence. Reduced motion uses immediate, stationary states. Download PDF creates an illustrative local document; it performs no transaction or network request.

Run `npm test` with Node 20 or later. All 11 checks pass. They cover projective geometry and glyph output, all 831 native timestamp selections, separate reverse-fold paper faces, reset identity, repeated and interrupted controls, reduced motion, DOM event wiring with stubs, and PDF byte offsets. Browser execution and performance were not tested in this reconstruction. DOM-stub checks are not a browser pass.

The original contains 831 video frames at native PTS 0–13.833437 seconds. Every source frame and every full baseline pair was inspected. After the final pen refinement, all 329 changed native pairs were re-inspected at an enlarged scale; exact RGBA reconciliation establishes that the other 502 native frames are unchanged. Separate native-size checks cover both projecting reverse-fold lips and the pen's two passes. All 105 encoded hold/reset tail frames were also inspected. Original footage and comparison images remain local reference evidence; their hashes and the review coverage are recorded in validation/.

The final MP4 contains all 831 native poses followed by 105 authored hold/reset poses: 936 frames at 60 fps, 824 × 720, 15.6 seconds, silent. The looping GIF has 468 frames at 618 × 540, 307 distinct RGB frames, and identical first/last RGB frames. Both media files decode fully. The reset after the source ends is an authored addition.

87 fresh Sharp/librsvg renders match the reviewed PNGs exactly. A complete 936-frame before/after RGBA comparison also passed. A narrow red-stroke support diagnostic reports a median per-frame 95th-percentile distance of 1 pixel and a maximum of 2.19 pixels for eligible frames. It does not measure overall image fidelity. Font contours, optical spacing, small icon and pointer silhouettes, shadows, antialiasing and some colors still differ. No pixel identity or full-image percentage is claimed.

To reproduce frames, install the pinned development dependency with `npm install`, then run `node scripts/render.mjs rendered`. This produces 831 native-time poses plus the authored tail. Run `node scripts/verify-render.mjs rendered binding-report.json` for the fresh-render comparison. Media export used FFmpeg/libx264 for the 60 fps MP4 and a 192-color GIF palette at 30 fps.

This is a new recovery implementation. The unavailable historical 026 freeze and its old tests were not reused as validation. Independent review and remote publication receipts are recorded separately by the publisher.
