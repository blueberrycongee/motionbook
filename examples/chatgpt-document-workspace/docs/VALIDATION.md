# Validation

- 31 Node tests cover reading state, anchored zoom, per-tab drafts, repeated sends, originating-tab replies, keyboard focus, interrupted motion, thumbnail reservation, aligned controls, split/composer timing, and SVG clipping. One fake-DOM event harness contains 14 event assertions.
- Previews use the same SVG scene and reducer as the app. The source timeline and MP4 are 16 seconds; the GIF plays at 0.5× for 32 seconds. Responsive stills are included.
- This is offline renderer and fake-DOM verification, not a browser-runtime/input-device pass. Native textarea layout and real browser hit-testing still need browser verification.
- The sample renders fictional SVG documents. It is not a general-purpose PDF parser/editor. Replies are deterministic local examples, voice is not connected, and Request changes does not alter a PDF.

Run `npm test` and `npm run render` as described in [Running](RUNNING.md).
