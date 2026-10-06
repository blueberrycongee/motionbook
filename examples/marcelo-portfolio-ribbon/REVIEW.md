# Review and coverage

## Actual reference coverage

- Exact requested X post, retrieved using the official public syndication response.
- Highest listed MP4 variant: 3024×1964, downloaded with HTTP 200 using the supplied public URL.
- 679 native decoded frames, starting at 0.000000 s, last at 11.733333 s, video duration 11.750000 s. Variable frame cadence is preserved; container timestamp rounding is measured separately.
- All 679 source frames were individually present and visually reviewed in eleven consecutive contact sheets: 1–64, 65–128, 129–192, 193–256, 257–320, 321–384, 385–448, 449–512, 513–576, 577–640, and 641–679.
- Full-size / larger transition checks: frames 1, 25, 85, 160, 250, 345, 419, 496, 568 and 660. This was not reconstruction from the tweet description or a single poster.

## Recreated behavior

A ten-panel cyclic portfolio ribbon has a pinched center and flared outer edges. Horizontal dragging carries an inertial bend across the panels. The gallery progresses through vermilion light poster, cobalt glass sphere, black number poster, red portrait, cobalt typography, metal sculpture, cream number poster, crimson portrait, cream Japanese typography, and cobalt portrait, then wraps.

Numeric bend measurements were fitted across every native frame. Lateral motion was estimated using normalized vertical color profiles; neutral seams were detected in 510 of 679 frames and interpolated over the remainder. These data contain only geometry/timing coordinates, not reference pixels. The panels are rendered as an inverse screen-space mesh, with a thin cool/warm edge highlight. Live interaction uses a bounded analytic deformation with decaying momentum, with a short blend when taking control from recorded playback.

## Verification

- 12 automated tests passed: all-frame timing, finite and ordered edges, native interpolation, bidirectional wrap, repeated/interrupted drag, momentum decay and reverse input, reduced motion, time-gap clamping, local asset isolation, bounded deformation, and application event wiring.
- The application event test uses a mocked DOM/canvas. It covers pointer cancel/lost capture, repeated input, wheel, keyboard, resize and full-screen binding. It is not a browser test.
- All 679 output frames were also inspected in eleven consecutive contact sheets, in addition to clean full-size still checks. No missing/blank render frame was observed.
- MP4 container timestamps are within 0.6 ms of the measured native timestamps; all 679 source-time states are retained.
- Browser playback, real touch handling, actual full-screen activation and device frame-rate performance have not been verified because local browser preview is blocked. No alternate browser-control route was used to circumvent that block.

## Intentional differences

All artwork is independently created: the portraits depict new fictional adults; the sphere/sculpture are new generated compositions; the typographic posters are original code-based constructions. The record-player chrome/lettering is newly drawn. As requested, no source assets are reused. The source's black capture strip and audio are omitted. The preview carries no explanatory overlay, comparison label or review stamp.

The geometry and cadence are close reconstructions, not a claim of identical source code or exact pixel equivalence. Free dragging extends the reference demonstration into a runnable interaction.

## Repository viewing copy

The repository GIF is a 400 × 260 delivery derivative of the accepted 800 × 520 viewing copy. All 352 frame durations and the 11.73-second loop are unchanged. Spatial resampling and palette compression affect fine pixels; the full accepted MP4, source, fonts and independently created artwork are unchanged. Exact delivery hashes and timings are in evidence/delivery-preview.json.
