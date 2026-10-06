# Run & validation

## Run

- Open `index.html` directly in a modern browser, or run `npm start` and visit `http://localhost:4186`
- Runtime uses local JS, CSS, fonts and Canvas 2D; no install is needed to view the example
- Run `npm test` with Node 20 or newer
- To rebuild media: `npm install --ignore-scripts`, then `npm run render`; FFmpeg must also be installed
- For the separate 0.25× preview: `node render.cjs --slow`
- For still frames only: `npm run render:stills`

Rendering uses the pinned `@napi-rs/canvas` version in package.json. In this cloud environment the already installed version 0.1.100 was used via NODE_PATH; no packages were installed. Rebuild commands are provided for ordinary local development, not claimed to have been exercised through a fresh install.

## Verified

- 38 Node tests pass, including normal/slow preview–runtime timing equality, accelerated/decelerated displacement, fixed-height translation behind Dock, time-varying mouth width, measured timestamps, and interruption continuity
- Syntax checks pass for all shipped JavaScript
- Dense geometry sweep: 20,301 sampled rows stay finite, positive-width, vertically ordered and on the scene
- Reversal preserves the current pose; repeated clicks do not spawn concurrent frame loops
- Replay returns to open/manual state; explicit loop cancellation and Escape restore stop looping
- Reduced motion snaps to endpoints; OS changes retain a separately selected manual preference
- Hidden-document pause/resume and idle-frame shutdown pass the simulated adapter tests
- GIF and H.264 MP4 rendered from the final shared scene, with frame hashes and source hashes in `preview/`
- Open, bend, flow, and Dock PNGs inspected visually; encoded media decoded and dimensions/duration checked

The adapter tests execute the real app adapter in a small simulated DOM/RAF environment. They are not browser tests. The scene preview is deterministic offline Canvas rendering, not a screen capture.

## Unverified / blocked

The available cloud browser could not open the local preview endpoint. The exact authorized retry was denied by browser security policy; no alternate browser/network route was used. Real browser interaction, actual responsive layout at mobile widths, browser rendering parity, assistive-technology behavior and runtime frame-rate performance remain unverified. Responsive CSS and accessible controls were implemented and source-reviewed, but that is not an end-to-end pass.

A native macOS recording was decoded and inspected for timing and edge motion. No current live macOS system or pixel-accurate parity test was used. The 500 ms minimize and approximately 533 ms restore follow the sampled reference intervals; typography, artwork and destination remain original. Default preview–runtime timing equality is explicitly tested. The slowed study is separate and labeled.

## Integration scope

Only `examples/macos-genie/`, the new root README entry, and `catalog/macos-genie.json` are changed. This example belongs to reference-animations, not Shroom. Publication is scoped to the example, its catalog entry and the root visual index.

## Frame-calibrated revision

See FIDELITY.md for the two native recordings, held-out scanline errors, frame-timing uncertainty, and interpretation limits. The runtime includes compact numerical measurements only. Reference video excerpts and frame captures appear solely in separately delivered review artifacts; they are not checked into the repository.

## Controls

Click the yellow window button, Minimize/Restore, or the Dock thumbnail. Space toggles; Escape restores; R replays. Slow motion, looping and scrubbing are optional. Reduced-motion preferences use instant endpoint changes.

## Checked-in scope

Original implementation, licensed local fonts, own GIF/MP4/stills, numerical calibration, tests, compact validation and provenance are included. Third-party footage, captured reference frames, comparison imagery, render scratch, caches and dependencies are excluded. `FILES.sha256` covers the example contents.
