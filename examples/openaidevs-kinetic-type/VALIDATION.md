# Validation and limits

Checked locally on 2026-10-09. This document describes implementation checks, not reference-fidelity acceptance.

- Eleven Node tests cover fixed word placement, reveal/settling phases, dot trajectory and interpolation continuity, fade endpoints, reduced motion, input rejection, pause/resume, rapid replay, seek, and completion.
- Real background Chromium checks operate the controls, seek by keyboard, rapidly replay, emulate reduced motion, check 390px overflow, inspect settled-word pixels, load the bundled font, and confirm a fully black end frame. Results: `validation/browser.json`.
- Ten 1920×1080 PNGs in `preview/` are deterministic browser keyframes of this implementation.
- `preview/loop.gif` and `preview/loop.mp4` are derived from one continuous real-time browser recording. Encoding, duration, dimensions, frame diversity, bytes, SHA-256, and full decoding evidence are in `preview/recording.json`.
- No system preferences, user browser profile, desktop session, or original user checkout is modified by these checks.

## Measurement coverage

Fixed word ink bounds and reported dot positions come from the cloud researcher. Standard nominal word cues are .76, 1.00, 1.33, 1.65, 1.90, 2.15, and 2.53 seconds. Its fade is 4.40–4.64 s. Ultrafast nominal cues are 4.88–5.11 s, with all words settled white by 5.353 s. CTA cues are 8.23–9.62 s; the last fade is 13.44–13.79 s, leaving black until 14 s. The full numeric input is `src/sequence.mjs`.

Reference timestamps are approximate (50–130 ms uncertainty). The original recording’s frames and PTS were unavailable locally. Inter glyph shape differs from the reference font. Interpolation and transitions between samples are fitted, especially the sparse Ultrafast sweep. The second-scene fade at 7.74–8.00 s and unobserved dot endpoint radii require cloud review. No source-pixel similarity metric or high-fidelity verdict is reported.

## Repository checks

The baseline commit is `4a339f66f5703e7fd445c1124186c311674e43a7`. Before this change, catalog validation passed for 67 entries and 133 anchors. The full repository suite ran 54 tests: 53 passed; `test_published_source_and_scripted_states` errored because the existing `evals/motionbook/adaptation-comparison/round-4/results.json` is missing. This unrelated baseline failure is retained and must not be described as a regression from this example.

Final catalog checks pass for 68 entries, 138 anchors, and the three-column gallery. The full repository suite now runs 57 tests: 56 pass, including three new discovery/evidence checks, with the same pre-existing missing-file error. Results are recorded in `validation/repository-checks.txt`.

The delivered GIF is 960×540, 350 frames at 25 fps, exactly 14,000 ms, and 1,053,535 bytes. It has 299 distinct decoded frames. Its source run collected 841 RAF samples with no page errors. The MP4 and GIF both fully decoded. `preview/recording-contact-sheet.png` is a labeled overview extracted from the live GIF; it is supporting evidence, not the animation deliverable.

Browser evidence is Chromium-only; it does not establish cross-browser, mobile-device, or complete accessibility acceptance. Cloud visual comparison and user GIF approval remain pending.
