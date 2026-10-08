# Tidy — product motion film (pure code)

21.8 s, 1280x720, 30 fps. Everything (UI, copy, icons, particles) is HTML/CSS/inline SVG drawn in code; no external assets.

## Reproduce
    ./build.sh   # from this directory; needs Node, Playwright Chromium, ffmpeg
`build.sh` runs `node render.js` (Playwright/Chromium, 4 parallel pages, one PNG per frame into `frames/`), then ffmpeg encodes
`video.mp4` (H.264, yuv420p, crf 14) and `video.gif` (640 px, 15 fps, palettegen/paletteuse).
Quick stills: `node render.js --times 3.5,10.2` writes `preview/t_*.png`.

## Files
- `index.html`, `style.css`, `scene.js` — the film. `window.render(t)` is a pure function of time: no CSS transitions/animations,
  no timers, no randomness other than a seeded hash. Same t, same pixels.
- `render.js` — frame driver; `build.sh` — one-shot pipeline.

## Design
- Story: one phone, one continuous task list, four beats — Capture (0.5-5.4 s), Organize (5.4-9.3), Finish (9.3-13.6), Sync (13.6-18.7) — then a logo reveal (18.7-21.8).
- Spatial continuity: the same phone and the same list persist across beats. The task typed in the composer becomes the first row of that list,
  the row that gets tags is the one that gets completed, and the phone then glides left and shrinks to make room for a laptop window that shows the same list.
  The outro circle expands from the phone's sync badge, so the last green check becomes the Tidy app icon.
- Easing: custom cubic-beziers (expo-like out for entrances, in-out for camera moves, soft overshoot for inserted rows) plus a damped spring
  (~12 % overshoot) for pops: FAB, chips, tag pills, checkbox fill, ring pulse. Exits use ease-in and are faster than entrances.
- Rhythm: headline lines are masked and stagger 100 ms; sub-copy follows 300 ms later; taps are anticipated (finger scales to 70 % over 90 ms, ripple on release);
  the UI reacts on the next frame after contact. Overlaps are intentional, e.g. the row inserts while the sheet is still dropping.
- Feedback details: list layout is solved per frame, so rows push each other with real height animation; tag chips fill and bounce, then fly into the row as pills
  that expand the meta line; completion = checkbox spring fill, path-drawn check, ring + confetti burst, strike-through wipe, row slide-out and height collapse,
  progress ring arc eases while its digits roll like an odometer, ring pulses, toast springs in. Sync = spinner on both badges, a glowing packet hopping across the gap
  between devices with ripples at both ends, and the receiving row arriving with a glow.
- Camera: subtle push-in (3.5 %) while the composer is open, a small 3D tilt on the phone entrance, slow background blob drift whose palette changes per beat.
- Type: Inter, 700 tight-tracked headlines with one accent word per beat (accent colour matches the beat's tag colour).
