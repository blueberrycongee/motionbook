# Telegram spoiler timing audit: delivered v0

This historical audit describes version 0. Its GIF is not bundled; the public preview is the corrected 50 fps export. Numerical evidence is retained, without source imagery or comparison media.

## Result

The GIF is not globally sped up. Its 108 decoded frames total exactly 3,600 ms. The verified problem is coarse onset sampling: it jumps from fully hidden to an already 82.35%-clear center. This makes the beginning feel abrupt despite preserving the 180 ms animation envelope.

The source-calibrated Gaussian model would show center values near 14.5%, 57.6%, and 97.3% at the native source's first three sample times (+8.333, +25, +41.667 ms). The delivered 30 fps GIF instead first samples at +33.333 ms, then +66.667 ms: 82.35% and 99.61% clear. These are actual isolated shared-runtime pixels; analytical disk values differ slightly because of 8-bit rendering.

Decoded full-color GIF media matches fresh full-color renders at frames 40/41/42 with mean absolute RGB errors 1.45/1.62/1.78 out of 255. The export is displaying the expected model frames; no added speed multiplier or substituted later frames was found.

## Actual rendered coverage measurements

Values below are first integer-millisecond samples of isolated black/white mask rendering. “Mean clear” is average clear-layer alpha across the media, not the percentage of pixels that are entirely clear.

- Source-calibrated geometry, 504×386, origin (245,219): mean-clear 50/90/99% reached at 68/106/138 ms
- Normal preview geometry, 480×360, centered: mean-clear 50/90/99% reached at 72/114/145 ms
- Normal preview: 50/90/99% of pixels have at least 50% clear alpha at 72/105/125 ms
- Normal preview: 50/90/99% of pixels have at least 90% clear alpha at 96/132/149 ms
- Normal preview: 50/90/99% of pixels have at least 99% clear alpha at 118/153/172 ms

The delivered GIF's sampled mean-clear values are 0%, 11.0%, 44.3%, 81.0%, 97.2%, and 99.86% at encoded onset offsets 0, 30, 70, 100, 130, and 170 ms. Most visually substantial change is over before the 180 ms state envelope ends. Calling that envelope the exact visible duration would be misleading.

The current maxRadius normalization makes radius/width about 7.1% smaller for the center-tap preview than for the source-calibrated tap. Actual coverage thresholds are correspondingly a little later. It does not cause the reported fast impression. Replacing maxRadius normalization with width would make this center preview expand around 7.7% faster and is not an evidence-based fix for this complaint.

## Export-only recommendation

Use 50 fps with 20 ms GIF frame delays. Keep the shared runtime at 180 ms. Set the deterministic onset to 1311.666667 ms so the first revealing sample at 1320 ms is only 8.333333 ms after onset.

The proposed first three actual center pixel values are 12.55%, 66.27%, and 98.04% at +8.333, +28.333, and +48.333 ms. This restores a subtle first frame and adds temporal detail without deliberately slowing the motion. A normal, separate click cue can make timing easier to read; it should not be incorporated into the product mask as though Telegram's tutorial pointer were part of the effect.

The old preview contains no cursor and resets abruptly at the first sample after 3050 ms: runtime 3066.667 ms, encoded GIF PTS 3070 ms. These change viewing context but do not accelerate the reveal. Interactive app code does not perform this scheduled reset.

## Limits

The source-geometry coverage metrics are from the existing Gaussian-disk fit, not direct recovery of Telegram's native alpha field. Original video pixels were inspected, but different artwork, source pointer overlay, blur/color processing, and compression prevent an exact cross-image perceptual timing proof. Browser performance, live input latency, display refresh and the user's particular GIF player were not measured.

Machine-readable results: `model-audit.json`, with detailed render sweeps in `model-metrics.json` and sampled comparisons in `sample-metrics.json`. Five audit assertions passed in `assertions.txt`. Main source files were not edited.
