# Validation

Run `npm test` for motion/controller, simulated-DOM, SVG raster, source-field and media-integrity checks. Tests cover seek/reverse/pause, independent row channels, handoff/cancellation, pointer ownership, hidden-page handling, reduced motion, glyph endpoints and shared-scene export binding.

The normal preview retains 115 native frames at 30000/1001 fps over 3.8371667 seconds. GIF centisecond quantization yields 3.83 seconds. The separate 0.25× review holds frames 548–614 four times longer, without invented source frames. Its left panel shows anonymous numeric fields, not source footage.

- [Highlight checks](validation/highlight-QA.md)
- [Motion measurements](validation/measurement-evidence.zh-CN.md)
- [Normal render manifest](preview/render-manifest.json)
- [Slow review manifest](preview/highlight-review/review-manifest.json)

Changed source/assets can stale the export-binding checks. Rebuild through the [README commands](README.md) before rerunning; a missing normal-preview manifest causes an explicit skip, not complete export verification. `node tools/render-highlight-review.cjs` regenerates the slow diagnostic from bundled numeric fields and archived scene.

These checks exercise models, simulated DOM and offline Sharp/librsvg. Browser layout, accessibility, touch, GPU performance and native Apple Music behavior remain unverified. Calibration residuals are fit diagnostics; see [FIDELITY.md](FIDELITY.md).
