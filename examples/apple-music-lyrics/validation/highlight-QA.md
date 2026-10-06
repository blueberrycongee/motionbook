# Framewise highlight QA

Verified on 2026-10-06 after the shared core and both preview exports were frozen.
The full `npm test` run passed **56 tests: 56 passed, 0 failed, 0 skipped**. This
includes all 40 existing checks and 16 new highlight regressions in
[`test/highlight.test.cjs`](../test/highlight.test.cjs).

## What this establishes

The checks cover original-frame correspondence, source-constrained fitted fields,
absolute-time evaluation, and the actual shared SVG renderer through
Sharp/librsvg. They do not run a browser or an iPhone, and do not measure display
refresh, GPU performance, audio synchronization, or native Apple Music code.
Passing them is not a native-fidelity percentage. No original song text or source
image pixels are included in this report or its numeric test fixtures.

## Baseline defects reproduced

The existing 40 tests passed before this rework, but did not catch these issues:

1. The old model interpolated the rightmost near-white pixel column directly.
   Its own measurement notes warn that glyph gaps and threshold crossings create
   plateaus; they are not reliable temporal pause keyframes. B2's old front
   reverses by 0.0139 of row width from 20.420400 to 20.453767 seconds, about four
   source pixels. The model reproduced that threshold fluctuation as a reverse
   sweep. A4's 0.359 threshold advance in one source-frame interval likewise
   cannot be adopted as an exact native mask velocity.
2. The clip began at local x = -1 and used the padded template width, while text
   began at x = 4 and declared textLength = width - 8. These coordinate systems
   did not describe the same ink interval.
3. The offline backend ignored textLength/lengthAdjust. Unmasked B2 with declared
   textLength 72 versus 332 produced byte-identical rasters in librsvg 2.62.91.
   Some glyph tails therefore escaped the full-width clip. A1 ink extended to
   local x = 278 against a declared end of 273; B4 extended to 236 against 219.
4. Separate dim and bright text copies composed antialiased coverage twice. Even
   equal dim/lit alpha changed the glyph raster as the old clip advanced.

The revised scene passes full-ink endpoints, real width-resizing, and equal-alpha
single-composition checks. It uses explicit horizontal glyph transforms and one
spatial-opacity gradient. These are properties of the authored reconstruction,
not statements about Apple's font or implementation.

## Source evidence and uncertainty

[`highlight-field-fit.json`](highlight-field-fit.json) retains **460 records**:
A3, A4, B1, and B2 at every source frame 500–614, including below-detection,
occluded, blurred, complete, and censored states. Independent ffprobe inspection
of the authorized source confirmed all 115 frames, PTS 500500–614614, in the
1/30000 clock. Its SHA-256 matches the source identity recorded in the core.
Native spacing is 1001 ticks, or approximately 33.3667 ms.

The tests require every partial fitted center to stay within its supplied
`modelAdmissibleCenterInterval`. Settled fitted centers carry an engineering
uncertainty of ±3 source pixels; censored onset/tail representatives have wider
bounds, generally at least ±8 pixels. These are conditional fit bounds, not
statistical confidence intervals. The direct-data bracket can be wider where
ink is absent. Complete or occluded states do not acquire invented exact edge
constraints.

The source supports a spatial ramp better than a fitted hard edge in the tested
mature frames. The retained same-frame fit statistics are:

| Row | Median ramp RMSE | Median hard-edge RMSE | Median fitted feather, source px |
| --- | ---: | ---: | ---: |
| A3 | 0.01301 | 0.07183 | 20.4229 |
| A4 | 0.01931 | 0.14485 | 16.2502 |
| B1 | 0.01475 | 0.10041 | 24.6516 |
| B2 | 0.01528 | 0.074475 | 23.21045 |

A4 has only one mature frame in that comparison. The fits use the same source
sequence that supplies the controls, so they are fit-consistency evidence, not
an independent accuracy score or proof of Apple's gradient parameters.

Two timing distinctions are now retained:

- B1 has a partial field at frame 556, source time 18.551867 s. Its first old
  near-white threshold detection is frame 558, about 66.733 ms later. The new
  renderer preserves the earlier low-gain field; onset remains frame-bracketed
  and censored rather than being an exact recovered lyric timestamp
- B2 supports a stable partial-field interval at frames 608–614, source times
  20.286933–20.487133 s, spanning 200.2 ms between sample centers. The fitted
  center range is only 0.4129 px. Direct source support in the gap is the broader
  interval [178, 191] px. Hold onset is bracketed by frames 607–608, and its end
  is right-censored by the selected clip

The B2 monotone-center projection changes fitted controls by at most 0.13092 px,
within the stated uncertainty. It removes an unsupported backwards sweep; it
is not a claim that all native pixels are mathematically monotone.

## Regression contract

The 16 new tests cover:

- Complete original PTS correspondence for all 270 legacy observations and all
  460 new field records, including exclusions and censoring
- Every-frame reverse seeking and half-frame interpolation, independent of
  evaluation order and without mutating fitted controls
- All eight authored A/B rows dark at sweep zero and fully covered at sweep one
- Nested raster masks for narrow and wide authored rows, with geometry, alpha,
  gain, blur, and feather frozen to isolate the renderer property
- Single-paint coverage: equal dim/lit alpha gives the same glyph raster at
  every sweep position, including antialiased edges
- Actual rendered ink resizing when target width changes; changing only an
  unsupported textLength attribute cannot pass
- Source-to-authored ink conversion using measured ink bounds, fitted feather,
  and gain, with each center constrained by its own evidence interval
- Per-source-frame jump bounds derived from adjacent intervals: the maximum
  admissible advance is the later upper bound minus the earlier lower bound.
  There is no universal speed cap or arbitrary temporal smoothing threshold
- Monotone reconstructed centers and no subframe overshoot between accepted
  centers. Inter-frame interpolation remains a reconstruction choice
- Retention of measured spatial feather and same-frame ramp/hard-edge evidence
- Field fluctuations within the actual per-row negative source-step minima
- The bounded late B2 hold and the earlier censored B1 onset
- Exact quarter-speed presentation timing, missing/conflicting original-PTS
  rejection, and final old/new scene and output hash binding

Strict per-pixel monotonicity is **not** asserted for native images. In the
source-supported progression intervals, measured minimum normalized steps are
A3 −0.0302, A4 −0.0151, B1 −0.0241, and B2 −0.0399. The fitted-field test uses
those per-row bounds plus four-decimal serialization roundoff, rather than an
invented common alpha threshold. See
[`highlight-field-statistics.json`](highlight-field-statistics.json).

Raster assertions use one 8-bit level only for compositing roundoff. Endpoint
comparisons are exact. No perceptual/native-accuracy allowance is hidden in that
one-byte bound. Below-detection intervals are displayed dark as an explicit
convention; this does not mean source alpha was measured to be exactly zero.

## Export verification

The final normal preview remains **115 original frames at 1×**, with ideal source
duration 3.8371667 s. MP4 reports 3.837167 s; GIF reports 3.83 s. The approximately
−7.167 ms GIF duration error is centisecond quantization, not the cause of the
within-line jumps.

The slow review contains **67 original frames, 548–614, at 0.25×**. Original PTS
548548–614614 remain unchanged. Presentation PTS advance by 4004 ticks in the
1/30000 clock. The ideal duration is 8.9422667 s; MP4 reports 8.942267 s and GIF
reports 8.94 s. GIF uses 44 delays of 13 cs and 23 of 14 cs, with maximum frame
boundary error 4.933 ms. There are no inserted or duplicated source frames.

The final test checks every review-frame source timestamp and old/new scene SVG
hash, current core and harness hashes, measurement identity, archived baseline,
and final output bytes. The normal preview's original export-binding test also
passes. An additional independent complete decode of both MP4s and both GIFs
matched each recorded full-decode hash, expected frame count, and zero audio
streams. The review poster was visually inspected for layout and clipping.

The left review panel contains numeric source-field ribbons. It is not a source
screen replay. The other panels use authored text, whose different glyph shapes
and spacing necessarily prevent pixel-identical source text progression. GIF
repetition adds an end-to-start reset; interactive playback stops at its end.

## Reproduce

Run `npm test` from the example directory. The final review is bound by
[`preview/highlight-review/review-manifest.json`](../preview/highlight-review/review-manifest.json)
and the normal preview by
[`preview/render-manifest.json`](../preview/render-manifest.json).
The new review-binding check fails if its media/manifest is missing or stale.
The existing normal-preview check explicitly skips if its manifest is missing;
such a run is not the complete 56-pass verification reported here.
