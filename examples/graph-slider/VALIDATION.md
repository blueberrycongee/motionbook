# Run and validation

The implementation and previews have passed complete source-frame comparison and an independent review. Browser execution remains untested.

Run `npm start` and open port 8040 in a permitted browser. Move across the chart to scrub its time. The pointer position controls distance along the drawn curve. Arrow keys move one minute; Home and End select either endpoint. Replay restores the recorded sequence. Reduced motion starts paused.

All 552 original source frames were inspected, then compared against the replica in 23 full-canvas sheets and 46 enlarged chart sheets. Eleven full-size states, all 61 distinct time labels, enlarged pointer and crest details, and two corrected marker states were also inspected. The source itself holds the same graph, marker and tooltip at the beginning and end; no extra return bridge is needed. The replay records every original timestamp. Marker and guide positions are retained separately because the footage shows small relative offsets during motion.

The path is independently drawn from observed anchors and fitted to the visible stroke centerline. Circle centers, the guide, pill widths, text ink boxes, gradient colors and pointer positions were measured independently. Twenty ambiguous OCR hour glyphs were manually checked. The complete comparison caught two white marker fragments that the measurement script had mistaken for a cursor at frames 32 and 214. Both were removed; all other 550 rendered RGBA frames stayed exactly unchanged.

Seven behavior and timeline tests pass. All 552 fresh final rasters exactly match the stored SVG and RGBA hashes. The full MP4 has 552 frames at 60 fps, 1340 × 836, lasting 9.2 seconds; every source timestamp matches with zero offset. The GIF has 276 frames at 1005 × 627 and visibly distinct movement. Both media fully decode. Raw rendered endpoints and decoded GIF endpoints are exactly equal.

Remaining small differences are the licensed substitute font contours, pointer outline details, SVG antialiasing and the compressed reference’s line/gradient texture. The independently fitted curve is close but does not recover the original path data. No numerical fidelity percentage is claimed.

`npm test` exercises timestamp selection, the natural loop, path-distance sampling, pointer and keyboard clamping, interrupted replay, touch capture and reduced motion. DOM checks use a stub. After installing the declared Sharp dependency, `node render.cjs <seconds> <output.png>` creates an offline still, `node render.cjs all <folder>` renders all native states, and `node verify.cjs` checks every final raster. A comma-separated index list can be passed to verify a subset. `node export.cjs <new-folder>` recreates frames, MP4 and GIF using FFmpeg; it refuses to overwrite an existing output directory.

Browser execution has not been validated. Offline SVG rasterization and mocked DOM checks are recorded separately from browser testing.
