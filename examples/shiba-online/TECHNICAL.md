# Shiba online

A code-drawn pixel-art reconstruction of MAIKO’s “Online” scene, with the foreground pigeon replaced by a Shiba Inu. The main dog has pointed ears, tan fur, cream urajiro markings, a short dark muzzle, a curled tail and a natural rear-three-quarter seated pose. The front legs descend under the chest, with folded hindquarters and a tail rooted at the rump. The little desktop portraits and tower ornament use the dog motif too.

## Reference

- Inspora: https://www.inspora.design/posts/pigeon-online
- Original creator: https://x.com/maiko_pixel/status/2068283828356124711
- Inspected video: https://media.inspora.design/posts/1994cd04-010b-4fea-8720-3b214a0b1adf.mp4

The full 2.1-second, 896×896 reference was downloaded and inspected across its frames. It is an animated illustration, not an interactive website: a dark CRT-computer scene with overlapping image windows, a food popup, smaller windows and solitaire. This reconstruction preserves that sequence and overall composition, adapting the character and desktop motifs. It is independently drawn code, not a pixel-identical extraction. No reference pixels, downloaded media or third-party artwork are used by the app or included in the deliverable archive.

## Posture revision

The initial character was corrected after feedback: its horizontal arm, collar-like neck break and flat circular tail were replaced. The revised silhouette was informed by an inspected real Shiba photograph in this [CAINZ / WanQol article](https://magazine.cainz.com/wanqol/articles/medical_checkup_01). The reference photograph was used for anatomy observation only; no photograph pixels are used in the scene or included in this archive. The computer, desktop sequence and timing were left unchanged.

## Runtime

The scene is drawn at 128×128 logical pixels and enlarged with nearest-neighbour scaling. All geometry, palette, surface texture, character animation and desktop windows are in `src/scene.mjs`. The same `drawScene` function is used by the browser and the offline preview renderer.

No application dependencies, assets, remote fonts, network services, API keys or accounts are required. `npm start` runs the included Node static server. Click/Space pause is an added convenience; reduced-motion preferences pause the animation automatically.

## Verification

- Four automated checks passed: deterministic loop closure, four distinct desktop chapters, opaque/valid output for every preview frame, local effect-only runtime and reduced-motion support.
- All 42 preview frames were generated from the shared drawing code; sampled frames were inspected visually.
- MP4: 896×896, 20 fps, 2.1 seconds, H.264.
- GIF: 896×896, 20 fps, 2.1 seconds, looping.
- These are offline renders using `@napi-rs/canvas`, not browser recordings. Browser playback and click/keyboard behaviour were not executed in the available environment. Previously verified browser-launch/local-URL restrictions were not retried.

To regenerate previews, install development dependencies, ensure FFmpeg is on PATH, then run `npm run render`. `npm test` runs the source/render checks.

## Rights

Reference artwork and original scene are credited to MAIKO / @maiko_pixel. No public reuse license was found on the inspected reference posts. No rights in the original design are granted by this study; obtain any needed permission for commercial reuse.
