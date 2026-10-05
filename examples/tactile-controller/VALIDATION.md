# Run and validation

Open index.html directly, or serve this directory with `python3 -m http.server 8000`. Click the sun or speaker to change mode. Drag the level track, drag the rotary dial vertically, or use arrow keys while either control is focused. Shift changes ten units; Home/End selects the endpoints. Use the wheel over either control. R replays the recorded timeline. Escape and pointer cancellation end a drag.

Reduced motion presents a settled state and makes immediate changes. This is a self-contained visual demonstration; it does not change system brightness or volume.

Run `node test.cjs` for logic checks. Install the development dependency in package.json and run `node render.cjs` to rebuild the shared-SVG offline preview, one renderer at a time.

## Verification

- Logic tests passed: all 321 sampled states; exact loop equality; mode and level assertions; simulated-DOM mode switching, bounded levels, arrow/Home/End input, wheel handling, pointer drag, cancellation, replay and reduced motion.
- Offline rendering uses the same SVG function as the demo. The MP4 contains 321 frames at 960 × 720 and 30 fps, preserving the complete 303-frame original interval and an 18-frame authored reset. The GIF contains 161 frames at nominal 15 fps and lasts 10.74 seconds after centisecond timing quantization. This is not a browser recording.
- Final MP4 decoding is checked with ffmpeg's error-stop option. Static raster checks compare the output to the actual native source frames.
- Actual browser runtime is not tested. Local browser launch and local-site access were denied in this session; no bypass was attempted. Offline rendering and simulated DOM checks are not browser proof.

## Visual review

All 303 original native frames were inspected before implementation. Source/replica comparisons cover every frame in 13 consecutive paired sheets, with larger checks for startup, warm hold, mode handoff, both digit-roll directions, high/low volume and shutdown. The additional 18-frame reset is separately inspected. Comparison images remain outside the package because the reference reuse license is unspecified.

Corrections include the housing and recessed track bounds, separate dial rim/face/shadow layers, fill gradient positions and glow, the small color-changing mode-switch seed, measured selector brightness, caption entry/exit positions, and individually staggered percentage characters. Native frame indices are snapped only within floating-point rounding tolerance to avoid accidental one-frame digit substitutions.

The numeric audit records full-frame and moving-UI mean absolute RGB differences for every source frame. These are diagnostics on a 0–255 channel scale, not similarity percentages or an automatic fidelity pass.

## Remaining limits

The source font and original material/shader are unknown. Bundled Inter is optically scaled for the caption. Small glyph, grain, bevel, glow and compression differences remain. The repeating dial ticks make absolute fast rotation ambiguous; the independent curve matches observed direction and settling without claiming a uniquely recovered physical angle. No pixel-identical claim is made.

The original ends with Volume selected and its caption visible, unlike the empty Brightness startup. A clearly documented 10.1–10.7-second authored reset makes the repeated preview continuous.
