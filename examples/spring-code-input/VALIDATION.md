# Validation

## Run and controls

Run `python3 -m http.server 4195` in this directory and open `http://localhost:4195`. There are no runtime dependencies or external asset requests. Add `?clean` to hide the controls.

“Try it” enables the local interaction. Enter `123456` for success; another six-digit value demonstrates error recovery. Input never leaves the page and is not saved. Escape resets the interaction. Clicking the successful pill starts another attempt. This is a motion study, not an authentication implementation.

For tests and offline rendering, run `npm install`, followed by `npm test` or `npm run render`. Rendering also requires FFmpeg on PATH and uses the same scene and timing modules as the browser demo. The live interaction respects reduced-motion preference. The replay can be paused or restarted.

[Source and asset provenance](PROVENANCE.md)

## Automated checks

- 15 passing Node tests.
- 499 native timestamps are strictly increasing and produce finite, bounded geometry.
- Both recorded attempts reach the expected error and success states.
- Local input tests cover mixed-character paste, six-digit limiting, deletion/replacement, repeated activation, input during verification, reset while verification is pending, retry after failure, and reduced motion.
- A DOM event harness covers input→error→retry→success, Escape, replay, pause/resume, and switching back to live input.
- All JavaScript modules pass Node syntax checks.

The DOM harness is not a browser. Real browser layout, font loading, keyboard focus, touch behavior, and accessibility-tree behavior remain unverified.

## Rendering

The preview is rendered from the independent Canvas scene used by the demo. The MP4’s first 499 frames preserve the source timestamps exactly, including the complete 8.883333-second observed sequence. An explicitly authored one-second closure then morphs Verified back to Enter code, so the preview loops without a hard reset. These 60 extra frames are not claimed to appear in the reference.

The GIF is a 30 fps, 747×509 sampling of the same authored frame sequence. The original source footage is not used in the deliverables. All 499 source/reconstruction pairs are reviewed separately from the authored closing interval, with transition details checked at native resolution.

## Remaining visual differences

The supplied open-source font substitutes for the unavailable source typeface. Blur/compositing and per-cell overlap during the very short collapse/expansion intervals are approximations. The pointer is independently drawn; minor shape differences and spinner-phase differences remain. Offline Canvas rasterization may differ from browser Canvas output. These are disclosed limitations, not pixel-identical or browser-tested claims.
