# Public bundle validation

Checked 2026-10-07. All 64 focused automated tests passed, including six preview-clock tests. Normal GIF fully decoded with Pillow and FFmpeg: 640×810, 180 frames, uniform 20 ms delay, 3.6 seconds. All six PNGs fully decoded. Standalone rebuild is byte-identical.

See [test output](evidence/test-output.txt), [public validation](evidence/public-validation.json), and [preserved source hashes](evidence/public-release.json). Runtime, original artwork and corrected normal preview retain their approved bytes. The 180 ms runtime is unchanged; only the latest preview export clock differs from the original delivery.

Real browser input/layout, accessibility-tree, native device performance and current Telegram timing remain unverified. Historical numeric source measurements are retained without remeasurement. Official source imagery, source-pixel comparisons, old preview, caches and private-path logs are excluded.
