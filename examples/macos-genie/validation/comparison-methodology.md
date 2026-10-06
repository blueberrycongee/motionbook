# Genie native comparison: methodology

Built from 56 displayed native frames; 5.333328 s combined at 0.25× encoded-PTS playback. The concat timeline uses a 1 µs timebase. The MP4 is 60 fps by frame repetition; GIF is 30 fps with centisecond frame-delay quantization. Neither interpolates native reference images. An irregular native PTS gap holds both panes until the next observed frame. The HTML viewer steps each native frame directly. Final container QA confirms all 56 frames in order; FFmpeg places one 60 fps frame of the first hold at the final hold (3 instead of 4 repeats first; 9 instead of 8 last). Every interior hold has the expected count. This 16.7 ms boundary quantization does not desynchronize the two panes. GIF centisecond delays total 5.330 s.

## Separate review outputs (not checked in)

- comparison-native-025x.mp4 and .gif: two sequential direction studies
- comparison-minimize-keyframes.png and comparison-restore-keyframes.png: eight selected pairs each
- comparison-frame-by-frame.html and comparison-frames/: every native pair, exact PTS and keyboard stepping
- comparison-evidence.json: input/model hashes, all source PTS, frame durations, metric definitions and per-frame errors
- comparison-metrics.csv: compact per-frame residual report

## Scope and limits

The independent recreation renders the current scene texture through the current motion model at reference-matched native source, target and clipping coordinates. It does not copy source UI artwork. Wallpaper, window contents, Dock, shadows and corners intentionally differ. Compare the moving silhouette, phase and clipping, not whole-image pixels. The reference videos are included only in diagnostic imagery; no native video or frame is imported by the application runtime.

No pixel-perfect or independently validated macOS implementation claim is made. OS versions and true capture-time speeds are not established. Hidden sheet geometry and endpoints behind the Dock are not observable.

## Quantitative comparison

The baseline is the saved version-2 motion.js. Both versions are evaluated at equal elapsed native capture time from the measured onset bracket, with equal native source and Dock anchors. The baseline uses its actual advanceProgress clock: 0.5 s duration in both directions and a 1.5-exponent restore. The calibrated version uses its measured 0.5 s minimize / 0.533333 s restore timing. Therefore this comparison includes the actual old timing and phase-shape errors while keeping window anchors equal.

Top errors are model top minus measured top. Edge errors compare both x boundaries at the same observed WORLD y. Horizontal comparisons use only rows in both models’ visible vertical support. Missing vertical coverage is reported separately so absent rows cannot be hidden by a small horizontal residual. After-only errors include every supported eligible row. Rows are excluded only by predetermined corner/occlusion margins and flags, never by residual thresholds.

These recordings and contours are also calibration data. Top matches and small edge residuals are training/reconstruction fit diagnostics, not held-out accuracy or recovered native code. Quantized minimization contours have roughly ±1 px typical / ±2 px conservative uncertainty. Restore contour errors also include content/codec detection outliers.

### minimize
- Top MAE: before 20.674 px; after 0.000 px
- Common-row edge MAE: before 17.464 px; after 0.292 px
- Common-row edge RMS: before 30.648 px; after 0.381 px
- Eligible vertical coverage: before 98.75%; after 100.00%
- After all-supported-row edge MAE: 0.292 px
- Fixed 16 px exclusion from observed top, observed bottom and Dock clip. No residual-dependent rejection.

### restore
- Top MAE: before 60.198 px; after 0.024 px
- Common-row edge MAE: before 28.660 px; after 0.481 px
- Common-row edge RMS: before 60.305 px; after 2.232 px
- Eligible vertical coverage: before 98.41%; after 100.00%
- After all-supported-row edge MAE: 0.482 px
- Exclude preflagged corner/occlusion rows and fixed 2 px from observed top, bottom and Dock clip. No residual-dependent rejection.

## Rebuild

In the separate review bundle, run tools/build-comparison.cjs with Node and @napi-rs/canvas available plus ffmpeg and ffprobe on PATH. Set GENIE_MINIMIZE_VIDEO and GENIE_RESTORE_VIDEO to local source clips from the attributed URLs. Reference videos are not bundled. The baseline module, compressed contour measurements and rebuild tool accompany the separately delivered review bundle, not this checked-in example. Input SHA-256 hashes in the evidence file pin the recordings and model. Network access is not used.
