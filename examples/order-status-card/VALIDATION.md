# Run and validation

Open `index.html` directly or serve this directory with `python3 -m http.server 8000`. There is no build step, application dependency, network request, account or API key.

The complete native-timed demo loops automatically. Click one of the four progress segments to replay that stage. Left/right arrow keys select stages; `R` restarts the complete loop, Space pauses/resumes, and Escape freezes the current state. Reduced-motion preference starts with a still state and changes explicitly selected stages immediately.

## Tests

Run `node test.cjs`. It checks all 330 native/tail states, finite SVG output, the 305 original presentation timestamps, overlapping two-badge handoffs, final tail closure, repeated segment clicks, stage stopping, keyboard controls and reduced-motion handling with a simulated DOM.

These are offline code and SVG checks. Actual browser interaction has not been tested. Local Chromium launch and local-site browser access were denied earlier in this project; no bypass was attempted. The exported preview is not a browser recording. A public remote browser cannot validate these unpublished local files.

## Preview reproduction

`node render.cjs` renders the same `scene.js` and timing used by the web demo. The build environment needs Node, Sharp and FFmpeg; the checked-in demo does not. Rasterization uses isolated 32-frame chunks and two worker threads, followed by standalone MP4 encoding and a two-pass GIF palette. Set `AUDIT_DIR` to keep native PNGs outside the package; `--encode-existing` reuses them.

The MP4 contains all 305 observed native frames plus a 25-frame authored re-arm tail: 330 frames, 60 fps, 5.5 seconds. The GIF is a 30 fps sampling of the same complete loop. The authored tail gradually restores the source’s initial partially filled fourth segment and delivery badge. No comparison panels, annotations, scores or reference images appear in the demo or previews.

## Visual review

All 305 native source/replica pairs were inspected consecutively in 26 paired sheets, plus all 25 authored tail frames. A final handoff-center correction changed only 20 native frames, all inspected again in a focused paired sheet; exact PNG equality retains the reviewed coverage for the other 310 native/tail frames. Twelve enlarged checks inspect native-pixel typography and element crops. Twelve fresh final-scene rasters match the reviewed pixels, and the first and last loop pixels match exactly. Exact source PTS, final code/media hashes and complete source/replica frame bindings are retained in the external audit. The implementation uses a licensed substitute font, independent vector symbols and procedural grain. Fine glyph contours, icon curvature, compression softness and texture microstructure are not claimed pixel-identical. The scalar measurements describe visible appearance, not recovered original CSS.

## Badge-contour revision

Independent review identified harder small-circle contours during handoffs and the final shrink. A separate contour/halo treatment now follows those frames while icon strokes remain sharp. All 36 changed native frames and eight enclosing boundaries were re-inspected in six paired sheets. All 330 final states were freshly rasterized: the other 269 native frames and all 25 tail frames match the reviewed prior pixels exactly. The final media was regenerated from this bound sequence. Geometry, typography and settled states are unchanged.
