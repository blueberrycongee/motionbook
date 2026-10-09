# Superposed — 从混乱到秩序

A 21-second generative motion piece. Everything is drawn on one Canvas 2D context, as a pure function of time.

## Concept

**Chaos is only order, superposed.**

The tangled, glowing knot at the start is not noise. It is the sum of 91 perfectly regular rotating circles (a Fourier series, z(s) = Σ aₖ e^{i(ks+φₖ)}), all stacked on top of each other. The film never removes anything. It **separates** the circles: each harmonic peels off, highest frequency first, and flies out to its own slot in a 13 × 7 grid. As the circles leave, the knot simplifies (loops, then a limaçon, then one pure circle), and the circle contracts into the centre cell. The grid is a field of 91 clocks, and harmonic k turns k times as fast as the fundamental. Their shared clock slows, crosses zero, and every hand lands pointing straight up together, settling with a small damped overshoot. Then the title appears.

## Structure

| time | act | what happens |
|---|---|---|
| 0.0–0.8 | ignition | black, a warm flash, and the knot bursts out with a back-ease overshoot |
| 0.8–5.6 | I · CHAOS | long-exposure knot: 3 chromatic passes × up to 14 time-smeared trails, bloom, camera shake. Registration "+" marks and crop marks fade in, hinting at a hidden structure |
| 5.6–13.7 | II · SEPARATION | harmonics peel at log-spaced times: about 40 in the first second, then slower and slower until the last few land like single beats. Each one curls out along a bezier (all in the same direction, so the burst reads as a vortex) and lands with a pulse |
| 12.3–14.6 | the fundamental | the chaos renderer crossfades to one clean glowing circle. A radius hand grows in, then the circle contracts into the centre cell |
| 14.6–17.6 | III · ORDER | 91 clocks sorted by distance from the centre, so frequency rises outward and the hands form radial ripples. The shared clock decelerates into alignment |
| 17.6 | the moment | every hand points up. A ring wave runs outward from the centre and HUD reads ALIGNED 91 |
| 18.05–21 | title | grid dims, 从混乱到秩序 rises in per character, then a vermilion rule and the subtitle. Fade to black so the GIF loops |

## Design decisions

- **One idea, and the maths carries it.** The chaos and the order are the same 91 objects. The counter (SUPERPOSED 91 → 00) and the formula in the corner make that explicit without explaining it.
- **Material changes as entropy drops.** Chaos is additive light with RGB temporal split, motion smear, bloom, warm background heat, and shake. Order is thin, matte, 1px lines on cool near-black. Chromatic split, smear, writhing speed, shake, and warmth all fall continuously with the separation, so you never see a hard style switch.
- **Rhythm.** Peel times are spaced on a log scale over frequency, so separation starts as a burst and slows into a countdown. The final alignment uses a velocity-matched deceleration plus a damped spring, so it reads as a "tick home" rather than a fade to stillness.
- **Continuity.** Each hand blends from its phase inside the curve to its grid phase, with a whole-turn offset fixed per harmonic so it never spins wildly. The writhing clock is integrated (not scaled), so slowing it never jumps the shape. The curve's scale is renormalised by the remaining energy, so the knot keeps a stable size while it simplifies.
- **Palette.** Ink #ECE8E0, one accent vermilion #FF5630 (hand trails, phase dot, alignment wave, title rule), near-black ground, film grain (overlay, static tile with a per-frame seeded offset), and a vignette.
- **Type.** Inter for the HUD, with fixed-advance digits so counters never jitter. Noto Sans CJK SC for the title, with a manual per-glyph layout so it centres exactly.

## Files

- `index.html`: canvas host
- `scene.js`: the whole piece. `renderFrame(t, frameIndex)` is deterministic, with a seeded PRNG and no wall-clock time
- `render.js`: Playwright/Chromium renders every frame (4 pages in parallel, `toDataURL` PNG), then ffmpeg encodes the MP4 and a palette GIF
- `qa/`: keyframes extracted from the final `video.mp4` for review

## Reproduce

```sh
node render.js                      # frames/ -> video.mp4 + video.gif (~35 s)
node render.js --frames 0,150,525   # preview selected frames into preview/
```

Requirements: Node 22 with `playwright` (Chromium), ffmpeg, and the system fonts Inter and Noto Sans CJK SC.

Output: `video.mp4` is 1280×720, 30 fps, H.264 yuv420p, 21.0 s, 630 frames. `video.gif` is 640×360, 15 fps, 21.0 s.
