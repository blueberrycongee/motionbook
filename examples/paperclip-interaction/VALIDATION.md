# Run and validation

Open `index.html` directly. It has no install, account, API, build, external-image request, or service dependency.

- Share: open/replay the entry sequence.
- Close or Escape: dismiss.
- Hover/focus the paperclip: collapse the sheet fan; leave/blur to restore. Click toggles it for touch use.
- Reduced-motion preference removes ongoing automatic motion and shortens direct interaction.

The destination icons and copy-link row are visual reference UI; they do not send data, connect accounts, or modify the clipboard.

## Checks

`node test.cjs` passes 462 sampled states, timeline assertions, loop identity, Share/Close/Escape/reopen, hover entry/exit, interrupted opening, and reduced-motion event mocks. The exact report is in `test-results.json`.

`ffmpeg -v error -i preview/loop.mp4 -f null -` checks video decoding. GIF frame count/loop metadata are verified separately. A complete `FILES.sha256` covers the payload.

## Preview and runtime distinction

GIF and MP4 are offline SVG renders of the same scene function used in the live page. They are not browser recordings. Actual browser rendering, touch hit areas, focus visibility, and performance have not been verified here because local browser/socket access was restricted. No blocked route was bypassed. Node event mocks are not a browser runtime pass.

To reproduce media: install Node, the `sharp` development dependency and ffmpeg, then run `node render.cjs`. See `SOURCE.md` and `VISUAL_REVIEW.md` for provenance, timing and scope.
