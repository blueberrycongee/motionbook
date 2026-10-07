# Run and validation

Open `index.html`, or serve with `python3 -m http.server 8000`. Sign replays; Back to Docs reverses. Cancel/Escape resets an interrupted sequence; R replays the full timeline. Reduced motion uses immediate states. No document is submitted or signed.

Reuse `scene.js` for the signature wipe and layered confirmation transition, and `app.js` for local controls.

- Test: `node test.cjs`
- Render: `npm install && node render.cjs` (FFmpeg required)

Tests cover timed states, loop equality, finite geometry and simulated-DOM controls. Offline previews share the page's scene; browser rendering and input remain unverified, and system-font, bevel and softness details may differ from the reference.
