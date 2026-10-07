# Validation

## Executed checks

Final verification runs the actual shared motion model, controller, adapter, scene, and offline export harness. Test output is retained in `validation/test-results.txt`.

- 33 pure model/controller/scene checks
- 19 simulated-DOM adapter checks
- 10 source-channel, deterministic raster, occlusion, native-PTS, public-package, and export-binding/decode checks
- Total: **62 checks**, passed with **0 failures and 0 skips** on the current code and retained media

The final results file records the executed public-bundle checks. A full run requires the retained normal GIF/MP4, their manifest, numerical evidence, Node 20+, Sharp, and ffmpeg/ffprobe. Missing or stale normal media fails rather than silently becoming a pass. Official source footage and comparison media are not required or downloaded.

Before the local interaction maintenance below, the former comparison-only binding test was replaced by one substantive check that cross-checks the retained original PTS against the normal export, fully decodes both normal files, rechecks their actual dimensions/frame counts/audio/timing, and rejects the excluded reference-pixel artifacts. The other 54 tests were unchanged in that packaging step. All 55 original-package tests passed before that replacement; all 55 public-package tests passed afterward, with no skips.

The simulated DOM has no browser layout engine, accessibility tree, actual touch input, display clock, or GPU. Its checks are useful for event wiring and state management but do not substitute for browser QA.

## Behavioral coverage

- Forward/backward seeks, exact frame stepping, pause/resume, replay, repeat and end-state holding
- Dense forward/reverse finite-state sampling and absolute-time evaluation independent of evaluation order
- Primary-pointer ownership; nonprimary and secondary-button rejection
- Press/drag, valid and invalid drops, capture loss, cancellation and wrong-pointer release
- Zero-displacement pointer takeover, opening/collapse interruption by seek, repeated create/reset/save cycles
- Input focus, Enter/save, Escape/cancel, empty-title rejection and exactly-once commit
- Hidden-page and back/forward-cache freeze/resume without elapsed-time jumps
- Reduced-motion no-autoplay, immediate manual settling and explicit still-frame review
- One pending requestAnimationFrame, cleanup on disposal and no shortcut interception in inputs
- SVG escaping of arbitrary draft text

Manual behaviors are supplemental and are not represented as observations of Things' native implementation.

## Reference and offline media

- Official source: 500 × 888, 30/1 fps, time base 1/30000
- Export: [0, 7.5) seconds, 225 frames, first PTS 0, last PTS 224000
- The retained measurement set also has the inclusive endpoint at 7.5 seconds, for 226 observations; that endpoint is not an extra exported frame
- Normal GIF/MP4: 500 × 888
- Comparison GIF/MP4, comparison poster/contact sheet, and comparison-only manifest: excluded from public distribution
- Normal preview: native 1× playback, no retiming, no audio
- GIF integer-centisecond delay quantization has 3.3334 ms maximum frame-boundary error and 0 ms total-duration error; it is recorded separately from ideal source duration

`preview/render-manifest.json` retains source SHA-256, source PTS, historical rendering code/assets, per-frame rasters, output hashes, and the original complete decoding results. Its `runtimeMaintenance` entry separately binds current interaction revisions through the equivalence evidence described below. The public test additionally decodes the retained normal files in the current environment and compares the PTS against `validation/frame_pts_0-7.5s.json`. The comparison-only manifest was removed along with the proprietary-pixel outputs it described. The retained source hashes document provenance; they are not a fresh verification of absent source bytes.

The reconstruction-only poster and keyframe sheet were inspected. Both normal media files were completely decoded before and after public-package preparation: 225 frames each, 500 × 888, 7.5 seconds, no audio. No native-device or browser-capture claim is made.

The original `FILES.sha256` passed for all 41 entries before edits in both the untouched source and staging copies. The public bundle has a regenerated inventory covering every remaining file except the inventory itself. No runtime, source measurement, normal-media byte, or export-manifest change was needed; only packaging, documentation, and the public verification boundary changed.

## Measurement limits

`validation/evidence.json` preserves methods and uncertainty. Measurements include the disk center/radius, discrete gap bounds, independently displaced list rows, scroll, editor rectangle and keyboard top. Some occluded row spans are inferred from shared layout displacement so content stays behind the keyboard. Appearance opacity cannot be uniquely separated from fill color and compression in video; it is a stated proxy.

Exact equality at retained knots confirms model wiring, not independent fidelity. The original font, text, glyphs, haptics, touch data, physics parameters and interruption behavior are not reproduced or measured by these tests.

## Corrections found during review

- Initial generic insertion-gap timing was replaced by the source's discrete slot changes and staggered row displacement
- The source plus is briefly cropped on lift and by the keyboard on its return; circle fits and scene layer ordering preserve that evidence
- The editor's internal checkbox/text now scale with the expanding white card instead of being clipped at their final size
- Navigation and keyboard-dismiss controls have separate appearance channels; they return/disappear before the editor shadow finishes collapsing
- Source PTS endpoints and final media hashes are tested after regeneration

## Not run

Real-browser interaction, browser accessibility-tree validation, hardware touch behavior and device performance were not run. The previously reported localhost security warning was not bypassed. This work's GIFs are offline Sharp/librsvg renders of the browser runtime's shared SVG scene.

## Local interaction maintenance (2026-10-07)

- IME confirmation no longer saves or cancels a draft while composition is active
- Held Enter cannot restart an opening transition or reopen an empty editor after saving; held Space/Escape do not repeat actions, while Arrow repetition still steps the timeline
- Escape cancels from either editor button and returns focus to the stage
- The reduced-motion status label updates in both directions even when the source phase stays the same
- Hidden-page and bfcache pauses now freeze manual opening, save and cancel transitions as well as the reference timeline; state sampling while hidden remains frozen
- Seven added regressions cover these event combinations and the hidden transition clock
- `npm test`: **62 passed, 0 failed, 0 skipped**, including complete decode checks of the retained GIF and MP4

No reference channel, scene, artwork, GIF or MP4 bytes changed, and the previews were not rerendered. `validation/runtime-maintenance.json` keeps the original rendering-core hashes alongside the current adapter/controller hashes, the preserved output hashes and all 225 pre-maintenance reference SVG hashes. The media test verifies the record binding, every current SVG at the original timestamp and the original output bytes. The old manifest `core` remains historical provenance rather than being relabelled as a new render.
