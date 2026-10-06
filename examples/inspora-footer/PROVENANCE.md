# Provenance and verification

## Design reference and credit

This independent footer study is inspired by Pranav / @PranavOriginals, featured by Inspora:
- https://www.inspora.design/posts/footer-section
- https://x.com/PranavOriginals/status/2105346116388868364

The original creator retains rights in the reference design and artwork. This credit does not imply endorsement, affiliation, or permission to reuse the original artwork.

## Original replacement artwork

The previously borrowed desert image and blue-paper texture have been removed. This revision contains no reference image, crop, blended sample, automatically traced path, or source pixel.

- `scripts/draw-desert.mjs` independently constructs `assets/original-desert.svg` and `assets/original-blue-paper.svg` from original mathematical contours, a fixed random seed, stratified hatch strokes, grass, stones, and procedural grain. It reads no images or reference data.
- `assets/horse-scene.svg` composes that original landscape with the independently authored moving horse/rider. The old borrowed-image patch and masks have been removed.
- The accepted v6 horse/rider geometry and `horse-motion.js` are preserved. Only the background composition changes. The motion is newly authored, not recovered from the original creator.
- The browser uses the new landscape and procedural paper assets. The HTML text/layout and local demo controls are authored code inspired by the reference.
- No font file is redistributed. The page and offline renderer use available system serif fonts. Font rights remain with their respective owners.

## Preview construction and limitations

The clean MP4s have 140 frames at 20 fps, lasting seven seconds. `scripts/render-preview.mjs` renders the actual horse SVG and JavaScript pose function over the new landscape with Sharp, then FFmpeg encodes the frames. Desktop HTML/CSS typesetting is represented in SVG by the offline renderer. No reference-video frames are copied into the animation.

The previews have no added titles, small labels, captions, or watermarks. The footer’s own interface text remains. They are offline renders, not browser recordings. Browser runtime and responsive layout remain unverified: the cloud Chromium process could not start because this environment disallows the required local socket. macOS/user-computer access is neither required nor used.

Forms and navigation are local demo controls. No email is sent and no data is stored.

## Checks

- JavaScript syntax, local form/link logic, and mocked controller regressions
- v6 kinematic assertions, including stance slip, contact height, link lengths, support sequence, and rider control
- Source/asset reference checks and removal of both borrowed artwork files
- Byte identity of the accepted motion module and horse/rider subtree
- Encoded video timing and decoded-frame visual inspection

Motion sources: `GAIT-REFERENCE.md`. Shape study: `ANATOMY.md`. Numerical checks: `preview/kinematic-checks.json`. Replacement verification: `preview/public-cleanup-verification.json`.
