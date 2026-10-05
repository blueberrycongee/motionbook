# Provenance and verification

The original footer reference is Pranav's design, featured by Inspora:
https://www.inspora.design/posts/footer-section
https://x.com/PranavOriginals/status/2105346116388868364

The desert illustration and blue paper texture are borrowed from the exact reference image:
https://media.inspora.design/posts/889b9627-92d4-4a09-8755-0379c9eb3df5.webp

The PNG is a lossless conversion of the same WebP. A blended nearby desert sample covers the original still horse. The moving horse/rider SVG paths, motion rig, HTML text/layout and controls are authored code inspired by the reference. The motion is newly authored, not recovered from the original creator.

No reuse/publication license was visible for the original artwork. Obtain appropriate rights or replace that borrowed image before public/commercial reuse.


## Preview construction and limitations

The clean MP4s have 140 frames at 20 fps, lasting seven seconds. They render the actual SVG and JavaScript pose function with Inkscape, then encode it as video. No reference-video frames were copied into the animation. There are no added titles, labels, captions or watermarks; the footer's own interface text remains.

These are offline renders, not browser recordings. Actual browser runtime, responsive layout and interaction testing remain unverified. Form and navigation are local demo controls; no email is sent and no data is stored.

## Checks

- JavaScript syntax: `node --check horse-motion.js`
- Local form/link logic: `node test.mjs`
- Motion and mocked controller regressions: `node test-motion.mjs`
- Source IDs, label references and local asset paths
- Final encoded video timing and decoded-frame visual inspection

Motion source details and modern video references: `GAIT-REFERENCE.md`.
Shape/reference notes: `ANATOMY.md`.
Numerical regression results: `preview/kinematic-checks.json`.
