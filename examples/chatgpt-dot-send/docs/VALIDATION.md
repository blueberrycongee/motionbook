# Validation and limits

- Standalone package: 37 tests passed, covering motion math, separate body/bubble geometry, zoom normalization, render-scale isolation, cleanup timing, source-derived grouping/spacing and the moving multiline destination.
- Full historical worktree: 47 tests passed before this freeze; the additional 10 tests concern the older r2 scene and are intentionally not shipped.
- Seven isolated source-function fixtures: zero numerical differences in the compared spring samples, start translations, squish extrema and background-shape values. The fixtures are synthetic; see `evidence/protocol-comparison.json`.
- Accepted MP4: 720 × 960, H.264, 60 fps, 7.35 seconds. GIF uses the same 60 fps source sequence with GIF centisecond timing granularity.
- Changed single-line and multiline before/start/mid/end frames were visually inspected. This package's media bytes match accepted r3.
- Freeze check: every SVG frame in the standalone scene was compared with the approved original r3 scene; all 441 frames matched exactly.

No actual user recording, app version/zoom/font measurements, or live browser/compositor validation was available. This is a source-grounded candidate, not a certified pixel/timing match to the user's current app. Noto Sans CJK SC substitutes for the original system font. Runtime CSS-transition phase, typography, device settings and actual measured rectangles remain unverified. These limits belong in documentation and do not appear as overlays in the animation.

See `AUDIT.md` for the reverse-audit findings and the exact r2 deviations corrected in r3.
