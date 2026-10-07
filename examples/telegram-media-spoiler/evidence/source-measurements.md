# Official Telegram media-spoiler measurements

Source: [Telegram’s official article](https://telegram.org/blog/hidden-media-zero-storage-profile-pics#hidden-media) and its [original MP4](https://telegram.org/file/464001154/11e69/9FLiJnH4fF4.2869553.mp4/18ca1dba8837d3db6f). Analyzed the stationary second reveal. Original is 1080×1080, 60 fps, 9.5 s. PNG frame n has PTS (n−1)/60; checked with ffprobe.

## Findings

- Actual reveal begins between PTS 7.533 s and 7.550 s (frames 453–454). Earlier large white annulus is the excluded tutorial touch indicator.
- Media bounds approximately x 347–851, y 195–581: 504×386 source pixels, ±2 px.
- Centre sharp-photo contribution is only about 12–15% on frame 454, 57–60% on 455, and 98–100% on 456. A fully opaque pinhole from the first frame would miss this ramp.
- Fitted 50%-clear radii for frames 456–461: 110, 150, 195, 240, 282, 316 px. These correspond to PTS 7.583, 7.600, 7.617, 7.633, 7.650, 7.667 s. Individual radius uncertainty is roughly 10–20 px.
- Over this measured interval, radius is nearly linear: approximately 2519 px/s, R² 0.9985. Extrapolated r50 = 0 is 7.5395 s; this is not independently measured onset. Six useful samples do not establish Telegram’s exact easing.
- A very broad soft edge: about 100–125 px between 10% and 90% clear. An equivalent full smoothstep transition is about 170–210 px. Scale these lengths with 504 px media width.
- Apparent product reveal centre from boundary fitting is around (592, 414), ±15 px; tutorial-ring centre is approximately (600, 398). The rectangle centre (599, 388) should not be presented as a measured tap origin.
- Substantially clear around 7.683–7.700 s; conservatively effectively clear by 7.733 s. A roughly 180 ms visible reveal is a reasonable reproduction target; an exact terminal frame is hard to isolate from touch-overlay remnants and clipping.

## Reproduction model, explicitly inferred

A near-linearly expanding Gaussian-blurred disk is a plausible approximation: fitted blur sigma about 40–54 source px. For the first six revealing frames, disk-radius fits are 27, 58, 119, 156, 203, 244 px. This naturally begins transparent and builds centre opacity as the disk grows. It explains the initial ramp better than an immediately opaque centre with a narrow feather. Do not add a visible ring, hard circular edge, zoom, or global image movement. No exact-match claim is warranted.

The concealed image is strongly blurred with a nearly stationary color field. A rough comparison gives a Gaussian-blur starting point around 40 source px plus color treatment, but it does not identify Telegram’s native blur operation.

## Hidden-particle texture

For a 167,088 px² inner crop, high-pass luminance threshold 0.06 finds approximately 2,208 bright components /2,338 local peaks, median component area 4 px², and 5.4%bright coverage. These are threshold-dependent image statistics, not an exact particle count. Typical bright-speck diameter is about 2 px at source resolution; several thousand specks cover the media.

Particle-texture correlation is 0.928 at 1 frame, 0.759 at 3 frames, 0.483 at 0.1 s, 0.203 at 0.2 s, and 0.087 at 0.3 s. This supports persistent slowly drifting/twinkling particles rather than fully resampled random static each frame. Keep them small, dense, irregular and bright.

## Method and limitations

Sharp-photo contribution was estimated from high-pass color correlation with the clear frame 480. Boundary fits exclude media edges and the tutorial-ring annulus. Fits near first onset and after the boundary leaves the rectangle are weakly constrained. The overlapping tutorial marker, video compression, antialiasing, concealed-thumbnail color treatment and source-photo texture limit precision. See [source-measurements.json](source-measurements.json) for frame/PTS data, methods and detailed uncertainty.

## Public bundle provenance

These numeric observations are carried forward from the original source analysis, not remeasured during public-release preparation. Official video, source frames, source-containing comparisons and crops are deliberately excluded. Source links and the source-video SHA-256 are preserved in the JSON evidence.
