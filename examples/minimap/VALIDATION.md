# Validation and reproduction

## Interactive source

`npm start` serves `http://localhost:8037`. Move the pointer over the tick field. Arrow keys move a keyboard pointer; Escape leaves the field. **Try it** returns to live hover, **Replay reference motion** plays the measured native trace, **Reset** clears live deformation, and the timeline scrubs exact native times.

The 49 tick x positions stay fixed at 18 px spacing. Five accent ticks remain dark. The red playhead never advances. No click-to-play, drag, audio playback, or horizontal magnification is presented as source behavior.

The live spring model and native replay share the independently drawn SVG scene. The replay is a measured trace. The live model is an independent approximation, not a claim about the author's undisclosed source code.

## Reproduce clean media

After `npm install`:

```sh
node scripts/render.cjs all preview/frames
python scripts/concat.py preview/frames preview/native.ffconcat
ffmpeg -f concat -safe 0 -i preview/native.ffconcat -fps_mode vfr -c:v libx264 -crf 18 -pix_fmt yuv420p -video_track_timescale 60000 preview/full.mp4
node scripts/loop.cjs preview/frames preview/loop-work
ffmpeg -f concat -safe 0 -i preview/loop-work/loop.ffconcat -vf 'fps=30,scale=1006:-1:flags=lanczos,split[s0][s1];[s0]palettegen=max_colors=128:stats_mode=diff[p];[s1][p]paletteuse=dither=sierra2_4a' -loop 0 preview/loop.gif
python scripts/verify-media.py .1
```

The MP4 preserves every one of the source's 480 decoded frames at its exact native timestamp over 8.366667 seconds. The source contains 22 double-duration gaps; rendering at a guessed constant frame rate would shorten it and is not used. The verifier checks every MP4 PTS against the original native manifest.

The GIF is a 30 fps viewing preview, 1006 × 515, 254 frames and 8.46 seconds after centisecond quantization. It adds an explicitly authored 0.1-second settling bridge after the complete original span. The first and last decoded GIF frames match exactly. The full MP4 contains no added bridge.

## Evidence and tests

`npm test` checks the live spring model, pointer exit/reentry, keyboard/reset/replay wiring in a mock DOM, all 480 native times, 22 VFR gaps, finite geometry, and 49 fixed-position vector ticks in every frame. Mock-DOM tests are not browser execution.

The clean media fully decode. Numeric comparison diagnostics and a row for each original frame are under `evidence/`. Reference-containing full-canvas paired sheets stay outside the deliverable. No original pixels, source footage, extracted cursor assets or screenshots are embedded in the demo or previews.

The renderer uses sharp/librsvg and is explicitly an offline rasterizer. Browser execution remains unverified: the shared environment's Chromium startup prerequisite failed with `socket() failed: Operation not permitted`. This demo has not been run successfully in a browser. The optional `npm run test:browser` can verify hover/settling/seek/keyboard behavior against a running server in a permitted environment.

Independent final fidelity review remains pending. Thin-line antialiasing, compression texture, and the independently drawn pointer outline/shadow can differ from the reference. Raw pixel errors are diagnostics, not a fidelity percentage; the large blank canvas dilutes full-canvas error. No 100% claim is made.
