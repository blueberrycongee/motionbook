# Public bundle validation

Checked 2026-10-07.

- 34 focused automated tests passed, zero failures
- All packaged GIF/MP4 files fully decoded with FFmpeg; GIF frames and durations also inspected with Pillow
- Runtime and normal preview bytes preserved from the approved source
- No official video, source screenshots, source-pixel comparisons or caches packaged

- `preview/Circle-to-Search-原速.gif`: 125 decoded frames, 400×720; SHA-256 `37bc8101b092ff7ecd5fe768e54b5d1f23be6bc7e8aba29582983cff9e735db4`
- `preview/circle-to-search.mp4`: 150 decoded frames, 400×720; SHA-256 `fbc9987d461385ff6cd4eccb7c9483f9d5ed56cb8a6d58db7df9fca44f0fb9f3`

The source-aligned replay check rendered 76 frame pairs identically. This demonstrates deterministic rendering, not similarity to official pixels. The public verifier creates its output directory when absent.

Tests use model, simulated DOM and/or offline Canvas checks. Actual browser layout, real pointer/touch interaction, accessibility-tree, native-device and cross-browser QA are not established. Previews are deterministic offline renders of shared source, not browser recordings. See the README and source provenance for fidelity limitations.
