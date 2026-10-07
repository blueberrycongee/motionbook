# Run and controls

Run `python3 -m http.server 8039`, then open `http://localhost:8039`. The page needs no build or package installation.

Move the pointer over the field, hold and release. The focused canvas also accepts Space/Enter, Escape and Replay.

- `npm install && npm test`: shared drawing, pointer cancellation, lost capture, blur, keyboard hold/release and replay checks.
- `node scripts/render-frame.mjs 120 frame.png`: render a native pose with the pinned `@napi-rs/canvas` dependency.

Previews are offline Canvas renders. Browser compatibility remains untested. Fine glyph and pointer contours, antialiasing and video texture differ from the reference. See [source and loop timing](PROVENANCE.md).
