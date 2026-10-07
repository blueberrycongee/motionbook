# Run and motion

Run `npm start` and open `http://localhost:4173`. Drag/release a card, use arrows to nudge, Enter to toss, Home to reset, Continue to trigger the warp, or R to replay.

- Test: `npm install && npm test`
- Render: `npm run render` (Node, @napi-rs/canvas and FFmpeg)

## Motion parameters

- Canvas 2D field: Park–Miller seed 42; clamp(round(width×height/190), 1000, 11000) stars
- Five colors, radial glows, depth travel and phase-offset twinkle
- Pointer parallax and a 190 px repulsion zone, stronger on press
- Four 13-second ease-in-out floats, phased at 0 / 4 / 8 / 6 seconds
- Release spring: stiffness 6.76, damping 3.432, velocity cap 1200 px/s
- Warp acceleration: 1.5 seconds; card exit: 1.1 seconds, cubic-bezier(.55,.02,.95,.7)
- Central copy fades/blurs/shrinks over 0.4 seconds; scene exit begins at 1.65 seconds and lasts 0.7 seconds
- Samples hide at width ≤540 px or height ≤460 px

[Motion contract](evidence/motion-contract.json) · [Verification](VERIFICATION.json)

Based on static inspection of ChatGPT macOS 26.930.61225 (13232), with independent procedural artwork. Tests and offline Canvas renders do not verify browser layout, accessibility or native playback. Collaborator choreography, label following and whole-scene easing are simplified; adaptive detail downgrade and pausing floats during drag are not implemented. See [LICENSE.md](LICENSE.md).
