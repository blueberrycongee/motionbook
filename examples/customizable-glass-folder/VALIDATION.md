# Run and validation

Open index.html in a browser. No account, API key or network request is required.

- New folder creates the folder. The four swatches change its color.
- Activate the label or press F2 to rename it. Enter saves; Escape cancels editing.
- Drag on the glass to draw. Focus the drawing area and press Enter or Space for the demonstrated heart.
- Delete clears the drawing. Escape returns to the menu.
- Reduced motion uses immediate state changes.

Run `node test.cjs` for ten checks, including the 720-frame finite-scene check, exact loop endpoints, measured phase assertions, escaped text input and DOM/event-mock interactions. These tests are not browser execution.

With Node, sharp and ffmpeg available, run `node render.cjs` to regenerate the MP4, GIF and PNGs. Add `--stills` to generate only PNGs.

## Runtime and preview distinction

The previews are offline SVG renders of the same scene function used by the page. They are not browser recordings. Actual browser font loading, pointer capture, input focus, performance and SVG rendering remain unverified because local browser/socket access was restricted. No denied route was bypassed. Numeric stroke lengths are used so the offline renderer and browser do not depend on different normalized-path-length behavior.

Source comparisons and full-frame inspection evidence are kept outside this distributable package. Automated checks do not establish fidelity. The visual review record lists coverage and remaining rendering differences.

## Bound media

The MP4 contains 720 frames at 60fps and lasts 12 seconds. The GIF contains 360 frames at 30fps, lasts 12 seconds and has 315 distinct decoded frames. Full decoding and eight fresh PNG byte bindings passed. The first, final and 12-second raw scene rasters are identical. See preview/media-validation.json and preview/still-bindings.json.
