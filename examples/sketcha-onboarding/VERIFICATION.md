# Run and motion

Open `standalone.html` directly; it embeds fonts and code. For the modular `index.html`, run `npm run serve` and open `http://localhost:4173`.

Tap the cat to reveal the menu. The scene uses `src/scene.mjs` and `src/motion.mjs`; the menu stays stationary under the cyan peel. The shoulder turn morphs a connected head–neck–torso contour, scratch groups have separate strokes, and the falling cat has a faint motion echo.

## Sequence timing

Times follow tap/release, with approximately 2–4 frames of measurement uncertainty.

| Phase | Seconds |
|---|---:|
| Hint and arrow fade | 0.06–0.20 |
| Back-facing pause | 0.20–0.60 |
| Shoulder glance | 0.60–1.60 |
| Turn away | 1.63–1.90 |
| Squat | 1.93–2.06 |
| Upward hop and back-to-front turn | 2.06–2.33 |
| Four-paw contact | 2.33–2.53 |
| Scratch/slide | 2.53–3.00 |
| Brief hold | 3.00–3.43 |
| Fall and cyan V-peel | 3.45–3.81 |
| Terminal menu | 3.81 |

Easing is independently fitted.

## Development

- `npm install`: install the offline Canvas dependency.
- `npm test`: tap gating, repeated taps, reset, reduced motion, phase continuity, bounded poses, layering and connected-turn geometry.
- `npm run build`: rebuild the standalone page.
- `npm run render`: regenerate previews; requires FFmpeg.

Previews are offline Canvas renders. Browser pointer/focus behavior, viewport handling, fonts and tab visibility remain untested. Layout and palette are estimates from a filmed handset; the physical device, OS chrome and surrounding scene are omitted. See [sources and fonts](SOURCES.md).
