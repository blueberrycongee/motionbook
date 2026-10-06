# Reference and reconstruction

- Creator: Rehan Ahmed, @rehanxahmed
- [Original post](https://x.com/rehanxahmed/status/2103826960686436759)
- [Inspora page](https://www.inspora.design/posts/thanos-snap-ticket)
- [Original footage](https://media.inspora.design/posts/9716faa0-fc4d-4e03-9111-508ca55c3446.mp4)
- Observed 5 October 2026. Original video stream: 2000 × 2000, 24fps, 271 frames, 11.291667 seconds; last native presentation time 11.250000 seconds.

The reference presents a complete phone and railway journey screen. The camera moves closer for the first ticket reveal and pulls back during the first reverse transition. The route summary disintegrates left to right into a drifting point field; a QR-style ticket forms through the same area. A second show/hide cycle occurs at the settled camera distance.

## Observed intervals

- 0.000–0.900s: summary at the smaller presentation scale.
- About 0.917–1.667s: camera moves closer.
- 1.667–3.125s: first summary-to-ticket dissolve and reformation.
- About 4.208–5.042s: camera pulls back.
- 4.625–5.917s: first ticket-to-summary return.
- 7.375–8.792s: second ticket reveal.
- 9.625–10.917s: second return, followed by a stable summary.

## Independently authored assets

`train-scene.js` draws the train, carriage details, mountain, hills, branches, blossoms and track as SVG geometry. The phone frame, interface and icons are authored vectors. `artwork.cjs` builds the route and dummy QR-style UI; `build-particles.cjs` samples only these authored assets to create a seeded particle field. The QR-like pattern is decorative and is not an operational ticket.

`camera-data.js` contains scalar presentation timestamps and camera scale/translation measured from the original device and island boundaries. It contains no reference pixels. No source video, screenshots, original illustration, original code or audio are part of this payload.

The complete original sequence is preserved. The clean 60fps rendition interpolates camera values and the independent particle model, ending with a short unchanged hold at 11.333333 seconds for a seamless loop. This does not imply that the source was recorded at 60fps.
