# Little Wins · CC0 monster milestone

An original celebration interface using a friendly **non-bird character assembled from genuine Kenney CC0 artwork**. The lavender rounded-square creature has one eye, white horns, separate arms and feet. It squashes, spins, catches a cyan/pink starburst, raises its hands, lands and smiles.

新的独立视觉：用 Kenney 的真实 CC0 素材部件组装单眼、带角、有手脚的淡紫色小怪物。保留蓄力、旋转、爆发、落定的动效节奏，换成靛蓝背景和星光庆祝。

## Run

From the repository root:

```sh
cd examples/cc0-monster-milestone
python3 -m http.server 8000
```

Open `http://localhost:8000`. The page needs no build step, accounts or network-loaded assets. Replay, pause, speed, timeline and reduced-motion controls are included. “Keep Going” inside the study is decorative.

Files: [runtime entry](index.html) · [preview GIF](preview.gif) · [keyframes](validation/keyframes.png) · [validation](VALIDATION.md).

## Actual CC0 artwork

Source: [Kenney Monster Builder Pack](https://kenney.nl/assets/monster-builder-pack), version 1.0, creation date 2022-01-19. The official page and the archive's `License.txt` both identify CC0. Selected source files are copied unchanged from `PNG/Double/`:

- body_whiteA.png
- arm_whiteB.png
- leg_whiteD.png
- detail_white_horn_large.png
- eye_cute_light.png
- eye_closed_happy.png
- mouth_closed_happy.png
- mouthB.png

These are real high-resolution transparent PNG components, not generated images labelled CC0. They are layered in an editable SVG rig. SVG color filters recolor white parts; joint transforms animate separate limbs, body and face. The PNGs are not converted into original vector outlines.

`assets/manifest.json` records exact source paths, SHA-256 hashes, dimensions, archive hash and license links. `assets/Kenney-License.txt` retains the pack's license unchanged. `assets.js` embeds the same bytes to keep browser/offline rendering consistent.

## Editable implementation

- `motion.js`: rig, color filters, keyframe tracks, face changes, original star effects and layout
- `controller.js`: replay interruption, pause, seek, speed, reduced motion
- `app.js`, `index.html`, `style.css`: responsive player
- `assets/`: selected original CC0 PNGs and provenance
- `scripts/test.mjs`: 44 checks, including asset hash verification and 9 actual-app event-adapter checks in `scripts/adapter.test.mjs`
- `scripts/render.mjs`: the same SVG renderer through Sharp/librsvg
- `scripts/build_review.py`: GIF and keyframe export

## Optional checks and export

The page itself has no third-party runtime dependency. Offline tools use Node 20+, Sharp 0.35.4 and Python Pillow. No package installation was performed while producing this revision.

```sh
npm test
npm install
node scripts/render.mjs validation/frames 2
python3 scripts/build_review.py validation/frames validation
```

## License scope and limitations

The eight Kenney artwork files are [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/); the original implementation code is MIT. CC0 permits copying/adaptation/commercial use of the covered artwork, but does not clear trademarks, patents, privacy/publicity or every third-party right. This is verified asset provenance, not an all-rights legal guarantee or endorsement.

Macro timing was studied from a 2022 product milestone animation, documented in `PROVENANCE.md`. No prior branded character art, original reference clip, logo, flame-body design, wings or sunglasses is included in this revised runtime/package.

Preview: shared-SVG offline render. App event wiring is tested with a simulated DOM, but actual browser layout, native keyboard/focus behavior and touch still need browser QA. The earlier Chromium attempt could not start under environment socket restrictions; this maintenance made no new browser attempt. See [VALIDATION.md](VALIDATION.md).
