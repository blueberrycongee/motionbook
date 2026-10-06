# Recovery work in progress

This package was rebuilt after the previous working environment reverted. It is a new implementation revision, not a restoration of the old verified files.

Run with `npm start`, then open port 8029 in a permitted browser. No network service or API key is needed. `npm test` runs the timeline and interaction-model tests. Install the declared Sharp development dependency only to use `node render.cjs <seconds> <output.png>` for an offline SVG raster.

Click Add label, search existing labels, toggle selections, create a custom label and choose its color. Escape returns from the nested palette or closes the picker. Arrow keys change the highlighted row and Enter selects it. Replay returns to the observed animation. Reduced motion starts paused.

The original 1,022 native timestamps have been recovered and their source file hash matches the pre-interruption record. Seven newly recreated Node tests pass, including all 1,022 timeline states, variable PTS lookup, custom-label uniqueness, filtered keyboard selection and authored-tail state adoption. The initial offline SVG raster was inspected against the recovered source. Current full visual verification must be regenerated. The previous full-frame review and media are historical evidence only. The recovery currently needs optical remeasurement, all-frame source/replica comparison, preview MP4/GIF export, fresh bindings and independent review.

Browser execution is untested. Prior local Chromium launch and local-site browser access were denied; no bypass has been attempted. Offline SVG output and pure interaction-model tests do not establish browser runtime correctness.

Recovery milestone 02 adds scalar measurements from all 1,022 original frames, optical type bounds, measured cursor locations and selection ink timing. All 1,082 offline native/tail poses were regenerated. Their complete paired visual review is still pending. The offline renderer caches unchanged SVG composition layers and composites an independently drawn cursor; three enlarged compatibility checks against a single SVG raster differed by at most two channel levels in small cursor edge regions. Seven current tests pass.
