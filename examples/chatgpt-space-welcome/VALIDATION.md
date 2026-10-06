# ChatGPT · Space welcome motion study

![Space welcome animation](artifacts/space-welcome.gif)

[60 fps MP4](artifacts/space-welcome-60fps.mp4)

Independent reconstruction of the Space welcome animation in the supplied screenshot, traced to the official ChatGPT macOS 26.930.61225 (13232) distribution.

## Preview

The clean 18-second offline preview covers star twinkle and depth drift, floating work samples, editable selections, procedural collaborator labels, pointer repulsion, a spring-return card toss, and Continue-triggered star warp. The MP4 is 1440×1116 at 60 fps. The accepted GIF is a 20 fps viewing copy (800×620). The repository uses a 400×310 delivery derivative to fit upload limits. All 360 frames and their 50 ms durations are retained, for the same 18-second sequence; scaling and palette compression affect fine pixels. The accepted full-resolution MP4 is unchanged. No explanatory overlays or watermarks appear.

This is an offline Canvas 2D render of the same scene implementation used by the demo. It is **not a browser capture or a recording of ChatGPT**. The user accepted this exact first candidate for publication; the fidelity limits below remain.

## Run

```sh
npm start
# Open http://localhost:4173
npm install
npm test
npm run render
```

The browser uses native ES modules and does not need installation. Drag a card and release it, press arrow keys to nudge, Enter to toss, Home to reset, Continue to play the warp, or R to replay. Rendering requires Node, @napi-rs/canvas and FFmpeg.

## Recovered mechanisms

- Canvas 2D particle field, Park–Miller seed 42, clamp(round(width×height/190), 1000, 11000) stars
- Five star colors; procedural radial glows, slow depth travel and phase-offset twinkle
- Pointer parallax; 190 px repulsion zone, stronger on press
- Four 13-second ease-in-out floats, phases 0 / 4 / 8 / 6 seconds
- Card release spring: stiffness 6.76, damping 3.432, velocity capped at 1200 px/s
- 1.5-second warp acceleration; card exit 1.1 s with cubic-bezier(.55,.02,.95,.7)
- Central copy fades/blurs/shrinks in 0.4 s; scene exit starts at 1.65 s and lasts 0.7 s
- Narrow containers hide samples at width ≤540 px or height ≤460 px

[Motion evidence](evidence/motion-contract.json) · [Package fingerprints](evidence/client-fingerprints.json) · [Verification](VERIFICATION.json)

## Fidelity and verification limits

19 tests pass, including deterministic particles, bounded pointer response, warp idempotence, spring convergence, keyboard timing values, responsive visibility, actual Canvas rendering, hit geometry, resize and fade-out. Browser layout, accessibility behavior and compositor playback are not verified: the permitted browser preview route is currently restricted.

The screenshot identifies the target and composition, not timing. Constants were recovered by static package inspection. Original runtime/account gates were not exercised. No ChatGPT account, actual Space or user computer was accessed.

The artwork is independently drawn procedural vector imagery. Proprietary photos, illustration, font, source bundles and reference pixels are excluded. The five-person edit/task-assignment choreography currently uses a simplified deterministic fixture. Label following is simplified and the full collision hysteresis is not reproduced. The original slow-frame adaptive detail downgrade is not implemented. Whole-scene easing is not explicit at the call site; this demo assumes ease-in-out. Browser drag floats are not yet paused during active drag. These are explicit remaining fidelity work, not a pixel-parity claim.
