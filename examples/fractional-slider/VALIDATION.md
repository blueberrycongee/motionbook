# Run and validation

Run `python3 -m http.server 8038` and open `http://localhost:8038`. The page has no runtime dependencies or external asset requests.

Replay starts automatically. Use the timeline to pause and inspect a pose. Try it enables dragging, scrolling, arrow keys and Shift for finer changes. Home, double-click or Reset returns to zero. Escape cancels a held gesture. These live controls are an independently authored demonstration; the exact original reset gesture is not established by the clip.

Run `npm install` then `npm test`. `npm run render -- OUTPUT_DIR` renders all 360 native poses with Sharp using the same SVG scene as the page. `node scripts/render-frame.cjs 160 frame.png` renders one pose. The preview MP4 samples all 360 poses at 60 fps; the GIF uses every second native pose at 30 fps. FFmpeg is required to encode media. The supplied GIF's final delay is normalized to 30 ms so its complete loop is exactly six seconds.

## Checks performed

Ten Node tests cover signed drag, bounds, fine wheel changes, reset during a gesture, cancellation, page event wiring, the recorded pose sequence and exact first/last SVG equality, plus finite interpolation across every release-blur boundary. A simulated DOM checks pointer capture/cancellation, wheel handling, replay, scrubbing and reset. This is not an actual browser run.

Every one of the 360 original and independently rendered frames was visually reviewed. All 102 visible press-ring poses were additionally inspected in enlarged source/replica pairs, and all 360 final label regions were checked after an optical weight correction. Source frames, comparisons and detailed evidence remain outside this package.

The recorded ruler translation, independently delayed blue/white selection, two press rings, cursor changes and final cursor disappearance follow native timestamps. The final three poses return exactly to the initial zero pose. No extra closure frames are added.

The final MP4 contains all 360 original timestamps with zero PTS error. Both media files decode fully. The GIF contains 180 frames and 176 distinct images over 6,000 ms; its first and last decoded RGB images are identical. All 180 GIF frames were inspected. All 360 freshly rendered SVG/RGBA bindings matched the final scene.

A focused final revision refines the thin release-ring cores in 12 native frames. Centers, radii, held rings and the rest of every image remain unchanged; all affected frames and six enclosing boundaries were re-inspected.

## Limits

Inter is an openly licensed substitute for the unavailable original typeface. Its licensed outlines are independently placed and optically adjusted; glyph contours and antialiasing remain slightly different. Press rings are analytic vector shapes with blur, so the original recording's compression grain and fine ring texture are not copied. The pointer is independently drawn. No pixel identity or whole-image fidelity percentage is claimed.

Real browser rendering, font loading, touch interaction and accessibility behavior were not executed in this environment. The offline renderer uses Sharp/librsvg, while the page uses the browser's SVG renderer; small raster differences are possible.

[Source and asset provenance](PROVENANCE.md)
