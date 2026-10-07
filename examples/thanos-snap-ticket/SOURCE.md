# Reference and motion

Reference by [Rehan Ahmed / @rehanxahmed](https://x.com/rehanxahmed/status/2103826960686436759). [Inspora](https://www.inspora.design/posts/thanos-snap-ticket) · [Original footage](https://media.inspora.design/posts/9716faa0-fc4d-4e03-9111-508ca55c3446.mp4).

A complete phone/journey screen moves closer as the route summary dissolves left to right into drifting particles and reforms as a QR-style ticket. The camera retreats during the reverse transition; a second show/hide cycle plays at the settled distance.

## Timing

- 0.000–0.900 s: summary at the smaller scale.
- About 0.917–1.667 s: camera moves closer.
- 1.667–3.125 s: first summary-to-ticket transition.
- About 4.208–5.042 s: camera retreats.
- 4.625–5.917 s: first ticket-to-summary return.
- 7.375–8.792 s: second reveal.
- 9.625–10.917 s: second return, then a stable summary.

The loop adds a short final hold after the reference sequence.

## Source entry points

- `train-scene.js`: independently drawn SVG train and landscape.
- `artwork.cjs`: route and decorative, non-operational QR pattern.
- `build-particles.cjs`: seeded particles sampled only from authored assets.
- `camera-data.js`: measured scalar camera timing, scale and translation.

No original video, pixels, code or audio are included. See [rights](RIGHTS.md).
