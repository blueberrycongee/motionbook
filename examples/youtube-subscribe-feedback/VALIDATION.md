# Public bundle validation

Checked 2026-10-07.

- 21 focused automated tests passed, zero failures
- All packaged GIF/MP4 files fully decoded with FFmpeg; GIF frames and durations also inspected with Pillow
- Normal preview bytes preserved; the input adapter was optimized with new simulated-DOM regressions
- No official video, source screenshots, source-pixel comparisons or caches packaged

- `output/07-youtube-subscribe-demo.gif`: 162 decoded frames, 720×720; SHA-256 `4c60021e521e217c5d5dbfe360666bdb20868d888af1a042efb30dec2cce19c2`

The public renderer was rerun without official media and reproduced the approved normal GIF byte-for-byte. The offline scene and motion calculations retain the approved normal sequence; only shortcut/input scheduling changed. A same-runtime comparison of all 162 normal frames is byte-identical (see evidence/optimization-equivalence.json). The original GIF was not re-encoded.

Tests use model, simulated DOM and/or offline Canvas checks. Actual browser layout, real pointer/touch interaction, accessibility-tree, native-device and cross-browser QA are not established. Previews are deterministic offline renders of shared source, not browser recordings. See the README and source provenance for fidelity limitations.

## Local interaction revision 2.0.1

The expanded app-adapter suite covers Escape on native controls, composition protection, terminal RAF shutdown, reduced-motion timed cue/activation, reset cancellation, repeated replay and page lifecycle. The authored landscape continues through the normal 5.4-second sequence; a completed sequence stops scheduling. Reduced motion uses timed state-change wakeups rather than continuous frames. Hidden time follows the existing wall clock; restoration paints its current state.

Current test output: validation/optimization-tests.txt. Earlier logs remain historical release evidence. No real-browser acceptance was added by this revision.
