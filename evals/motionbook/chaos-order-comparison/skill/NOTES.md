# IN PHASE / 同相

A 21-second motion study of the theme "from chaos to order".

## Concept

Chaos here is not a lack of order. It is order that has not yet fallen into phase. The film is a field of 1,740 oscillators drawn as ink needles, based on the Kuramoto model of synchrony (fireflies, metronomes, heart cells). Each needle starts with its own speed and position. Order spreads like crystal growth and merges into one rhythm. It ends as a single line and one sentence: 混乱，只是尚未同相的秩序 / CHAOS IS ONLY ORDER, NOT YET IN PHASE.

The bottom-left readout shows the real order parameter r = |mean(e^{2iθ})|, computed every frame from the needle angles. It is a measurement, not decoration. It stays near 0.01 while the three ring-wave domains cancel each other out, then rises to 1.00 as they merge.

| t (s) | Stage | What happens |
|---|---|---|
| 0–3.4 | 01 NOISE | Needles drift on a curl-noise current. Each spins at its own wandering frequency, with varied length, weight and ink density. The camera eases out slightly. |
| 3.4–9.8 | 02 NUCLEATION | Three seeds appear as a vermilion point and ring. A rough front (`t ∝ d^(1/1.6)` plus fbm noise) captures needles. Each captured needle flashes vermilion, springs into its lattice slot with overshoot, and joins its domain's outward ring wave. Domain walls form where the fronts meet. |
| 9.8–12.6 | 03 ENTRAINMENT | The domains give up their own phases and wave numbers, and the field becomes one rotation. |
| 12.6–14.6 | 04 UNISON | All needles turn together, then wind up (cubic acceleration) and become motion-blur fans. |
| 14.6 | 05 ONE (the beat) | All needles snap to vertical with an underdamped overshoot. The plate inverts to black in an exponential pressure wave from the centre, with a vermilion leading edge. |
| 15.4–18.5 | | Columns slide inward, inner ones first, and lengthen into solid bars like a compressing barcode. They become one line. The line shortens, then springs from vertical to horizontal and becomes a rule. |
| 18.2–21 | | The sentence is set character by character (0.05 s stagger, 0.7 s ease-out), followed by the English line. Final hold. |

## Design decisions

- **Material:** printed paper (#ECE7DD), carbon ink, and one vermilion accent. Vermilion appears only at moments of capture, at the seeds, on the wipe edge and when the meter reaches full. The finished MP4 has static soft-light paper grain and a light plate vignette. Corner registration marks frame the lattice like a print plate.
- **Motion quality:** a 180° shutter. Each needle is sub-sampled across the last 1/60 s, so fast spinners render as soft fans and locked needles stay crisp. Velocity is driven by the shutter rather than a blur filter. Snaps use underdamped springs (lattice ≈1.6 Hz, ζ 0.42; beat ω 22, λ 7; final turn ω 10, λ 6). Transitions use overlapping smoothstep windows that hand off from one stage to the next.
- **Composition:** a 58×30 lattice at a 20 px pitch, with a quiet 64 px margin. The HUD sits in the four corners, and needles fade out before they reach it. The ending is reduced to one 260 px rule above a centred bilingual line.

### Techniques borrowed from Motionbook (techniques only, no subject matter or code)

- `kitasenju-tumbling-clock`: a deterministic fixed-step simulation (seeded RNG, no `Math.random` or wall-clock time), with pre-roll before t = 0 so the first frame is already in motion.
- `mac-studio-hero-transition`: a single time-to-state function built from overlapping smoothstep stages. Staggered reveals are mapped onto the timeline (ease-out plus a small fixed stagger) so any t can be rendered on its own.
- `elastic-string-clock`: tuned, damped springs that give lines tension, overshoot and a tactile settle.
- `telegram-media-spoiler`: reveals that spread from their point of origin. The seeds and the beat wipe both expand from where the change begins.

## Reproduce

```sh
node render.js                       # renders frames/, frames-gif/, then video.mp4 + video.gif
node render.js --stills 0,7.8,14.6   # optional: single stills into stills/
```

Requirements: Node 22 with `playwright` (Chromium), ffmpeg and Python 3 with Pillow. The script uses paths relative to its own location. A full render takes about 3–4 minutes.

## Files

- `scene.js`: simulation and Canvas2D renderer. `Scene.renderFrame(t)` is a pure function of t.
- `index.html`: page that hosts the scene. Open it with `?t=7.8` to inspect a single moment.
- `render.js`: headless Chromium frame capture, then ffmpeg encoding to H.264 (CRF 16, yuv420p) and GIF.
- `gif_palette.py`: builds a fixed 40-colour palette from the film's own colour ramps, so the rare vermilion survives quantisation. The GIF pass renders flat paper (no grain or vignette) at 15 fps to avoid banding and save bytes.
- `qa/`: keyframes extracted from the final MP4 for review.
