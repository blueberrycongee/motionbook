# Leading dot typography

![Live browser recording](preview/loop.gif)

Three fixed-layout text scenes: an orange leading dot reveals Standard mode, a pale-purple dot runs the faster Ultrafast sequence, and a white call to action ends with a fade to black. Based on [OpenAIDevs’ announcement](https://x.com/OpenAIDevs/status/2108262812489531498?s=20).

[Browser entry](index.html) · [MP4](preview/loop.mp4) · [Timeline](src/timeline.mjs) · [Measured inputs](src/sequence.mjs) · [Validation](VALIDATION.md) · [Source and rights](PROVENANCE.md)

## Run

```sh
cd examples/openaidevs-kinetic-type
npm start
```

Open the printed localhost URL. The animation plays once for 14 seconds. Pause, Replay, and the keyboard-accessible time slider operate on one clock. With `prefers-reduced-motion`, the final message is shown statically. No runtime packages or network resources are needed.

## Reuse

`createLayout(config, measure)` fixes all word positions before playback. `sampleTimeline(config, layout, seconds)` returns each word’s opacity and color plus the dot pose. `interpolateTrack` uses shape-preserving cubic interpolation between measured points. `createPlayback` handles pause, seek, replay, completion, and reduced motion independently of drawing.

Replace `sequence.mjs` to use other text and timings. Supply one cue per space-separated word, increasing dot key times, and optional word/line ink bounds in the 560×315 measurement coordinate system. Omit ink bounds for natural font metrics. Remove or remeasure those bounds when changing text. The Canvas renderer and player can be reused separately.

## Review status

This implementation uses a cloud researcher’s observations and measurements. The implementing Mac could not retrieve the reference pixels; it does **not** claim independent visual equivalence. Cloud frame-by-frame review is ongoing. The first review corrected the replacement font to Inter Semibold 600, the second scene fade to 7.41–7.65 s, the fast word reveal to 30 ms, and the opening dot tint to .76–.81 s. Inter replaces the source typeface; interpolation, fade curves, and short unobserved dot endpoints remain fitted estimates. Reference sampling uncertainty is approximately 50–130 ms. The GIF is an actual continuous browser recording of this implementation, not original footage or a static storyboard.

## Verify and record

```sh
npm test
npm install
npx playwright install chromium ffmpeg
npm run test:browser
npm run capture
python3 -m pip install -r requirements.txt
python3 scripts/encode.py
```

`BROWSER_PATH` can select an existing headless Chromium executable; `FFMPEG` can select FFmpeg. Recording uses a temporary synchronization marker outside the animation that is removed before export. The encoder compensates a 40 ms presentation lag observed during the first cloud review; use `--sync-offset 0` or recalibrate when the recorder changes. Animation cues themselves are not shifted. Keyframes are browser screenshots; `preview/recording.json` records capture and decoding evidence. Temporary browser recordings remain in ignored `.capture/`.
