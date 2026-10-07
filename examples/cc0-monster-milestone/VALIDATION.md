# Validation

## Verified

- 44 automated checks pass (`validation/test-results.json`): the original 35 renderer/controller checks plus 9 simulated-DOM app-adapter checks
- All eight supplied artwork files match their recorded SHA-256 hashes, and their embedded runtime bytes are identical to the original bundled PNGs
- The bundled creator license identifies Kenney, Monster Builder Pack and CC0
- 150 source-time SVG renders are deterministic; 750 subframe samples have finite geometry
- Replay interruption, stale RAF cancellation, pause, seek, speed, completion, destruction and reduced-motion behavior pass injected-clock controller tests
- Stage images use local embedded parts, with no remote image fetches
- Runtime inspected to exclude the previous branded bird rig, wing/flame geometry and brand-facing names
- Key poses visually reviewed: arrival, squash, spin, starburst, lifted hands, landing, settled expression
- GIF fully decoded and total duration verified as 7,500 ms; exact encoded frame count is in `validation/media-validation.json`

## Limits

Preview is a shared-SVG Sharp/librsvg rasterization, not a browser screenshot. The actual app entry and controller now have simulated-DOM event coverage, but real browser layout, native keyboard/focus behavior, accessibility-tree behavior and real DOM event dispatch remain unrun.

This revision intentionally changes the design and anatomy. Its phase timing is inspired by the earlier reference, but no pixel-fidelity score or exact product equivalence is claimed. The selected art's CC0 provenance was checked; that is not a blanket legal warranty.

No remote push, PR, deployment, purchase, login or account action was performed.

## Local interaction maintenance (2026-10-07)

- Timeline input snapshots the requested time before `pause()` synchronously updates the controls, so scrubbing no longer gets overwritten by the old playback position
- `pagehide` pauses through the UI-notifying path; even without a preceding visibility event, the restored page shows Play and remains paused until explicitly resumed
- Nine adapter checks execute the actual `app.js` with the real controller and renderer. They cover playback/end/repeated replay, timeline input, speed, initial and dynamic reduced motion, its explicit checkbox, hidden-page pause and the bfcache UI boundary
- `npm test`: **44 passed, 0 failed**; no renderer, animation timing, character asset or GIF bytes changed

The adapter harness replaces only import declarations with the same imported modules and injects a simulated document, events and clock. It does not model browser layout, native control keyboard behavior, touch hardware or GPU rendering.
