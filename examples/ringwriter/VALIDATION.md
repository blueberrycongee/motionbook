# Run and validation

Serve this directory with `python3 -m http.server 8039`, then open `http://localhost:8039`. No build or package installation is needed for the page. Move the pointer over the field, hold and release; the focused canvas also accepts Space/Enter, Escape and the Replay button.

Run `npm install` and `npm test` for the optional offline checks. Eleven tests passed, including shared drawing through a simulated DOM, pointer cancellation, lost capture, window blur, keyboard hold/release and replay. Render a native pose with `node scripts/render-frame.mjs 120 frame.png`. The offline renderer uses the pinned `@napi-rs/canvas` dependency.

All 486 original native poses were visually reviewed against the reconstruction, with enlarged checks for moving letters, the pointer and caption. All 558 final offline RGBA renders were freshly verified against the reviewed frames. The 72 authored closure frames, encoded MP4 closure and all 186 GIF frames were also inspected. The 1728×1728 MP4 has 558 frames at 60fps; the 480×480 GIF has 186 frames at 20fps. Both run for 9.3 seconds and pass full decoding. The GIF begins and ends on exactly the same decoded RGB image.

An actual browser runtime has not been tested. Offline Canvas and simulated DOM results do not establish browser compatibility. Fine glyph and pointer contours, antialiasing and captured-video texture differ from the reference; no pixel identity or full-image similarity percentage is claimed. See [PROVENANCE.md](PROVENANCE.md) for source attribution and the authored live controls and loop closure.
