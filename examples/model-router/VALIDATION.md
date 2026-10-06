# Run and validation

Run `npm install`, then `npm start`, and open port 8041 in a permitted browser. Select a policy, hover a route or row, toggle fallback, or choose a model from the left selector. Conflicting destinations swap automatically. Controls support interrupted changes; Escape closes the menu. Reduced motion starts paused and applies manual changes immediately. Deploy updates this local demonstration’s baseline.

The replay includes all 1,142 original frames at their exact variable timestamps, followed by a separately authored two-second return. The MP4 contains 1,262 frames at 3024 × 1896 over 22.031667 seconds. The GIF is a looping 1134 × 711 preview. The reference contains three policy states, coordinated graph/table hover, fallback changes and two source-selector openings with paired model swaps. It contains no deployment click or success state.

Every original frame and replica frame was visually compared in full-canvas and enlarged graph sheets. The control review additionally covered 263 upper-panel and 331 lower-panel states, with native-size checks of text, pointers, menus, selectors, rolling status labels and particles. Every authored return pose was inspected. The late hover correction was checked through all changed states and enclosing boundaries.

Run `npm test` for fourteen model, transition and mocked-DOM tests. `node verify-raster.cjs` checks 43 representative fresh SVG/RGBA states against the included hashes; add `--all` for all 1,262 states. Native timestamps and the rendered state hashes are in `validation/frame-bindings.json`. Complete media decoding and timestamp checks are recorded in `validation/media-check.json`.

`node render.cjs <seconds> <output.png> --native` creates a 3024 × 1896 offline still. Add `--full` for a direct full-SVG raster. Five optimized/direct raster comparisons are recorded in `validation/raster-equivalence.json`: three are exact; the two faded hover samples differ at three pixels by one RGB level. This tiny raster-compositing difference is retained explicitly.

`node export.cjs <new-output-folder> --render-only` creates all native and authored PNG states and hashes. After inspection, `node export.cjs <same-folder> --encode-only` validates those bindings and creates the MP4 and GIF. FFmpeg is required. The export uses bounded rendering and encoding threads.

The reference typeface was not verified. Licensed substitute fonts were fitted from native measurements; fine glyph and pointer contours, particle overlap, line color, shadow softness and subpixel antialiasing can differ. Numeric tracks describe measured visible states and independently authored motion; no reference pixels or source code are included.

Actual browser execution remains unverified. The checks above use offline SVG rendering and mocked DOM interactions.
