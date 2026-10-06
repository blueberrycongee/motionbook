# Validation and reproduction

## Run the interactive demo

From this directory, run `npm start` and open `http://localhost:8035`.

- **Try it:** pointer movement morphs a disk into a calendar-wide guide. Drag up or down to create a quarter-hour-quantized interval. Reverse across the anchor without starting another drag.
- **Replay reference motion:** plays the complete 622-frame recorded motion trace as independently drawn SVG.
- **Timeline:** scrubs exact native presentation times.
- **Reset:** clears the live state.
- Keyboard: focus the calendar, use arrows for quarter-hour movement, Space to start/release, Escape to cancel.
- Pointer cancellation and lost capture clear an unfinished drag.

The live model and native replay share the same clean vector scene generator. The replay is a measured deterministic motion trace; it is not a claim that the live spring model reproduces the author's undisclosed implementation exactly.

## Automated checks

`npm test` runs the model, mock-DOM event wiring, clipping/vector, bounds, repeated-drag, reverse-direction, zero-crossing, cancellation, and all-native-timestamp checks. Results are in `evidence/tests.txt`.

`node scripts/render.cjs all OUTPUT_DIRECTORY` renders each exact native time through sharp/librsvg. This is an offline SVG rasterizer, not a browser capture. Install the declared dev dependency with `npm install` when sharp is not already available. An existing module can be supplied using `MOTION_SHARP_MODULE` for the renderer.

Python analysis scripts additionally use Pillow, NumPy, and SciPy. They read local reference frames for numeric measurements only. The original pixels are never an output asset. `scripts/compare.py` writes one numeric comparison row for every original frame, and places reference-containing comparison contact sheets outside the deliverable.

## Verified and unverified gates

- Verified: every one of 622 original native timestamps is represented; no sampled-only comparison.
- Verified: all 622 independently rendered frames have finite geometry and contain no embedded image, video, or raster data URI.
- Verified: the source's four drag cycles, reverse growth, quarter-hour labels, zero-duration crossing, fades, pointer exit, and complete original canvas are represented.
- Verified: model tests and offline rendering. These do not prove browser DOM or pointer-capture behavior.
- Unverified: real browser execution. Chromium startup was attempted using an explicit writable user-data directory and failed with `socket() failed: Operation not permitted`. No claim of a browser pass is made.
- Unverified: independent final fidelity acceptance. This case stays on the private WIP branch until that separate review passes.

## Media contract

`preview/full.mp4` preserves the 10.366667-second source span, full 1318 × 812 canvas, and all 622 frames at 60 fps. It contains only regenerated vectors and licensed fonts.

`preview/loop.gif` is a clean 988 × 609, 30 fps viewing preview. The source does not close seamlessly, so the GIF explicitly adds a 50-frame, 60 fps pointer-return bridge after the complete source span. The loop lasts 11.2 seconds. This bridge is not presented as original motion, and the full MP4 remains unmodified in duration.

## Fidelity caveats

Inter is an explicitly declared font substitute. Font metrics, subpixel antialiasing, ring compositing, very faint release tails, and a few transitional text clips differ from the compressed reference. Numeric error statistics are diagnostics, not a similarity percentage or acceptance verdict. Whole-canvas metrics are diluted by the large uniform background. No “100%” fidelity claim is made.

## Rebuild the clean media

After `npm install`, run:

```sh
node scripts/render.cjs all preview/frames
node scripts/loop.cjs preview/loop-frames preview/frames
ffmpeg -framerate 60 -i preview/frames/%05d.png -c:v libx264 -crf 18 -pix_fmt yuv420p preview/full.mp4
ffmpeg -framerate 60 -i preview/loop-frames/%05d.png -vf 'fps=30,scale=988:-1:flags=lanczos,split[s0][s1];[s0]palettegen=max_colors=128:stats_mode=diff[p];[s1][p]paletteuse=dither=sierra2_4a' -loop 0 preview/loop.gif
```

The optional `npm run test:browser` uses Playwright against `http://127.0.0.1:8035`; start the demo server first. It was not successfully executed here. Set `CHROMIUM_PATH` only to a browser executable already available in the permitted environment.
