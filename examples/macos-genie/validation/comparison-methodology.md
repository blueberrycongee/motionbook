# Comparison methodology

Compare moving silhouettes, phase and clipping at equal native timestamps and matched window/Dock anchors. Artwork, typography, wallpaper and Dock decoration differ intentionally; whole-image pixel equality is not a useful metric.

Top error is model top minus observed top. Edge error compares left/right boundaries at the same world y. Report vertical coverage separately so missing rows cannot hide behind small horizontal residuals. Exclude only predetermined corner/occlusion margins, never samples selected by their residuals.

Minimize uses fixed 16 px margins from top, bottom and Dock clip; restore uses 2 px plus preflagged occlusion/corner rows. Typical minimize contour uncertainty is approximately ±1 px, conservatively ±2 px. Restore includes codec/content detection outliers. Hidden geometry below the Dock is not observed.

The comparison uses calibration recordings, so residuals are fit diagnostics rather than independent device accuracy. [comparison-metrics.csv](comparison-metrics.csv) retains per-frame values. A slow review holds each recorded pose according to its original PTS; gaps remain holds, with no interpolated reference imagery. Source clips and the separate comparison-build tools are not bundled.
