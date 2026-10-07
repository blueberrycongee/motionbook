# Run and validation

Open `index.html`, or serve with `python3 -m http.server 8000`. Click +/× to toggle; repeated clicks reverse the transition. Escape closes and restores focus; R replays. Tool cells acknowledge selection without editing or transmitting files. Reduced motion uses immediate states.

Reuse `scene.js` for the expanding surface and lens displacement, and `motion-data.js` for replay tracks.

- Test: `node test.cjs`
- Render: `npm install && node render.cjs` (FFmpeg required)

Tests cover timing, loop equality, reversal, focus restoration and simulated-DOM controls. Offline previews share the app's SVG scene; real-browser behavior remains unverified, and fonts, icons and optical material are approximations.
