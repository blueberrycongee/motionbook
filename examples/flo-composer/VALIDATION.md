# Run and validation

Open `artifacts/flo-composer.html`, or run `npm start` and visit `http://127.0.0.1:4321/` (Node 20.11+).

Reuse `src/model.mjs` for composer state and `src/scene.mjs` for text sweeps, staggered icon hops, project-row transitions, approval waves and badges. No backend, external app connection or permission change is implemented.

- Test: `npm test`
- Rebuild: `npm install && npm run render && npm run build` (FFmpeg required)

Previews are offline SVG renders. Browser/mobile behavior and accessibility remain unverified; fonts, icons and easing are approximations.
