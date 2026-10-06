# Inspora footer

[![Inspora footer](delivery/footer-preview.gif)](delivery/footer-preview.mp4)

[Demo](index.html) · [Video](delivery/footer-preview.mp4) · [Horse detail](delivery/horse-detail.mp4) · [Source & rights](PROVENANCE.md) · [License](LICENSE.txt)

Design inspiration: [Pranav / @PranavOriginals](https://x.com/PranavOriginals/status/2105346116388868364), featured by Inspora. The desert and paper artwork are original procedural replacements; the accepted v6 horse/rider motion is preserved. Previews are clean offline renders, not browser captures.

Install the declared development dependency with `npm install`; FFmpeg must also be available.

Regenerate original artwork: `node scripts/draw-desert.mjs`. Render 140 preview frames: `node scripts/render-preview.mjs`. Encode with `bash scripts/encode-previews.sh`.
