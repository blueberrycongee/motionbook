# Implementation and verification

The deliverable is an independently drawn, standalone SVG reconstruction of the iridescent PRO animation shown in Mike Bespalov’s Refero upgrade flow. The SVG uses SMIL for a 4.4-second diagonal light sweep, three SVG inner-shadow layers, blur, procedural grain and component-transfer colour mapping. It has no JavaScript, canvas, WebGL, font, raster image, network request or runtime dependency.

The effect-only page centres the SVG on white. It intentionally leaves out the surrounding checkout modal, interface copy and controls. Reduced-motion users receive a static SVG.

## Reference inspection

- Inspora post: https://www.inspora.design/posts/tiny-animated-svg
- Creator’s original: https://x.com/bbssppllvv/status/2104747296671883312
- Creator’s technique breakdown: https://x.com/bbssppllvv/status/2105312970410537249
- Inspected Inspora-hosted video: https://media.inspora.design/posts/7b43f354-3903-4a26-a29c-f36261997565.mp4

The 17.13-second, 1840×1200 reference video was downloaded for inspection and sampled across its duration. The creator’s tutorial was also inspected in the cloud browser. The original SVG source was not obtained. Letter contours and filter parameters were recreated and visually tuned; this is not a pixel-identical extraction. The final SVG is approximately 2.8 KB uncompressed.

## Preview provenance

`preview/pro.mp4` and `preview/pro.gif` are offline code renders of this deliverable’s SVG, using sharp/librsvg. The renderer evaluates the identical SVG graph at discrete gradient-transform values; it does not replay, crop or embed the reference video. The 4.4-second loop is 1080×540 at 30 fps in MP4 and 900×450 at 20 fps in GIF. There are no visual overlays or watermarks.

Browser playback and browser-specific filter behaviour have not been verified. The available local Chromium launch and cloud-browser local-URL route had already been verified as blocked in the task environment and were not repeated. Automated source checks, SVG rasterisation and multi-frame inspection were completed. See `preview/render-info.json` for renderer versions.

## Development

- `node src/build.mjs`: regenerate `pro.svg`, `index.html` and the reduced-motion still
- `npm test`: source and loop checks
- `npm install && npm run render`: regenerate previews; requires FFmpeg in PATH

## Rights

The reference is credited to Mike Bespalov / Refero. No public reuse license for the original artwork or original SVG was found in the inspected posts. The archive excludes the downloaded reference video, reference screenshots and third-party code. No rights in Refero’s branding or original design are granted by this study. Obtain any needed permission before commercial reuse.
