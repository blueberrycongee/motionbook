# Highlight regression contract

Run `npm test`; highlight checks live in [test/highlight.test.cjs](../test/highlight.test.cjs).

- Preserve original PTS, exclusions and censoring for every numeric field record.
- Evaluate seeking/interpolation independently of order, without mutating fitted controls.
- Keep partial centers inside their `modelAdmissibleCenterInterval`; derive step bounds from adjacent intervals rather than an arbitrary speed cap.
- Map source fields to measured authored ink bounds, including feather and onset gain.
- At sweep zero/one, cover none/all of the intended bright ink. Explicit width changes must alter the raster.
- Paint each glyph once: equal dim/lit alpha must give the same raster at every sweep position, including antialiased edges.
- With appearance/geometry frozen, test nested masks and monotone representative centers without subframe overshoot.
- Preserve the early censored B1 onset and bounded late B2 hold; see [measurement method](highlight-measurement-method.md).
- Keep quarter-speed presentation timing distinct from source PTS; reject missing/conflicting timestamps and stale exports.

Source pixels need not be perfectly monotone. Per-row observed negative-step minima are A3 −0.0302, A4 −0.0151, B1 −0.0241 and B2 −0.0399, plus serialization roundoff; see [field statistics](highlight-field-statistics.json). Raster comparisons permit one 8-bit level for composition rounding; endpoint comparisons are exact.

The normal and slow [render manifests](../preview/render-manifest.json) / [review manifest](../preview/highlight-review/review-manifest.json) bind output to the shared scene. Model, field-fit and offline-raster checks do not establish native-device accuracy, audio synchronization or browser performance.
