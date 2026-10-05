# Verification

## Reference inspection
The actual 15.21-second public video was downloaded and inspected across both demonstrations, not inferred from a thumbnail. Full-frame contact sheets and dense samples at 12 fps around the jump/tear established the visible states. Phone-screen crops were approximately rectified into a 390×844 coordinate system for layout comparison. The physical handset, hand, desk, OS status bar and notch are intentionally omitted from the clean effect preview.

## Measured sequence
Times are relative to the final successful tap/release, observed around absolute video time 2.67 seconds; measurement uncertainty is approximately 2–4 frames.

| Phase | Relative seconds |
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

Animation easing is independently reconstructed from sampled motion, not recovered from the original Rive source. The menu remains stationary under the cyan peel. Four scratch groups have distinct unequal strokes and fade during the reveal. The falling cat has a faint displaced motion echo.

## Layout checks
- Idle cat: approximately x119–287, y567–826, including the tail; three whiskers on each side extend the head.
- Tiny 戳 cue and bent arrow: upper-right of the cat, near y580.
- Shoulder glance: near eye is within the head silhouette; far eye is a clipped sliver.
- Fully extended upper paws: approximately x175/255, y352/358.
- Header: title begins around x22,y230, with deliberately large empty space above it.
- Cards: x23, width344; tops at y305/431/557/680, heights112, radius21.
- Menu copy and all four illustrations reconstructed from the visible reference.
- Palette sampled from the photographed display. It reflects the available film and is not claimed to be the original app's exact unphotographed color values.

## Automated checks
`npm test` runs 26 tests covering:
- Idle and tap gating, repeated taps, terminal menu, reset/replay
- Reduced-motion activation and preference changes mid-animation
- Clock bounds, phase order, motion continuity, 10,100 finite/bounded pose samples
- Rendering across all phases, scene opacity, cat/menu placement and palette
- Partial peel layering, semantic action labels
- No downloaded reference media or remote dependencies in the renderer/runtime

Commands:

```sh
npm install
npm test
npm run build
npm run render
```

The only development rendering dependency is `@napi-rs/canvas`; the browser application has no JavaScript dependencies. FFmpeg creates the video/GIF from the rendered frames.

## Preview provenance
- MP4: 780×1688, 60 fps, 6.6 seconds.
- GIF: 390×844, 30 fps, 6.6-second loop.
- First second holds the initial state. The measured sequence then plays once, followed by a still terminal menu.
- Both previews render the same `src/scene.mjs` and `src/motion.mjs` used by the interactive application.
- The previews contain only the recreated effect UI, with no editorial titles, watermarks, helper text, side-by-side comparisons, or reference-video footage.

## Browser-test limit
These are deterministic offline Canvas renders, not a recording of an end-to-end browser session. Local browser execution was unavailable in the task environment, and the cloud browser refused the offline data URL because it permits only HTTP/HTTPS. No bypass was attempted. The offline HTML build was syntax-checked and the motion/render code tested; real browser pointer, focus, viewport, font loading and tab-visibility behavior still require a browser pass.

`standalone.html` embeds all fonts and code, so it can be opened directly without a server or network. `index.html` is the modular development entry and should be served over local HTTP. 

## Coordinated-turn revision

The shoulder-glance pose was rebuilt after visual feedback. The prior implementation scaled a separate head horizontally while leaving the torso fixed. The revision morphs one connected head–neck–torso silhouette through the complete glance and return, bringing the ears together in perspective while preserving the grounded body mass.

The near eye is round (center≈235,612), its pupil looks up/left (≈231,605), the far eye is clipped by the profile, and a tiny pink nose appears between them. Far-side whiskers disappear during the turn. Ear tips converge to approximately (185,563)/(208,559), rather than remaining widely spaced. Adjacent poses, not only the held frame, use this coordinated geometry.

Two added tests check the connected contour over 101 turn samples and the continuity of its area/center of mass. The original photographed 3.7s frame and neighboring frames were used for this correction. This is still an independent visual reconstruction, not recovered original vector artwork.
