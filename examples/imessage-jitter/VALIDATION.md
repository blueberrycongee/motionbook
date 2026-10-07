# Public bundle validation

Checked 2026-10-07.

- 18 focused automated tests passed, zero failures
- All packaged GIF/MP4 files fully decoded with FFmpeg; GIF frames and durations also inspected with Pillow
- Normal preview bytes preserved; the input adapter was optimized with new simulated-DOM regressions
- No official video, source screenshots, source-pixel comparisons or caches packaged

- `preview/jitter.gif`: 225 decoded frames, 800×880; SHA-256 `448c6b9e95996249724e250e4692dcb9dfbab2b6997e788915e772970f2cedc7`
- `preview/jitter.mp4`: 270 decoded frames, 800×880; SHA-256 `b7580e1ea54773f1ece22e375bcdb8ad8a9a13e2b2b477b733b2c1917fea6f42`

Tests use model, simulated DOM and/or offline Canvas checks. Actual browser layout, real pointer/touch interaction, accessibility-tree, native-device and cross-browser QA are not established. Previews are deterministic offline renders of shared source, not browser recordings. See the README and source provenance for fidelity limitations.

## Local interaction revision 1.0.1

Seven new app-adapter regressions cover completion/replay labels, pause/resume, preference changes, visibility, persisted restoration and rapid replay. Shared motion, sampled tracks and scene hashes remain unchanged; see validation/optimization-equivalence.json. The controls now derive their labels from actual controller state.

Current test output: validation/optimization-tests.txt. Earlier logs remain historical release evidence. No real-browser acceptance was added by this revision.
