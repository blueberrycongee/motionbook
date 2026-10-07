# Run and controls

Open `index.html` directly or run `python3 -m http.server 8000`.

Click sun/speaker to change mode. Drag the track or drag the dial vertically; use the wheel over either control. Focus a control for arrow keys, Shift for ten-unit changes, and Home/End for endpoints. R replays; Escape or pointer cancellation ends a drag. Reduced motion uses settled states and immediate changes.

This visual demo does not change system brightness or volume.

- `node test.cjs`: scene states, loop closure, mode/level bounds, keyboard, wheel, drag/cancel, replay and reduced motion.
- `npm install && node render.cjs`: regenerate previews; requires FFmpeg and Sharp.

Previews render the shared SVG scene offline. Browser behavior remains untested. Original typography/materials are unknown; glyph, grain, bevel, glow and compression details differ. See [source and sequence](PROVENANCE.md).
