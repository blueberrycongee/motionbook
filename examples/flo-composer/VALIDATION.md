# Run and validation

Open `artifacts/flo-composer.html` directly, or run `npm start` and visit `http://127.0.0.1:4321/`.

- Node.js 20.11+; `npm test` runs the state-model tests.
- `npm install && npm run render && npm run build` regenerates media and the standalone demo. Rendering requires ffmpeg.
- Preview: 201 offline SVG frames at 30 fps, 6.7 seconds. GIF and MP4 use the same scene/state model as the HTML. They are not browser or native application recordings.
- Approved v1.2 behavior retained: two text sweeps, two staggered app-icon hops, project-row transition, approval hand waves and badge transition.
- Browser runtime, mobile interaction and accessibility have not been verified in this environment.
- Font, icon and easing matches are approximations. Measurements and test assertions cover the specified trajectories, not whole-frame pixel equality.
- No chat backend, external app connection or permission change is implemented.
