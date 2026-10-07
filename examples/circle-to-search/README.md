# Circle → Discover

An independent, interactive Circle to Search motion study with original vector artwork and a local sample catalog. No AI recognition, uploads, accounts or search API.

The default appearance is calibrated to Google’s [February 2026 demonstration](https://blog.google/products-and-platforms/products/search/circle-to-search-february-2026/) and visually cross-checked against its [June 2026 filmed demo](https://blog.google/products-and-platforms/platforms/android/android-drop-june-2026/). A separate historical mode uses the [2024 demonstration](https://blog.google/products-and-platforms/products/search/google-circle-to-search-android/). These clips do not establish identical rendering on every current device/build.

## Run

Open index.html directly, or run npm start. Draw a closed loop around the outfit, sunglasses or tote. The selection button and Enter/Space offer keyboard alternatives. Escape dismisses. Reverse is an independent interaction extension. Reduced motion gives instant results.

## Test / render

Node 20+ is required. npm install adds the pinned development dependency @napi-rs/canvas 0.1.100. Then run npm test (34 model, simulated DOM and actual-pixel tests). npm run render also requires FFmpeg. node verify-media.cjs checks deterministic source-time rendering.

The browser and exporter share motion.js, appearance.js and scene.js. The GIF is an offline Canvas export, not a browser recording. Actual browser / touch / responsive screenshot QA was unavailable in the development environment; simulated DOM tests do not replace it.

## Fidelity boundaries

The measured first-box frame, trace thickness, cursor size and selected corner bounds were checked against decoded official frames. The chosen illustration and local results differ intentionally. Some drawn-arc positions remain about 3–6 logical pixels inward in the checked frame; older-trail opacity and GIF palette grain remain approximate. The MP4 in preview avoids the GIF palette conversion. No claim of exact pixel equality or universally latest implementation is made.

Official videos, photographs, source-frame comparisons and private audit reports are not included. Inter font license is in assets.
