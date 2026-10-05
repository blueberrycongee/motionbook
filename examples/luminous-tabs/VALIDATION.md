# Run and validation

Run `npm start` and open `http://127.0.0.1:4173`. Hover/focus a tab to illuminate it, click to select, use Left/Right/Home/End to navigate, and R to replay the reference sequence. Reduced-motion users get immediate selected states without animation.

Tests: `npm test`. Preview regeneration: `npm install && npm run render` (FFmpeg required).

## Passed

- Five Node tests cover measured phases, centered underline widths, exact neutral loop endpoints, rapid reversal/convergence, finite SVG frames, and controller wiring through a DOM stub (click, hover, arrows, replay, reduced motion).
- `node src/render.mjs` generated 180 original SVG frames at 960 × 864 / 30 fps, a complete six-second MP4, and a clean infinite-loop GIF at 20 fps. Both files decoded without FFmpeg errors.
- Browser demo and offline renderer share the exact scene generator and sampled timing model. Preview is sharp/librsvg offline rasterization, not a browser capture or a crop of the reference.
- Actual reference keyframes at 0, 0.6, 1.3, 2.3, 3.5, and 4.2 seconds were compared against rendered frames. Both pill rectangles, text alignment, the centered underline widths and neutral/illuminated states match the observed structure. Review led to a wider highlight, smoother ambient-light mask, and adjusted Attachments spacing.

## Limits

Browser runtime is unverified. The task's local Chromium and cloud-browser local-URL routes were already blocked, and were not bypassed. DOM stubs do not verify actual pointer hit-testing, focus rendering, browser events, or browser SVG filters. A real-browser check remains necessary before production use.

Typography, original icon contours and continuous light falloff differ slightly; no pixel-identity claim is made. Gradients are a compact approximation of the source's soft glow. The animation uses measured width samples, with linear interpolation between 0.1-second observations. Authored live interactions use a smooth exponential response rather than pretending the source event logic was recovered. Fontconfig cache warnings were nonfatal.
