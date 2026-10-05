# Visual review

Reviewed 5 October 2026 by the implementation worker. This is a self-review pending independent publication review, not a claim of pixel identity or browser verification.

## Coverage

- Original source: 687 native frames, indices 0–686, actual presentation times 0.000000–14.700000 seconds.
- Each frame was paired with a fresh replica raster at its exact source timestamp. Every pair in all 46 sheets of the final comparison revision was visually inspected. The region contains the entire panel, all text, buttons, rows and moving cursor; surrounding empty canvas was also checked in full-frame comparisons.
- Final encoded MP4 tail: every frame 882–1007, 14.700000–16.783333 seconds, inspected in five consecutive sheets. This includes the authored return and stable loop seam.
- Full-frame comparisons: 0.0, 6.2, 10.8 and 13.3 seconds. Enlarged static and transition crops were used for text, footer, cursor color and grid-wave review.
- Five delivered stills were rasterized again from the final scene and matched byte-for-byte at decoded-pixel level. `preview/binding.json` identifies the final scene, controller, GIF and MP4 hashes.

## Corrections made during review

The selected hour is independent of the animated cursor position. Native timestamp boundaries are preserved without floating-point modulo drift. Direct jumps and the stepped Find best search use distinct timing. The green outline changes before its animated cap color. The footer crossfades and lifts between labels, the mint pill grows in, local clock colors settle, and the Find best wave fades individual colored grid cells in source order.

The final comparison preserves the source's complete presented effect: panel dimensions, four row layout, local times, grid pattern, cap/outline trajectory, overlap result and search wave. No source region was omitted to conceal a discrepancy.

## Remaining differences

System typefaces substitute for the source's unprovided fonts. Their numeral shapes, antialiasing and some stroke weights differ slightly. Secondary color/text easing is independently fitted rather than recovered source code. The recorded pointer is omitted from the clean demo. The additional return after the original footage is authored to make a seamless loop.

Evidence indexes and source/replica comparison images are retained separately for private review; original footage and source pixels are not included in this package. Automated tests and pixel-error diagnostics do not establish visual fidelity.
