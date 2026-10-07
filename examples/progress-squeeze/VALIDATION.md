# Run and controls

Run `npm start`, then open `http://127.0.0.1:4173`. Click the icon or press Space to pause/resume; R replays.

- `npm test`: measured plateaus, bounded values, toggle/reset, loop closure, live input, separately timed counters and reduced motion.
- `npm install && npm run render`: regenerate previews; requires FFmpeg.

Previews are offline SVG renders from the same scene generator used by the browser. Browser hit testing, focus and event behavior remain untested. Transient curve shape, glyph contours and antialiasing differ; the reference pointer is omitted. See [source and motion parameters](PROVENANCE.md).
