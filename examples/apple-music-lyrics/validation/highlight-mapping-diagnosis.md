# Within-line highlight mapping diagnosis

This is a private engineering diagnosis, not a source-image deliverable. No source lyric strings are reproduced. Source frame numbers below are absolute frame indexes at 30000/1001 fps. Source PTS range under review is 16.683333–20.5205 seconds. Numerical morphology was measured on the authorized 438×926 device crop at source origin (1240,78).

## Bottom line

The delivered within-line reveal is not a faithful measurement of source animation. It turns an observation of the last *near-white glyph pixel* into the exact edge of a hard clipping rectangle. The source has intermediate brightness and a spatially feathered transition. This conversion both delays onset and introduces artificial stops and hops from letter-shaped measurement gaps. It then maps those stops onto differently shaped, differently spaced original demo text.

There are two independent rendering faults: duplicate white text layers over-composite alpha, and the delivered sharp/librsvg rasterizer ignores SVG textLength, so intended text bounds and actual bounds differ.

Do not apply a generic smoothing curve to the old front samples. Recover the latent source brightness field, keep independently supported onset/hold timing, then render that field once across actual authored ink bounds.

## Direct findings

### 1. Source threshold plateaus are not uniformly native holds

Source frame 580 (19.352667 s), line B2, visibly contains a broad brightness transition. Its delivered counterpart has a sharp clipping edge at local x59.45. The old model stores threshold front .2049 at frames 580–582, making that boundary stop.

The source pixel-field worker independently measured B2's recovered half-contrast front continuing from about x66.6 to x104.1 over frames 580–596, through several old near-white-front plateaus. These are extraction plateaus, not supported native holds.

In contrast, at frames 608–614 (20.286933–20.487133 s), the fitted half-contrast front stays approximately x180.1–180.5, with uncertainty interval [178,191] inside a real source word gap. This late pause is supported by stable contrast-area evidence and should remain. Its exact coordinate within blank space cannot be identified. Old threshold data retreat from .6007 to .5868 at frame613, a 4.10 px backward motion in the delivered scene, although the source fit supports no such retreat. The fitted sub-half-pixel variation is smaller than its uncertainty.

Numeric field evidence: ../source-measurement/native-highlight-fields.json and ../source-measurement/highlight-field-fit.json. These are field measurements, not native lyric timing metadata.

### 2. Source and authored spacing differ substantially

The following inclusive local-x ink slots were measured from source morphology, using top-three per-column minimum-RGB observations above 115 and grouping obvious inter-word gaps. They are approximate to about one source pixel and contain no lyric strings.

- A3: [4,114], [125,131], [142,236], [247,286], relative to scene x39
- A4: [4,41], relative to scene x38
- B1: [5,111], [122,139], relative to scene x38
- B2: [5,179], [191,195], [208,292], relative to scene x38

Delivered authored raster ink slots, with current original demo text:

- A3: [4,80], [94,134], [145,200], [213,296]
- A4: [6,46]
- B1: [6,73], [86,145]
- B2: [6,118], [132,194], [206,286]

For B2, source first-word ink is 175px wide and its middle word only 5px wide; the authored first and middle words are 113px and 63px. Consequently the old source first-word-end plateau at fraction .6007 becomes an authored freeze at x176.21 *inside* the second authored word. Per-word front remapping could move the hold into authored whitespace, but would also multiply speed and feather width sharply through the authored middle word. That is not the smallest faithful change.

Recommendation: retain the original demo text and apply the recovered continuous field across measured ink endpoints. Describe authored word-specific pacing as supplemental, rather than imply recovered native word timing. If word-semantic phase matching is itself required, use newly authored text of similar word-slot morphology and mild per-slot scale; avoid stretching existing 113/63/81px slots into 175/5/85px slots.

### 3. Front normalization currently mixes padded geometry and ink bounds

The clipping rectangle starts at x=-1 and its width is w*p, so its right edge is -1+w*p. Intended authored text begins at x4 and has textLength w-8, which would place a normalized front at 4+(w-8)*p. Their difference is -5+8p pixels even before real font bearings or the rasterizer issue below. A fraction measured between original source ink extrema should not be interpreted as a fraction of a padded tracking box.

Use an explicit transform from source observed ink bounds to actual authored ink bounds, in consistent local coordinates. Include exact zero-contrast and full-contrast saturation states.

### 4. Current rasterizer ignores textLength

A reproducible sharp/librsvg probe rendered the same authored B2 text with textLength 50, 100, 287, and 350, all with lengthAdjust=spacingAndGlyphs. All four images retained the identical local-x ink extent [6,286]. Thus textLength is not doing the fitting expected by scene.js in delivered MP4/GIF frames, even though browsers can honor it.

Actual versus intended horizontal bounds:

- A3 actual ink [4,296]; intended text-length interval [4,289]
- A4 actual ink [6,46]; intended interval [4,44]
- B1 actual ink [6,145]; intended interval [4,142]
- B2 actual ink [6,286]; intended interval [4,291]

A3's terminal old highlight .9965 ends at x290.97 and leaves the final approximately five pixels of actual ink dim. B1 and A4 similarly have small incomplete tails. This is a concrete completion discrepancy, independent of gradient fitting.

Use explicit horizontal transform scaling or explicit glyph positioning in a shared coordinate system. Verify it in both browser and raster output. A textLength-only fix is insufficient.

### 5. Duplicate white text over-composites alpha

For an interior pixel, the A-block source-derived fade gain g is applied to both a base text opacity .5g and a lit text opacity g. Normal over composition produces effective alpha:

    1 - (1-.5g)(1-g) = 1.5g - .5g²

Examples:

- g=.684 gives effective alpha .792072, an excess .108072
- g=.352 gives effective alpha .466048, an excess .114048
- g=.233 gives effective alpha .3223555, an excess .0893555
- g=.12 gives effective alpha .1728, an excess .0528

Even at g=1, a half-covered antialiased edge a=.5 becomes .625 from duplicate text painting, instead of .5. This can thicken/glow edges and make a sharp highlight look more conspicuous.

Render one text surface with the dim-to-lit spatial alpha/color field, then apply the aggregate line fade once. For source gain, use the contrast increment above the dim baseline, rather than multiplying dim text opacity as though it were the lit increment. Preserve group blur semantics and verify alpha at fractional glyph edges.

## Minimum implementation order

1. Consume source-worker front50, feather, contrast/onset gain and uncertainty; do not reuse threshold-front knots as the driving mask
2. Replace duplicate base/lit text with a single-painted spatial fill or mask
3. Make text fitting explicit and cross-renderer consistent, then map source field to measured authored ink endpoints
4. Retain the supported late B2 pause; eliminate the unsupported threshold-induced backward sweep and earlier stops
5. Test exact zero/full endpoints, grayscale monotonicity while geometry/appearance are frozen, alpha composition, seek/patch parity, and rendered-frame continuity
6. Keep source pixels private; public evidence can show anonymous fields, numeric observations, original authored text, and uncertainty

## Limits

These observations establish a visual reconstruction of a particular source interval. They do not recover original TTML, audio syllable timings, source font metrics, internal shader code, or exact coordinates while the transition lies in whitespace. A recovered feathered field is a justified model, not a claim of implementation identity.
