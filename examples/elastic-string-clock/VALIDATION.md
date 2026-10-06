# Run and validation

Open `index.html` for the 20-second replay. Drag the center, a tip or a strand to take manual control. Release the center to let it spring home. Detached tips can fall or snap to another anchor. Press R or the upper-right control to restart; the color controls change the background.

Run `npm test` for nine model and timing checks. They cover center dragging and return, tip reassignment, sustained free-end simulation, reset, every original timestamp, folded release geometry, replay-to-physics conversion, the loop seam, and preservation of two curved strands when taking control during a merged fold.

For offline reproduction, install the development dependency with `npm install`. Run `node scripts/render.cjs 115 frame.png` for one pose or `node scripts/render.cjs --all frames` for the complete sequence. Run `npm run verify` for 37 selected RGB checks, or `npm run verify -- --all` for all 1,200. Exact RGB hashes depend on the Sharp/librsvg and font-rendering environment; they are not a claim of browser equivalence.

The original 1,021-frame sequence was inspected at its native presentation timestamps, including full-canvas composition and enlarged pointer/strand details. Every final changed frame and its enclosing states was compared again. All 179 authored closing frames were inspected. Sixteen poses were also rendered at the original 3452 × 2160 resolution to check native-density details.

The MP4 has 1,200 frames at 864 × 540 and lasts 20 seconds. Its first 1,021 presentation timestamps match the original with zero measured error. The GIF has 600 frames at 30 fps, 562 distinct decoded images and equal first/last decoded frames. Both media files decode completely.

These previews are offline SVG/Sharp renders, not browser recordings. Browser execution and performance are unverified. Fine pointer and dial contours, subpixel curve joins, tightly folded silhouettes, antialiasing and font rasterization differ from the footage. The authored closing return and unrecorded live interactions are additional behavior. No pixel identity or fidelity percentage is claimed.
