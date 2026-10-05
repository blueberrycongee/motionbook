# Run and validation, revision 2

Run `npm start` and open `http://127.0.0.1:4173`. Hover/focus to illuminate, click to select, use Left/Right/Home/End to navigate, and R to replay. Reduced-motion preference uses immediate selected states.

Tests: `npm test`. Re-render: `npm install && npm run render` (FFmpeg required).

## Complete native-frame comparison

All 179 encoded frames from the original media were reviewed in chronological sheets. All 179 same-time regenerated SVGs were then inspected, including expanded crops of both growth/hold/collapse sequences. Source and rebuilt frames have identical 30 fps timestamps; no gallery preview or cadence conversion was used.

The independent all-frame geometry scan at 960 px width found:

- Underline width error: median 0 px, 95th percentile 0 px, maximum 0 px
- Underline center error: median 0 px, 95th percentile 0 px, maximum 0 px
- Ambient-region mean absolute RGB error per frame: median 0.607, 95th percentile 0.702, maximum 0.784, over the unobstructed region y=492–779

See [native frame measurements](validation/native-frame-audit.json). A thresholded underline match and limited-region color agreement are not a whole-image similarity score. Font/icon contours and minor reflection-edge differences remain visible in detailed comparison; no pixel-identity percentage is claimed.

## Passed checks

Five Node tests cover observed phases/native width samples, exact loop boundary, rapid target reversal, finite rendering, and controller wiring through DOM stubs (click, hover, arrow navigation, replay and reduced motion). Complete GIF and MP4 decoding passed.

The 180-frame MP4 is 960 × 864 / 30 fps / six seconds; GIF is a clean 20 fps infinite loop. Offline sharp/librsvg rendering calls the same scene generator and scalar controls as the browser. It is not a browser capture or reference-video playback.

## Runtime limits

Actual browser rendering, pointer hit-testing, focus and browser event dispatch remain unverified. Local Chromium and cloud-browser local URLs were already blocked in the task; restrictions were not bypassed. DOM stubs cannot establish a browser-runtime pass. Check browser rendering and SVG behavior before production use.
