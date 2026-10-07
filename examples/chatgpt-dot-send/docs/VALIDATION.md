# Validation and limits

`npm test` covers motion math, body/bubble geometry, zoom normalization, render-scale isolation, cleanup timing, grouping, spacing and the moving multiline destination.

The preview is an offline render, not a certified match to a user's running app. Browser layout/compositing, runtime rectangles, zoom and font metrics remain unverified; Noto Sans CJK SC substitutes for the system font.

See [AUDIT.md](AUDIT.md) for the reusable geometry and timing contracts.
