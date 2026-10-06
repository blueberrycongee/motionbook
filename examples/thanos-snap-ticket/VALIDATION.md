# Run and validation

Serve this folder with a static file server so the bundled fonts can load, then open `index.html`. For example, run `python3 -m http.server 8000` on your machine and open its local address. The page has no account, API, build or external network dependency.

- Show ticket / Hide ticket changes the displayed card.
- Repeated clicks keep the latest requested state; an in-progress dissolve finishes before the queued reversal.
- Clicking during the automatic demonstration preserves the current transition and camera position.
- Escape returns to the summary.
- Reduced motion starts still and completes direct changes immediately.

The rest of the screen is presentation UI. It does not book, pay for, validate or retrieve a rail ticket.

## Checks

Run `node test.cjs`. Checks cover both source cycles, 680 finite camera/state/hit-area samples, 46 shared-scene SVG samples, exact loop equality, repeated clicks, interrupted automatic motion, Escape, reduced motion and presence of the font-load gate. `test-results.json` records the outcome.

To regenerate assets and previews, install Node, sharp and ffmpeg, then run:

```
node artwork.cjs
node build-particles.cjs
node render.cjs
```

`fonts.conf` selects the bundled fonts for sharp/librsvg. `node render.cjs --stills` renders only selected stills. `ffmpeg -v error -i preview/loop.mp4 -f null -` checks video decoding. `FILES.sha256` covers all payload files except the manifest itself.

## Runtime and preview distinction

GIF and MP4 are offline SVG renders of the same scene function used by the page. They are not browser recordings. Actual browser rendering, local-font loading, pointer hit areas and performance remain unverified because local browser/socket access was restricted. Node event mocks are not a browser runtime pass. No blocked route was bypassed.

## Final bound media

The MP4 contains 680 frames at 60fps and lasts 11.333333 seconds. The 30fps GIF contains 340 frames and loops continuously. Full video decoding, 269 distinct decoded GIF frames, near-identical encoded endpoints and five fresh scene-to-PNG byte matches are recorded in `media-validation.json` and `preview/still-bindings.json`. The final scene hash matches the independently reviewed v16 correction.
