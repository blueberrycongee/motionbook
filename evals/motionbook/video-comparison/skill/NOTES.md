# Tidy — product film (20 s, code-only)

Fictional task app "Tidy". Everything on screen (phone, desktop window, icons, copy, loader, logo) is HTML/CSS/inline SVG
drawn by `src/scene.js`; no external images, video or fonts files (system Inter is used).

## Reproduce

    ./render.sh            # or: node render.mjs      (~8-10 min on 4 cores)

Outputs `video.mp4` (1280x720, 30 fps, H.264 yuv420p, 20.0 s) and `video.gif` (640 px, 15 fps).
Env knobs: `DSF=2` (device scale, supersampled down to 1280x720), `SUB=4` / `SHUTTER=.5` (motion-blur sub-frames and
shutter fraction), `WORKERS=4`, `KEEP=1` (keep PNG frames in `build/frames`).
`node dev.mjs 4.3 10.2` writes single stills to `build/dev/` for quick checks; `montage.py` makes contact sheets.
Needs Node 22 + playwright (resolvable from this directory), Chromium, ffmpeg.

## How it is deterministic
`src/index.html` loads `anim.js` (easing: cubic-bezier + analytic damped spring) and `scene.js`, which exposes one pure
function `render(t)`. It builds the DOM once and, for a given time, sets every transform / opacity / blur / SVG dash.
No CSS transitions, rAF, timers or accumulated state. `render.mjs` calls `render(t)` for each sub-frame time,
screenshots it, and ffmpeg averages sub-frames (`tmix`) for true motion blur on fast moves (the composer flight, row exits).

## Storyboard (one phone, continuous camera)
| time | beat | what moves |
|---|---|---|
| 0-1.5 | intro | phone rises, blur-in header and rows (staggered) |
| 1.1-4.7 | **Capture** | "+" FAB grows a composer card around itself and becomes the send button; typing with natural cadence; "Friday" is recognised (highlight + date chip morph); send: the row flies from the composer to the list top with squash + slight overshoot while the list opens a slot (rows below follow with a small lag); header counter rolls 3 -> 4 |
| 4.4-8.9 | **Organise** | camera pushes in 1.5x; "+ Tag" chip morphs into a picker (rect + radius spring), options blur-in in sequence; selecting pops pills into the row, chip shrinks to "+", picker folds back to that chip |
| 9.5-14 | **Finish** | camera eases out to 1.25x; check fill with overshoot, stroke-drawn tick, ring pulse + confetti dots, strike-through wipe, row exits with tilt + slide, list closes with ripple; next taps come faster (accelerating rhythm); counter rolls and ring fills, pill turns green; "All clear" state resolves with staggered blur-in text |
| 14.0-17 | **Sync** | camera pulls back to reveal a desktop window sliding in; Dynamic-Island style status pill expands with a dot-matrix loader; four packets arc from the pill to each desktop row and tick it off; loaders resolve into a check ("Synced") |
| 17-20 | **Brand** | iris opens from the phone's "All clear" check to the brand colour; logo tile springs in and draws its check; "Tidy" letters blur-in one by one; tagline; slow end-card drift so the hold never freezes |

Transitions are spatial rather than cuts: the same phone persists, the camera (zoom + pinned focus point, eased in log-zoom
space) travels between scenes, captions blur out/in on their own stagger, and the background tint shifts per chapter.
A finger-touch indicator (grey disc with press scale) makes each tap legible; caption + chapter bars give structure.

## Motionbook references used (read, studied, re-implemented — no code or assets copied)
- `examples/task-card-gesture-stack`: staggered blur-to-sharp text reveals, exit tilt + slide, completion text lines revealing in order.
- `examples/nested-tag-creation` + `examples/morphing-braille-loader`: chip -> picker shape morph, dot-matrix wave loader resolving into a check, "Creating -> Created" status idea.
- `examples/chatgpt-dot-send`: composer content travels to its destination with compression and small overshoot; list yields with a lag.
- Camera pushes / continuity: `examples/apple-music-player` (shared-object expansion) as the general principle.
Motionbook's own previews are measured/authored studies, not certified for production; this film is an offline render only,
with fictional data and UI.

## Tuning knobs
All timings live in `T`, `COMP`, `CAM`, `CAPS` at the top of `src/scene.js`.
