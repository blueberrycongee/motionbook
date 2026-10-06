# Run and validation

Run `npm start` and open http://127.0.0.1:4173 . The browser demo uses local ES modules and independently drawn SVG, with no build step or external assets.

Drag the age slider or focus it and use the arrow keys. Replay or R restarts the recorded sequence. A new drag takes control from the current pose; repeated changes stay bounded between zero and ninety years. Reduced motion applies immediate stationary states.

Run `npm test` with Node 20 or later. Eleven checks pass. They cover all 445 native count and marker states, the 90 by 52 grid, deterministic replay and reset, interrupted and repeated age changes, both endpoints, preservation of the current fade/pulse/ink at handoff, reduced motion, and actual DOM adapter handlers with stubs. Browser execution, browser rendering and performance have not been tested. DOM-stub checks are not a browser pass.

The original is 1920 × 1514 with 445 encoded video frames at 30 fps. Its native timestamps run from 0 to 14.8 seconds, with a stream duration of 14.833333 seconds. The replay retains the source's separately moving counter, age pill, curved fill/clear front, lagging current-cell marker, pulsing translucent halo, sparse highlighted cells and pointer transitions. The complete card, legends and three counters are retained.

Every original native frame and all 445 r9 full-scene pairs and enlarged marker/counter/pill pairs were inspected. That review found small false fill-front bulges caused by sparse highlights entering the boundary measurement. The final correction measures the broad boundary separately and draws the isolated highlights as individual cells. All 246 final affected regions were re-inspected, with complete bounds and proportional scale labels. Exact before/after comparisons confirm that the other 199 native rasters and every pixel outside those changed regions match the reviewed baseline. Seventeen additional native-pixel comparisons cover the main transitions. All 59 final encoded tail frames were inspected separately.

Forty-one fresh Sharp/librsvg renders match the reviewed PNG hashes. All 504 before/after rasters, all 445 source RGB/PNG hashes and native timestamps are recorded in validation/. The silent MP4 has 504 frames at 1920 × 1514 and 30 fps. The GIF has 504 frames at 960 × 757, 461 distinct RGB frames, infinite looping and identical first/last RGB frames. Both media files decode fully. These checks bind the deliverable; they do not establish full-image identity.

The demo lasts 16.8 seconds: the 445 original poses, a final hold, an authored crossfade to the opening pose, and an opening hold. The reset after the source ends is an authored addition. Original footage and comparison images remain local reference evidence and are excluded from this package.

Font contours and optical spacing, pointer silhouettes, subtle halo/clearing falloff, subpixel edge placement, antialiasing and some colors differ from the footage. The row-front and marker controls were measured from visible geometry; they do not establish the original implementation's algorithm. No pixel identity or full-image fidelity percentage is claimed.

For offline reproduction, install the pinned development dependency with `npm install`, then run `node scripts/render.mjs rendered`. This generates 445 native poses and 59 authored tail poses from the same SVG scene used by the browser. Run `node scripts/verify-render.mjs rendered` for selected fresh raster bindings, or append `--all` for the complete export. `python3 scripts/encode.py rendered exported` creates `exported/loop.mp4` and `exported/loop.gif` using FFmpeg. Offline rendering is separate from browser testing.

This is a new recovery implementation. The unavailable historical 027 files and their reviews were not reused as validation. Independent review and publication receipts are recorded separately by the publisher.
