# Run and validation

Open `index.html` or serve this directory with a static web server. Click a category or leaf to take control; Tab and arrow keys move focus/selection, R replays, and Escape freezes the view. Reduced motion starts with a static expanded group and immediate manual changes.

Reuse `scene.js` for the SVG sidebar and `motion-data.js` for its motion. The marker recolors before translating; child groups fade and clip at fixed text scale while headers move and the sidebar recenters.

- Test: `node test.cjs`
- Render: `npm install && node render.cjs` (FFmpeg required)

The preview uses the shared SVG scene and an authored return-to-start tail. Model and simulated-DOM checks do not verify real-browser rendering or input behavior.
