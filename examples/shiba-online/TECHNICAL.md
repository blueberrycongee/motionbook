# Shiba online

A code-drawn pixel-art adaptation of MAIKO's “Online” scene, replacing the pigeon with a seated Shiba Inu and matching dog motifs in the desktop portraits and tower ornament.

## Reference and rights

- [Inspora](https://www.inspora.design/posts/pigeon-online)
- [MAIKO / @maiko_pixel](https://x.com/maiko_pixel/status/2068283828356124711)
- [Original video](https://media.inspora.design/posts/1994cd04-010b-4fea-8720-3b214a0b1adf.mp4)
- [Shiba anatomy reference](https://magazine.cainz.com/wanqol/articles/medical_checkup_01)

The sequence retains the CRT scene, overlapping image windows, food popup and solitaire. All artwork is independently drawn; no reference video or photograph pixels are included. No public reuse license for the original design was found. Obtain any needed permission for commercial reuse.

## Run and reuse

`npm start` runs the included static server. Click or Space pauses; reduced motion pauses automatically. There are no runtime dependencies or remote assets.

`src/scene.mjs` contains the geometry, palette, texture and animation. Its shared `drawScene` function draws at 128×128 logical pixels with nearest-neighbor enlargement.

- `npm test`: loop closure, desktop states, output validity and reduced-motion checks.
- `npm install && npm run render`: regenerate previews; requires FFmpeg and `@napi-rs/canvas`.

Previews are offline renders. Browser playback and click/keyboard behavior remain untested.
