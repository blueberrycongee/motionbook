# Run

Serve with `python3 -m http.server 4173`, then open `http://localhost:4173`. Search for Database, create a label, choose its color and toggle selection. Back/Escape resets. Keyboard-accessible HTML controls overlay the Canvas scene; reduced motion starts in manual mode. No external account or app is contacted.

Reuse `scene.js` for Canvas drawing and `app.js` for local label state.

- Test: `node --test tests/*.test.cjs`
- Render: `npm install`, then `node --expose-gc render.cjs` (FFmpeg required)
