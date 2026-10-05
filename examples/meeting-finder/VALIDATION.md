# Run and validation

Open `index.html` directly. There is no install, build, external request, account or API dependency for the demo.

- Drag the hour strip to change the UTC hour.
- Focus the strip and use Left/Right, Home or End.
- Find best time scans toward 16:00 UTC.
- Escape resumes the recorded demonstration sequence.
- Reduced motion begins still and makes direct choices immediate.

The timezone offsets reproduce the reference's fixed example. This is a motion demonstration, not a timezone database or scheduling service.

## Checks

Run `node test.cjs`. It verifies all 687 measured cursor positions and independently classified selected-hour values, all 24 choices, day offsets, finite 60fps states, the loop seam, search, interrupted search, pointer cancellation, keyboard controls and reduced motion using DOM/event mocks. Results are in `test-results.json`.

Run `ffmpeg -v error -i preview/loop.mp4 -f null -` to check video decoding. `FILES.sha256` covers every payload file except the manifest itself.

To reproduce previews, install Node, `sharp` and ffmpeg, then run `node render.cjs`. `node render.cjs --stills` renders the selected stills only.

## Preview and runtime distinction

GIF and MP4 are offline SVG renders of the identical scene function used by the live page, not browser recordings. Actual browser rendering, pointer hit areas, focus appearance and performance remain unverified because local browser/socket access was restricted. Node event mocks are not a browser runtime pass. No blocked route was bypassed.

See VISUAL_REVIEW.md for the separate visual comparison record and its limitations.
