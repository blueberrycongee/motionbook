# Native lyric-highlight field measurements

## Outcome

The source contains a moving, feathered brightness transition within glyphs. A hard clip placed at the last near-white source column discards the partially bright region, starts late, and mistakes glyph gaps for temporal holds. It also transfers source glyph spacing incorrectly when applied directly to different authored text.

This is not a reason to smooth everything. The source has genuine rate changes and a supported late B2 hold. Preserve them.

## Coverage and repeatability

- Main interval: all 115 native video frames 500–614 inclusive, PTS 500500–614614 at time base 1/30000
- Times: 16.683333333–20.487133333 s; end-exclusive 20.5205 s
- Native cadence: exactly 1001/30000 s = 33.3666667 ms
- Four registered physical rows: A3, A4, B1, B2, yielding 460 row/frame measurements
- Crop: x1240, y78, width438, height926
- Supplied independent row tracks register every source frame. Moving/blurred and occluded samples remain present but are explicitly excluded from trustworthy front fits
- Ancillary native source frames 469–471 and 640–642 calibrate inactive and fully lit states. The analysis interval itself is never resampled

Run, in order, with existing NumPy/SciPy/Pillow and ffmpeg:

1. `python extract_native.py`
2. `python analyze_native.py`
3. `python fit_fields.py`
4. `python validate_fields.py`

The `private/` directory contains source pixels and is not a deliverable. The JSON/CSV outputs and this report contain only numerical/geometric proxies and no lyrics or source imagery.

## Files

- `native-highlight-fields.json`: every native row/column brightness proxy, valid-column masks, endpoint profiles, registration status, aggregate area, and initial two-parameter ramp diagnostics
- `native-highlight-samples.csv`: flat row/frame diagnostics from the initial field extraction, **not** the final representative fit
- `highlight-field-fit.json`: frozen v2 integration schema; final representative fields, original unconstrained raw fits, censoring, data intervals, engineering uncertainty, and explicit reconstruction conventions
- `field-statistics.json`: model comparisons, field monotonicity with measured noise, late-hold evidence, and profile-extraction sensitivity

## How the field is measured

For each registered row and x column, average the three greatest min(R,G,B) values along y. Normalize this brightness proxy against the median of listed inactive/lit endpoint frames. Only use columns with lit-minus-inactive contrast greater than35 and lit brightness greater than170. Thus whitespace is missing evidence, not zero highlight.

Fit a clipped linear spatial ramp with front position, feather, leading plateau gain, and small dark offset. The offset absorbs endpoint/background drift and is not intended as a renderer parameter. This is a compact empirical brightness model, not a claim about Apple's native shader, semantic tokenization, or timing code.

The leading plateau itself rises at onset. B1 gain is about0.135 (censored) at556,0.404 at557,0.707 at558,0.907 at559 and0.996 at560. A4 similarly rises through0.453 at517 and0.842 at518. A front/feather model with forced full gain misidentifies this onset fade as an excessively wide feather.

## Quantitative findings

### Feather versus hard edge

For mature, well-sampled frames, median normalized-brightness RMSE:

- A3: ramp0.0130; best hard edge0.0718
- A4: ramp0.0193; best hard edge0.1449 (one mature uncensored frame)
- B1: ramp0.0148; best hard edge0.1004
- B2: ramp0.0153; best hard edge0.0745

The hard-edge comparison is allowed its own best gain and offset, so its disadvantage is not merely a brightness mismatch. Mature feather medians are approximately20.4px A3,16.3px A4,24.7px B1,23.2px B2. Short onset ramps and changing apparent widths are measured separately; a single universal width is not established.

A spatially uniform per-word opacity model cannot explain the simultaneous bright-left, partial-middle, dim-right field observed within B2's long first word. At frames580,590,596, the best three-segment uniform brightness model has RMSE0.362–0.373, compared with the ramp's0.0154–0.0157. An onset fade can coexist with a moving spatial ramp.

### False holds in the old threshold front

Examples in B2 where the old last-white fraction is unchanged but the new field advances:

- Frames574–575: old0.1285 stays fixed; fitted center44.38→49.92px; area increases0.01860
- Frames580–582: old0.2049 stays fixed; fitted center66.60→71.72px; area increases0.02045
- Frames590–592: old0.2847 stays fixed; fitted center90.14→95.09px; area increases0.01734

These are not pauses. Partially bright glyph columns continue changing.

### Real changes to preserve

- B2 slows to approximately2.1–2.5px per source frame through much of580–596, then advances7.25px at597. It has another10.31px source-frame advance at604. Do not erase these rate changes with a global smoothing spline
- B2 frames608–614 support a genuine held brightness field over200.2ms between sample centers. Area stays0.65621–0.65827. Fitted center stays180.112–180.525px
- The direct threshold-bracket interval during that hold is[178,191], spanning a glyph gap. Exact off-ink center position is therefore conditional on the ramp model; the subpixel fit jitter does not establish backward motion
- Hold onset is bracketed between607 and608. Hold end is right-censored by the chosen range
- B1 partial highlight is supported at556 (18.551867 s), before old near-white detection at558 (18.618600 s)
- B2 partial highlight is supported at567 (18.918900 s), before old near-white detection at569 (18.985633 s)
- A4 frame516 shows only a small one-column hint near the noise floor; the first clear partial field is517. Do not claim sub-frame onset precision
- A3 still changes its last few columns through512 and is near-complete at513. A4 is near-complete at522; B1 at565

## Uncertainty and reconstruction conventions

- Source observations are spaced33.3667ms apart. This clip cannot demonstrate120Hz display timing or any particular sub-frame interpolation
- Conservative spatial fit uncertainty is±3px for settled, sufficiently sampled fields; at least±8px for censored onset/tail fits. These are engineering bounds, not statistical confidence intervals
- Direct data intervals and glyph gaps must also be retained. The±3px interval is conditional on the clipped-ramp family and does not make an empty gap directly observable
- Profile sensitivity checks using top1/top5 minRGB and top3 green shift mature measured front estimates by no more than0.41px, supporting the larger conservative bound. This does not test unrelated typography or another source capture
- Exact zero alpha is unidentifiable below the detection threshold. `below_detection` is rendered with gain0 as a convention
- Once fully lit, the gradient may be outside the glyph. `complete` renders the full highlight; an off-ink front or feather is not claimed as observed
- When only a few terminal columns remain partial, raw front/feather/gain become underdetermined. Preserve the raw fit, but the representative tail keeps gain1 and a recent reliable feather, fitting only the remaining front. This avoids interpreting a collapsing fit width as a source reversal
- Strong-column source brightness is monotone only within noise, not mathematically exact. Across A3 500–513, A4 517–522, B1 556–565 and B2 567–608, every strong-column negative step is smaller than0.04 normalized brightness and row area increases. A0.05 tolerance is appropriate for field-regression tests

## Mapping to authored geometry

Physical source ink bounds, inclusive local column centers:

- A3:[4,286]
- A4:[4,41]
- B1:[5,139]
- B2:[5,292]

These agree with independent shape measurements within one pixel; use±2px edge uncertainty. A4's high-confidence brightness mask begins at5 while a weaker physical edge exists at4. For continuous ink span edges use[left−0.5,right+0.5]. Add `x_origin_crop` for crop coordinates.

Map the complete measured brightness field to the authored ink span, including feather and onset gain. Do not map a last-bright fraction to a different text advance width. The integration schema keeps measurement geometry distinct from the chosen authored-text rendering convention.
