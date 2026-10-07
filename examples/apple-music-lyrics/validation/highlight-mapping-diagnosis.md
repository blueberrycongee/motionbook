# Mapping highlights to authored text

A near-white threshold identifies the last bright glyph column, not the full feathered transition. Glyph gaps can create false plateaus; threshold noise can create false reversals. Use the fitted brightness field in [highlight-field-fit.json](highlight-field-fit.json), preserving supported rate changes and holds.

## Coordinate contract

Use physical ink bounds rather than padded tracking boxes or text advance width. Inclusive source x bounds are A3 [4,286], A4 [4,41], B1 [5,139] and B2 [5,292]. Continuous span edges are [left−0.5,right+0.5]. Map the field center, feather and gain together to actual authored ink endpoints.

Different words have different gap positions. Applying a source last-bright fraction to authored word spacing can put a false hold inside a word. Continuous field mapping preserves measured spatial behavior without claiming original TTML/word timing. If semantic word-phase alignment is required, use newly authored text with compatible word-slot proportions rather than extreme per-word stretching.

## Rendering contract

Sharp/librsvg may ignore `textLength`/`lengthAdjust`; use explicit horizontal transforms or positioned glyphs. Re-measure with `node tools/measure-authored-text.cjs` after changing text, then verify actual raster width and dark/full endpoints.

Paint one text surface with a dim-to-lit spatial field and apply the aggregate line fade once. Two overlaid text copies with alpha .5g and g produce 1.5g − .5g², incorrectly increasing opacity. At half-covered antialiased edges, duplicate painting can likewise thicken the glyph.

Use contrast gain above the dim baseline, retain group blur semantics and test fractional-edge alpha. The supported B2 hold at frames 608–614 stays; empty source gaps and censored states do not supply exact front coordinates. See [measurement method](highlight-measurement-method.md) and [regression checks](highlight-QA.md).
