# Validation

## Scope and evidence limits

This report separates deterministic model checks, simulated-DOM adapter checks,
offline SVG/media checks, and observation of Apple's implementation. A passing
model or adapter test does not establish fidelity to native Apple Music.

- Deterministic checks evaluate absolute timeline positions and interruptible
  controller state without a real display clock.
- Adapter checks execute the real runtime script against a small event/attribute
  simulation. They do not run browser layout, an accessibility tree, touch input,
  or GPU compositing.
- Offline renders, when produced, use the same scene through Sharp/librsvg.
  They are not browser recordings or native-device performance measurements.
- Browser runtime appearance and native iPhone behavior have not been verified.
  The previously encountered localhost browser security warning was not bypassed.
- Source evidence and calibration, if obtained, must be reported separately from
  authored test data. Tests must not turn assumed timings, lyric span boundaries,
  spring constants, interruption behavior, or reduced-motion behavior into claims
  about Apple's implementation.

## Verification status

The final `npm test` run passed **56 checks, with 0 failures and 0 skips**:

- 20 deterministic motion/controller checks
- 16 simulated-DOM and scene-attribute checks
- 4 offline rendering/media-manifest checks
- 16 source-backed highlight, glyph-raster, and quarter-speed review checks

The executed transcript is [validation/test-results.txt](validation/test-results.txt).
This is a behavioral and export-integrity result, not a native-fidelity score.

The shared scene raster is deterministic at **438 × 926**. The final export is
bound to the current controller, calibration, scene, assets, render harness, and
independently acquired source SHA-256 by
[preview/render-manifest.json](preview/render-manifest.json). Output hashes were
rechecked against the actual files. The manifest records complete silent MP4 and
GIF decoding: **115 frames at 30000/1001 fps**, representing **3.8371667 seconds**
of source time. GIF centisecond quantization changes total duration by approximately
**−7.167 ms**; it does not change the authored playback speed.

## Executed behavioral coverage

- Exact lyric-line and timed-span boundaries, including just before and after
- Forward and backward seeking, pause/resume, reverse playback, and clamping
- Absolute-time sampling independent of frame cadence and evaluation order
- Independent per-line transforms with finite values throughout the timeline
- Zero-displacement takeover, interrupted transitions, and repeated commands
- Manual scroll, cancellation, and resumption of following playback
- Primary-pointer ownership, pointer cancellation and lost capture
- Keyboard behavior, interactive-child exclusion, and system reduced motion
- Hidden-page and back/forward-cache lifecycle handling without hidden-time jumps
- Persistent scene nodes and bounded animation-frame scheduling
- Actual patched SVG attributes after forward/backward and endpoint seeking
- Final endpoint holding its last visible lyrics rather than hiding every row
- No autoplay under reduced motion; explicit still-frame seeking remains available
- Disabling reduced motion does not unexpectedly restart playback
- SVG text escaping, native rational PTS, and final media/core/source hash binding

All numeric line channels include position, size, opacity, highlight-layer opacity,
blur, scale, and highlight extent. Dense forward/reverse sampling and alternating
input sequences check for finite, bounded output. Frame-cadence comparisons test
absolute-time evaluation of both playback and the supplemental follow-return
transition; they are not performance benchmarks.

The adapter uses the actual `app.js` and `scene.js`, including pointer ownership,
responsive pointer coordinates, wheel delta units, pointer cancellation/lost
capture, keyboard commands, preference changes, visibility changes, and page
hide/show. Its lightweight DOM has no layout engine, touch hardware, or browser
accessibility tree.

## Issues found and corrected

- Per-line scale was present in the model but initially omitted from the SVG
  transform; the scene-channel regression now verifies it reaches rendering
- A non-primary pointer could initially begin a new drag; pointer ownership tests
  now reject that case as well as secondary pointers during an existing drag
- Playback stopped at an exclusive source-time endpoint that initially hid every
  lyric row; endpoint tests now require the final visible source rows to remain
- Upcoming blocks initially inherited the active block's metadata interval; the
  calibration metadata was corrected to leave those blocks inactive in this clip
- The export-integrity check caught stale media after calibration/controller
  changes; the final media was regenerated and the current hashes pass

## Source-evidence interpretation

The final reference path uses all **1,161 accepted native-frame geometry
observations across 13 physical rows**. The knot-equality test proves the model
retains those observations. Zero residual at supplied knots is a fit result; it
does not establish independent accuracy, correct glyph painting, or native
implementation equivalence.

The earlier even-frame-only model and adjacent odd-frame temporal holdout remain
historical diagnostics. They are not accuracy scores for the final all-observation
model, and they are not an independent device or source recording.

Measured positions locate padded image-template boxes. Their widths/heights and
bottom edges are not independently measured typographic bounds or baselines.
Original text/font choices also prevent pixel-level glyph equivalence. Occluded
outgoing rows are hidden rather than claiming a measured continuation of their
unobservable path.

The normal scene uses a measured line-level bright-front approximation. Generic
`activeAt` and `spanProgress` tests check authored timing helpers only. There is no
claim of original TTML ingestion, native word-span timing, or audio synchronization.
Manual scrolling, cancellation, reversal, the 0.45-second follow-return transition,
and reduced-motion behavior are supplemental interaction choices, not observations
of the native implementation.

## Reproduce

Run `npm test` from this example directory. The export-binding test will fail if
the core/assets change after rendering. If the preview manifest is absent, that
one check is explicitly skipped; a run with that skip is not a complete export
verification. Rebuild the preview with the authorized source through the render
tool before rerunning the full suite.

Additional rendering/comparison-tool self-checks are recorded separately in
[render-harness-tests.json](validation/render-harness-tests.json) and
[comparison-harness-tests.json](validation/comparison-harness-tests.json). They
are not included in the 56-check count above.

## Highlight revision after frame-by-frame review

The added highlight suite is documented in [validation/highlight-QA.md](validation/highlight-QA.md). It includes all 460 native-frame field records for four dynamic rows, source-backed front intervals and step bounds, onset gain, partial endpoints, the late B2 hold, source-noise-aware field fluctuations, single-painted glyph alpha, explicitly scaled ink bounds, and current normal/slow export binding. Spatial soft ramps replace hard clipping; no arbitrary temporal easing or velocity cap was added.

The 0.25× diagnostic review retains source frames 548–614 exactly once each, holding each for four times its original duration. It has 67 frames, 8.942267 seconds ideal duration and 8.94 seconds GIF duration. Its source panel is an anonymous numeric field visualization, not source footage.

A strict monotone raster test applies only to a controlled renderer input. Native per-column pixels contain compression/background/fitting fluctuation; tests do not falsely require every observed native pixel to increase monotonically. B2's representative center correction is at most 0.13092 source pixels and stays within the stated measurement uncertainty.

## Publication delivery encoding

The accepted GIF was losslessly re-encoded from 14,802,134 to 2,950,941 bytes for repository delivery. All 115 decoded RGBA frames, transparency, dimensions, individual frame durations, and loop count are unchanged. Runtime source and accepted motion data are unchanged. Details are in [validation/publication-gif-optimization.json](validation/publication-gif-optimization.json). The GIF file hash is updated in the current render manifest; raster hashes still bind the accepted shared scene.
