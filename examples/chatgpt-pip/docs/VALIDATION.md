# Validation

- 95 Node tests passed; 0 failed, rerun with the raw trajectory JSON absent.
- Both trace readers consume lossless gzip/base64 packaging; the independent check passed for all 782 frames with no raw JSON.
- Local HTTP smoke passed for 8 app, source, and fixture routes.
- Native Swift changes are confined to presentation string literals; normalized code matches the approved v4 archive.
- All JavaScript syntax checks and the native shell-script syntax check passed.
- All 782 approved slow/fast simulation frames match exactly, including position, velocity, release choice, and settling state.
- The independent Python recurrence check passed within 1e-9 tolerance.
- Shared state/physics modules and the browser stack adapter are byte-identical to approved v4.
- Snap GIF and MP4: 1280 × 560, 480 frames, 30 fps, exactly 16 seconds.
- Hover GIF and MP4: 1280 × 660, 315 frames, 15 fps, exactly 21 seconds.
- All 795 rendered PNG frames have clear borders on all four sides; no cards, controls, pointers, or shadows are cut by the framing.
- Snap slow release, fast release, slow-motion stills, and external hover controls/Hide menu were visually reviewed.

Browser UI validation was attempted but did not run: the bundled Playwright browser is absent, and the installed system Chromium aborts with `socket() failed: Operation not permitted (1)`. No restriction was bypassed. Native macOS compilation and runtime/pixel parity remain unverified on Linux.

See [machine-readable validation](validation.json) and [provenance](PROVENANCE.md). The previews are offline renders.
