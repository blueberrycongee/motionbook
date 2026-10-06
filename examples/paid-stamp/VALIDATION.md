# Run and validation

## Run

Requires Node.js 20 or later.

```sh
npm start
# Open http://localhost:4173
npm test
```

To reproduce the offline media, install the pinned Sharp dependency and have FFmpeg on PATH:

```sh
npm install
npm run render
```

The preview is generated from the same SVG scene used by the page. It is an offline Sharp/librsvg render, **not a browser recording**.

## Controls

The page initially replays the observed sequence. Drag a date column, use the wheel, or focus it and use arrow keys to take control. Choose a status/color, then select **Mark**, **Undo**, **Done**, **Download PDF**, or **Next invoice**. Enter on the page marks the invoice; R, Escape, or the replay button resets it. Reduced-motion mode begins with a stationary, usable editor and applies state changes without the animated transition. The touch rings in the recorded sequence are drawn demo indicators.

The PDF is generated locally with the current selected date/status. It is explicitly an illustrative document, not a payment request. No payment, upload, or network service is connected.

## What was checked

- All 523 encoded original frames were inspected chronologically, at their original presentation timestamps. The source is the original 1080 × 720 media file, not the gallery preview.
- All 523 same-PTS independent renders were reviewed against the originals. Additional enlarged checks cover the clipped invoice entrance, early extrusion, stamp contact/rebound, exit, pressed rings, staged confirmation, and final controls.
- Focused review led to corrections of the 198–208 contact width, the red imprint's partially occluded onset at frame 199, form-exit opacity/blur, both pressed touch rings, the early blank confirmation shell, independently phased confirmation children, and final caption/button entrances.
- Eight Node tests cover every source pose, source phases and loop reset, date bounds/leap years, status/color changes, mark/undo/done/next, reduced motion, DOM-stub drag/cancel/keyboard/accessibility wiring, and local PDF generation with valid object offsets.
- Revision 2 replaces the abrupt wheel blur cutoff with a continuous position-dependent blur/fade, builds both print borders as filled projected rings, shortens and optically weights the date lettering, and fits the observed red ink color. Exact RGBA comparisons of all 523 before/after frames found no changed pixels outside the projected wheel and print regions. All 523 final pairs were inspected again.
- 70 fresh final-code RGBA bindings passed. Complete MP4/GIF decoding passed. The MP4 has600 frames at1080×720/60fps; the GIF has300 frames at810×540/30fps and206 distinct RGB frames. Both last10 seconds; the GIF repeats indefinitely and its first/last RGB frames are identical. All77 authored tail frames were inspected from the final MP4. Diagnostic measurements and media metadata are retained in `validation/`.

## Limits

Actual browser execution was **not run**. Local Chromium socket creation and cloud-browser access to local URLs were previously restricted; those restrictions were not bypassed. DOM-stub tests do not establish real hit testing, focus behavior, pointer capture, browser filter output, download UI, frame rate, or mobile performance.

This is a close independent reconstruction, not a pixel-identical copy. Remaining differences include licensed substitute-font contours/weights, fine print-ink and cat-symbol edges, small stamp corner/sole contours, exact light/shadow falloff, slight gray/tint differences, and the faint last touch-indicator residue. Codec antialiasing also differs. There is no claimed whole-image fidelity percentage.

The boundary diagnostic includes weak early rubber-rim frames where the dark-pixel threshold sees only disconnected fragments. Its raw maximum is retained rather than discarded; it must not be interpreted as a whole-shape displacement. Strong visible contact geometry was separately inspected and corrected.

The complete source visual sequence is preserved. A short final hold and an explicitly authored 9–9.6 second crossfade return it to the initial editor for a 10-second loop. The source soundtrack is not copied. Additional live controls and the downloadable PDF are authored demo behavior, not evidence of the original application's functionality.

## Diagnostic summary

Across all523 native pairs, stage RGB mean-absolute-error has median1.944 and p95=2.222 channel levels; the main motion-region median is3.606 and p95=4.905. These are raw diagnostics, not similarity percentages. Over208 dark-rim detections, per-frame p95 contour distance has median1.414px and p95=2px. The low-contrast frame134 has a raw p95=13.786px and individual maximum52.202px; see the threshold limitation above.
