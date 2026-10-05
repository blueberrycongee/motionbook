# Run and validation

Open `index.html` in a browser. Click the pill, close with ×, or press Escape. R replays the loop.

Tests: `node test.cjs`. Rebuild previews: install `sharp`, then run `node render.cjs`.

## Tests run

- `node test.cjs`: PASS. Exact loop seam; idle/open/closed phase assertions; 400 SVG samples checked for finite data; SVG content assertions; simulated-DOM click/open/close; interrupted Escape; replay; reduced-motion behavior.
- `node render.cjs`: PASS. 183 frames at 30 fps; 1080 × 608 MP4 and looping 864 × 486 GIF at 20 fps. Stills include idle, expansion, full card and collapse.
- The renderer uses the same `scene.js` function as the demo. These are offline SVG rasterizations through sharp/librsvg, not browser recordings.

## Actual browser runtime

Not run. Local Chromium launch and local-site browser access were denied in this session, so they were not retried or bypassed. The public cloud browser cannot load these unpublished workspace files. Simulated DOM tests do not establish real-browser layout, keyboard behavior, or performance. Open the standalone `index.html` to verify in a real browser.

## Visual self-review

Reference full frame at 3.0 seconds and source contact/timing sheets were compared with replica `preview/open.png`, `preview/expanding.png`, `preview/collapsing.png`, and loop media.

- Pill and full-card bounds, center, dark/light contrast, top-left title, close button, airport hierarchy, dashed route arc, status and landing-time placement match the observed composition.
- Expansion uses a critically damped response fitted to the observed 30 fps width progression, delayed content blur/fade, and reverse collapse. Plane progression is independent of panel growth.
- Exact first/final scene equality gives a clean loop seam.
- Remaining differences: system font metrics differ slightly; airplane is a newly drawn silhouette; the original cursor and compression noise are omitted; no claim of pixel identity or real-browser runtime pass.

Self-review result: passed for the independent motion-study package, with the differences above explicitly retained. This is not a source-code reconstruction or endorsement by the source creator.
