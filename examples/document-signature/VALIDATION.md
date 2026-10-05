# Run and validation

Open index.html in a browser, or serve this directory with `python3 -m http.server 8000`. Click Sign to replay; Back to Docs returns with the observed reverse transition. Cancel or Escape immediately resets an interrupted sequence. R replays the complete timeline. Reduced-motion mode makes immediate state changes. No document is submitted or signed.

Tests: `node test.cjs`. Offline preview rebuild: install the development dependency from package.json, then run `node render.cjs`. Fontconfig uses the local fonts.conf for its temporary cache. The application uses system fonts and has no network dependency.

## Tests run

- `node test.cjs`: PASS. Source-timed state assertions, exact 6.55-second scene-loop equality, 400 finite SVG samples, simulated-DOM signing, Back, reset, interrupted Escape, replay and reduced motion.
- `node render.cjs`: PASS. 393 frames, 60 fps, 1080 × 1080 MP4; 20 fps, 864 × 864 looping GIF. These are offline renders of the same SVG scene used by the application.
- Actual-browser runtime: not run. Local Chromium launch and local-site access were denied in this session; the restriction was not bypassed. Simulated DOM and offline SVG renders are not a real-browser pass.

## Visual comparison

All 393 frames of the original 60 fps source and all 393 frames of the replica were decoded and paired in 25 numbered contact sheets. Every pair was inspected. Full-resolution idle, completed signature, success and entry/return transitions were also checked. Frame metrics and artifact hashes are in audit/frame-metrics.json and audit/summary.json; RGB error is in 0–255 channel levels, not a similarity percentage.

Corrections from the initial version include the measured phone silhouette and layered metallic rim, blue gradient, confirmation position, native horizontal signature wipe, upward/downward clipped button labels, and complete 60 fps timing. All-frame review caught an overly fast defocus transition: this now crossfades sharp and defocused layers, with the confirmation opacity tracked separately. Native measurements also calibrated the paper/check entry and return.

The source's small recording cursor/touch indicator and video-compression texture are absent from clean previews. Minor source-font rasterization, paper/bevel shading and crossfade softness differences remain. The code and vector artwork are independent, with no source pixels rendered into the application. This is a close reviewed reconstruction, not a claim of pixel identity or actual-browser verification.

A second focused review replaced guessed button-label easing with measured native-frame position/opacity tracks, including repeated source frames. It also delayed the sharp-body return at frames 327–332. Changed entry and return windows were checked again after encoding.

Final export reviewed on 2026-10-05T21:28:54Z. The fixed UI crop has median RGB MAE 4.35 and maximum 6.676. The largest differences are in the reverse overlap around native frames 328–329. These numbers include glyph and compression differences and are not fidelity percentages.
