# Run and validation

Serve this directory with `python3 -m http.server 4173` and open `http://localhost:4173`. Approve or skip steps, undo decisions, approve all, run the local simulation, or start a new plan. Escape resets an interrupted run. Reduced motion starts in manual mode; `window.demo.replay()` restarts the demonstration.

Reuse `app.js` for local plan state and `scene.js` for rendering. No external search, document creation or email service is called.

- Test: `node --test tests/*.test.cjs`
- Render: `npm install && npm run render` (FFmpeg required)

The preview shares the app's scene and adds an authored hold/fade for looping. State and simulated-DOM checks do not verify real-browser rendering or performance.
