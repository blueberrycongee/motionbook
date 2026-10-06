# Run and validation

Open `index.html` in a browser. The page has no account, API key, build step or network dependency.

- Details opens the sheet. Activating the dashboard above it dismisses it.
- Repeated activation queues the next complete opening or closing movement.
- Copy buttons copy fictional sample data and briefly confirm the copy.
- Escape returns to a stable closed state. Reduced motion uses immediate state changes.

Run `node test.cjs` for finite scene geometry, native track bounds, exact loop endpoints, repeated/queued toggles, Escape, reduced motion and fictional clipboard behavior. `test-results.json` records the result.

With Node, sharp and ffmpeg installed, run `node render.cjs` to regenerate previews. Add `--stills` for selected PNGs. The font files and OFL notice are included. `FILES.sha256` covers each payload file except the manifest itself.

## Runtime and preview distinction

GIF and MP4 are offline renders of the same SVG scene function used by the page. They are not browser recordings. Actual browser rendering, pointer hit areas, clipboard permissions and performance remain unverified because local browser/socket access was restricted. Node event mocks are not a browser-runtime pass. No blocked route was bypassed.

Native source comparisons remain outside the deliverable. Automated tests do not establish visual fidelity. Coverage and remaining visual differences are recorded separately.

## Bound final media

The MP4 contains 242 frames at 60fps and lasts 4.033333 seconds. The GIF contains 121 frames at 30fps, lasts 4.03 seconds at centisecond precision and has 107 distinct decoded frames. Full video decoding, six fresh PNG byte bindings and near-identical encoded loop endpoints are recorded in `preview/media-validation.json` and `preview/still-bindings.json`. The raw first and final SVG states are identical.

## Revision 2

The original reviewed package is preserved separately. This revision changes only the dashboard blur mixture, the short balance sharpness envelope and per-column vertical digit offsets. Phone, card, sheet, dimming and controller geometry/timing are unchanged. Entry and dismissal retain a sharp component while a fixed-radius blurred layer fades in or out. Digit offsets were measured against the original native frames; no source raster or glyph is embedded.

## Revision 3

Only native frames 90–95 change from revision 2. All other 115 native rasters match exactly. Nine checks pass, including the outgoing local-frost envelope. The six fresh preview PNGs, font files, raw loop seam and newly encoded GIF/MP4 are bound separately.
