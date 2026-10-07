# Reference inspection and fitting

## Reference identity

- Official page: https://developer.apple.com/videos/play/wwdc2024/101/?time=1317
- Source: WWDC24 Keynote, Apple, 2024
- Inspected region: about 21:57–22:00, 1920×1080, 30000/1001 fps
- The bottom-right menu cell explicitly reads **Jitter** and changes from white to blue at extracted frame 26. Shake and Nod are separate unselected cells.
- Source word: “bouncing”; this implementation uses the original replacement “wiggling”
- Timing derives from the official HLS playlist position and frame count. Absolute keynote positioning is approximate; decoder PTS has a different offset. Local frame relationships are at source-frame precision.

## Correction to the candidate description

The candidate pitch called this independent per-character jitter. The inspected frames do not establish unrelated character phases. Interior glyphs move in a tightly coordinated way: at frame 39 their horizontal offsets are approximately −3 px and vertical offsets progress from about −6 px at the first glyph to +0.4 px at the last. This is consistent with word-level translation and rotation around a stable layout anchor.

The first independent glyph fits were polluted by the blue selection handles and neighboring letters. A joint rigid fit on the central letters has a much lower and steadier residual. Therefore this implementation follows the coordinated fit. It does not invent random phases to match the earlier pitch. Grapheme-by-grapheme rendering still permits safe custom wording and preserves each glyph's advance width.

## Method

1. Decode the short official excerpt at its original 29.97 fps
2. Inspect full-context frames to identify the selected effect
3. Inspect enlarged selected-word crops
4. Extract dark glyph ink, excluding the blue selection decoration
5. Fit a shared translation and rotation against a pre-motion frame, using the interior of the word to avoid both clipped endpoints
6. Store 62 transform samples covering the observed burst; linearly interpolate these samples for 60 fps export
7. Apply the shared transform at each new glyph's measured center, without changing text advances or moving the selection box

The source-coordinate fit over frames 27–88 is approximately:

| Quantity | Range |
| --- | --- |
| Word-center X displacement | −4.28 to +2.80 source px |
| Word-center Y displacement | −2.98 to +2.46 source px |
| Rotation | −4.47° to +3.96° after conversion to Canvas convention |
| Motion sample interval | 33.3667 ms |
| Observed burst retained | about 2.04 s |

Displacement scales with font size. For the normal preview's 21 px font, source displacement is multiplied by 21/35. Rotation does not scale. The normal GIF includes a 0.65 s initial hold and a rest after the burst, with total loop length 4.5 s. That loop wrapper is a presentation choice, not a claim about the native repeat period.

At the burst boundaries, a 67 ms onset and 100 ms terminal blend remove small fitting and antialiasing offsets. These are reconstruction choices. The clip does not reveal Apple's original animation engine, exact internal parameters, a guaranteed repeat period, or behavior for arbitrary custom text.

## Evidence files

- `evidence/coordinated-fit.json`: per-frame rigid fit, source pixel coordinates
- `evidence/glyph-measurements.json`: initial independent glyph fit, retained to show why it was not used directly
- `preview/frame-bindings.json`: normal preview frame times and raw RGBA hashes
- `preview/render-manifest.json`: source file hashes and media hashes

The comparison uses replacement wording and a different licensed font, so it is not a literal pixel-equality test between the two words. Official video, extracted frames and source-pixel comparison media are not included in this public bundle.

## Verification boundary

Passed: focused Node tests, deterministic shared-scene rendering, Unicode segmentation, fixed layout advances, immediate replay replacement, pause/resume, cancellation, reduced-motion pixel stability, export decode and duration checks, selected-frame visual inspection.

Not run: actual browser input or accessibility-tree testing, native iOS testing, performance on a real device, Safari-specific font/render checks. No claim of 100% or native pixel equivalence is made.
