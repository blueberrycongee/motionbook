# Run and validation

Open index.html directly or serve this directory with any static web server. There are no remote runtime dependencies. The initial view automatically replays the observed sequence. Click a category or leaf to take control. Tab and the up/down arrows move focus; left/right choose adjacent leaves. R replays; Escape freezes the current view. Reduced-motion preference starts with a static expanded group and makes manual changes immediate.

Run `node test.cjs` for deterministic scene and simulated DOM checks. To rebuild offline previews, install the declared Sharp dependency and have ffmpeg on PATH, then run `node render.cjs`. Rendering uses isolated 32-frame raster chunks, two worker threads, locally bundled fonts, a separate MP4 encoder and a two-pass GIF palette. An earlier combined long-running render/encode process exited137 after629 frames; retained frames were verified, the tail was regenerated, and a standalone encode completed successfully. The exact kill cause was not established. Preview generation is an offline rendering of the exact same SVG scene function used by the page.

## Runtime boundary

Local Chromium launch and local-site browser access were denied in this workspace. No bypass or repeated browser attempt was made. The browser app has not been executed in an actual browser. The offline render and simulated DOM tests do not establish browser rendering, input dispatch, font loading or accessibility behavior in a real browser.

## Frame review

All 615 final source/replica pairs were visually inspected across39 consecutive UI comparison sheets, plus enlarged static/selection/clip transitions. All39 authored tail frames were also inspected. The final MP4 is654 frames at60 fps (10.9 seconds), 3620×2160. The GIF is218 frames at20 fps (10.9 seconds), 1448×864. Original frame order and original PTS are used for state evaluation. Review images and source footage remain outside the distributable package. Numeric diagnostics and PTS are retained under audit; image error metrics are descriptive, not an imitation score or an automatic visual pass.

The source uses an unknown font. Bundled Inter is optically fitted. Small glyph shapes, video antialiasing, and independently drawn icon/pointer-shadow details can differ. The extra loop tail is authored. No percentage-equivalence claim is made.
