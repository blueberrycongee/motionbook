# Validation

- 47 Node tests pass. The fake-DOM event harness contains 36 assertions, including header focus, blank-header press/RAF/click, owned transcript input, grip focus retention, expanded minimize/outside/restore, Escape, unrelated menu clicks, repeated input focus, overflow after resize, typing during collapse, native/SVG shared geometry and reduced motion.
- The event harness derives composer ownership from the actual rendered SVG group ancestry. It does not implement native hit-testing or browser focus behavior. Pure-state tests additionally cover reversible 46 px header reveal, separate transcript expansion, hidden-header tab order, draft/message continuity, interrupted sends and stale replies. Earlier document alignment, split-pane, thumbnail, zoom and clipping regressions remain covered.
- Previews use the same SVG scene, reducer and composer interpolation as the app. The source timeline and MP4 are 24 seconds; the GIF plays at 0.5× for 48 seconds. Focused and multiline stills are offline illustrations. The rendered caret is illustrative; the app uses the browser's native textarea caret.
- This is offline renderer and fake-DOM verification, not a browser-runtime/input-device pass. Native textarea wrapping, focus timing, SVG hit-testing, IME, and real frame timing still need browser verification. Original-client runtime/pixel equivalence is not asserted.
- The sample renders fictional SVG documents and local replies. Attachment selection opens fictional files, voice is not connected, and Request changes does not edit a PDF. The supported configuration and intentionally simplified controls are documented in [Provenance](PROVENANCE.md).

Run `npm test` and `npm run render` as described in [Running](RUNNING.md).
