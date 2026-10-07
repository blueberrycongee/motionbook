# Highlight-field measurements

## Sampling and model

[Numeric fields](native-highlight-fields.json) and [representative fits](highlight-field-fit.json) cover A3, A4, B1 and B2 at all 115 source frames 500–614: 460 row/frame records. Native spacing is 1001/30000 seconds (33.3667 ms); source time spans 16.683333333–20.487133333 seconds, with end-exclusive boundary 20.5205. The crop is x1240, y78, 438×926 source pixels.

For each registered row/column, average the three greatest min(R,G,B) values along y. Normalize against inactive/lit endpoint medians. Use columns with lit-minus-inactive contrast >35 and lit brightness >170. Whitespace is missing evidence, not zero highlight; occluded/blurred rows remain marked rather than forced into a front fit.

Fit a clipped spatial ramp with center, feather, leading-plateau gain and small dark offset. The offset absorbs endpoint/background drift. Onset gain changes separately from front position; forcing full gain can misread a fade as a wide feather. This empirical field does not recover Apple's shader.

## Motion details

Mature feather medians are approximately 20.4 px (A3), 16.3 px (A4), 24.7 px (B1) and 23.2 px (B2); onset widths vary. Same-frame comparisons favor a ramp over a hard edge or uniform per-word opacity, but do not establish independent accuracy.

- B1 is partially lit at frame 556 (18.551867 s), before near-white detection at 558. Gain rises roughly .135, .404, .707, .907, .996 over 556–560.
- B2 is partially lit at 567 (18.918900 s), before near-white detection at 569.
- A4 has a weak hint at 516 and clear partial light at 517; gain is about .453 at 517 and .842 at 518. Do not claim sub-frame onset precision.
- B2 advances about 2.1–2.5 px/frame through much of 580–596, then 7.25 px at 597 and 10.31 px at 604. Preserve these rate changes.
- B2 holds at frames 608–614 for 200.2 ms between sample centers: center 180.112–180.525 px, area .65621–.65827. Direct evidence supports the wider gap interval [178,191]; onset is bracketed by 607–608 and the end is censored.
- A3 changes through 512 and is near-complete at 513; A4 at 522; B1 at 565.

## Uncertainty and rendering conventions

Settled front uncertainty is conservatively ±3 px; censored onset/tail fits need at least ±8 px. These are model-conditional engineering bounds, not statistical confidence intervals. Empty ink gaps can require wider direct-data intervals. Source cadence cannot establish 120Hz or sub-frame behavior.

`below_detection` renders gain 0 by convention; exact zero alpha is unobserved. `complete` renders full highlight without claiming the off-ink front position. Underdetermined tails retain gain 1 and a recent reliable feather while fitting the remaining front. B2 monotone-center projection changes controls by at most 0.13092 px; no temporal low-pass or arbitrary speed cap is added.

Map complete fields across measured authored ink, including feather and gain; see [mapping rules](highlight-mapping-diagnosis.md). Keep source fluctuation tolerances separate from controlled renderer monotonicity; see [QA](highlight-QA.md). Original source pixels are not distributed.
