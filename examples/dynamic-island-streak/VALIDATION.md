# Run and validation

Run `npm start` and open `http://127.0.0.1:4173`. Click the capsule to expand/collapse; Add increments up to 99, Replay repeats the celebration, and Switch changes its variant. R/Escape restarts. Reduced motion disables autoplay and selects immediate states.

Reuse `src/controls.mjs` for interaction and `src/scene.mjs`/`src/art.mjs` for the capsule, rolling digits and celebrations. The first weekday fades while later days slide; flame-center motion is independent of its outline. Counter blur sits outside the scaled glyph transform, with an active clip at y258.45. The preview adds a pointer-return fade at 13.4–13.75 seconds.

- Test: `npm test`
- Render: `npm install && npm run render` (FFmpeg required)

Model and simulated-DOM tests cover continuity, count bounds, reset, reduced motion and control wiring. Offline previews do not verify browser rendering, focus, hit testing or mobile behavior; live interactions beyond the recorded sequence are authored choices.
