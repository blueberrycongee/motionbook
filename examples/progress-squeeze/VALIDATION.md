# Validation

## Passed

- `npm test`: six Node tests passed. These cover both measured pause plateaus, bounded progress, repeated pause/resume, reset, negative time deltas, exact loop boundary, 792 finite SVG states, DOM-stub click and keyboard wiring, and reduced-motion freeze.
- `node src/render.mjs`: 198 original SVG frames rasterized at 956 × 716 and 30 fps. MP4 is 6.6 seconds; GIF is a clean infinite loop at 20 fps. FFmpeg decoded both outputs successfully.
- The browser and offline renderer call the same `scene()` and `demoState()` functions. The preview is an offline sharp/librsvg render, never a browser capture or replay of the source footage.
- Source-versus-replica keyframes were reviewed at 0.70, 1.025, 1.30, 2.05, 4.00 and 5.40 seconds. Layout, stable orange/blue values, 31% and 81% holds, endpoint fold, and pause/resume icon states agree with the observed composition. The source pointer is omitted intentionally.

## Limits and remaining differences

Actual browser playback was not run in this environment. Local Chromium launch and the cloud browser local-URL route were already reported blocked; those restrictions were not bypassed. DOM stubs test state wiring only, not browser rendering, event dispatch, focus, or pointer hit-testing. Rendering and interaction should be checked in a real browser before production use.

The spring is visually fitted, not recovered from original code. Transient fold width, recoil shape and icon crossfade are approximations; typography uses installed sans-serif rather than the unidentified original font. The percentage width and baseline were adjusted against real footage. Reduced-motion users see a static frame and can change the pause state without continuous animation. Fontconfig emitted nonfatal cache-directory warnings; all images and media completed correctly.

## Run and controls

Run `npm start`, then open `http://127.0.0.1:4173`. Click the icon or press Space to pause/resume; R replays. Run tests with `npm test`. Regenerate previews with `npm install && npm run render` (FFmpeg required).
