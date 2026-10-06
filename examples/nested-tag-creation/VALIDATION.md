# Run and validation

Run `npm start` and open port 8029 in a permitted browser. The page has no external service dependency or API key. The bundled fonts retain their original OFL license. `npm test` runs the Node checks.

The replay follows all 1,022 original presentation timestamps, including the irregular gaps while typing. Click Add label to interrupt it and use the picker: filter labels, toggle selections, create a label and choose its color. Arrow keys and Enter select rows. Escape returns from the nested palette or closes the picker. Clicking outside dismisses it. Replay resets the observed sequence. Reduced motion starts paused. Live editing implements the same state flow; its direct input responses are not a second reproduction of the recorded pointer performance.

## Visual evidence

This implementation was rebuilt after the earlier workspace reverted. It is a new revision, not a restoration of the missing old package. The recovered original file matches the recorded SHA-256 in PROVENANCE.md.

All 1,022 source/replica pairs were inspected across 64 consecutive sheets, with enlarged checks of nested reveal, color changes, checkbox transitions, chip entry/removal and cursor handoffs. All 60 authored return poses were inspected. The first 420 source rows are blank; their maximum difference over the complete source sequence is one channel level. Review sheets cover the entire remaining canvas. Original footage and comparison crops remain local and are excluded from this package.

The checkbox correction separately fits fill, border, check scale, check opacity and softness. Independent review then identified the early panel opening envelope, the color-dot pulse, pressed-row compression and a 12-pixel post-creation panel-height difference. This revision measures those motions, preserves the row baselines, clips the bottom content to the panel and fits the short 353–356 settling response. The exact comparison against the earlier freeze identifies 711 changed native frames and 371 exact RGBA matches, including all 60 previously reviewed authored tail states. Every changed frame and its enclosing boundaries was inspected again. The evidence files bind the final implementation, native timestamps, all rendered poses and exported media. Numerical pixel differences are diagnostics, not a claimed similarity percentage.

The source lasts 22.035 seconds. The 23.035-second MP4 preserves all 1,022 source timestamps and adds 60 explicitly authored return frames. The final selection fades out, then the initial pair fades in without overlapping label ink. The ending raster equals the initial raster. The GIF is sampled at 30 fps and 800 pixels wide directly from the independently rendered native PNG sequence. Its decoded first and last RGB frames are identical, avoiding the earlier MP4 compression seam.

## Checks and limits

216 fresh offline raster states, including all 60 tail poses, exactly match the bound final RGBA hashes. `node scripts/verify-raster.cjs` repeats those checks.

Twelve Node tests cover all native scene states, variable timestamp lookup, nested creation, duplicate prevention, filtered keyboard selection, interrupted dismissal, DOM event wiring, reduced motion, checkbox staging and the clean tail. Offline raster bindings and complete MP4/GIF decoding are separate checks.

Browser execution is untested. Local Chromium launch and local-site browser access were previously denied; no bypass or renewed launch was attempted. Offline SVG rasterization and mock DOM tests do not establish browser runtime correctness.

Fine font contours, pointer silhouettes, source compression noise and subpixel antialiasing remain different. The independent SVG uses measured scalar geometry and timing, not embedded source pixels. Its cached-layer offline rasterizer differs from a single whole-SVG raster by at most two channel levels in the small cursor edge regions checked during development.

## Rebuild previews

Install the declared Sharp development dependency for offline rendering. `node render.cjs 4.8 still.png` renders one replay time. `node scripts/render-native.cjs frames` writes every native and authored-tail pose. `python scripts/export.py frames preview` requires FFmpeg and exports both media files, checks every MP4 timestamp and decodes both complete files. The generated concat list and palette are temporary export inputs. The browser runs the same scene source; these exports are not browser captures.
