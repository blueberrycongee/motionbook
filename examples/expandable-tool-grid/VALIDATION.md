# Run and validation

Open index.html directly, or serve this directory with `python 3 -m http.server 8000`. Click + to open the tools and × to close them. Repeated clicks reverse the transition; Escape closes it and restores focus. R replays the complete source-aligned timeline. Tool cells acknowledge selection without editing or transmitting files. Reduced motion makes immediate state changes.

Run `node test.cjs` for logic checks. Install the development dependency in package.json and run `node render.cjs` to rebuild the previews, one render process at a time. The offline renderer uses the same SVG scene as the application, with at most two rendering/encoding threads.

## Verification

- Logic: passed. All 495 native sampled states plus the authored loop tail; exact seam equality; pinch/reversal assertions; simulated-DOM toggle, interrupted reversal, Escape/focus restoration, replay, tool selection and reduced motion.
- Export: 522 frames at 720 × 720 and 60 fps, 8.7 seconds. The GIF samples the complete export at 20 fps. MP 4 decoding and animated-GIF inspection passed. This is an offline shared-SVG render, not a browser recording.
- Actual browser runtime: not run. Local browser launch and local-site access were denied in this session. The restriction was not bypassed. Simulated DOM tests do not establish real-browser behavior.
- Source alignment: all 495 original decoded frames, PTS 0–8.233333 seconds, compared against the corresponding first 495 replica frames. No source motion interval is omitted. An additional 27-frame authored tail returns the initial selected tab and is separately inspected.

## Visual comparison method

All 495 source/replica pairs were inspected in 33 consecutive, numbered sheets covering the entire moving UI. Full-resolution checks include the initial lens boundary (frames 4–12), first expansion/pinch, repeated collapses, the interrupted open–close–open interval (209–246), Undo/Duplicate press flashes, and the final closed bar. The independent phone and background were also checked at full-frame size. Local source comparisons are kept outside this package because the source reuse license is unspecified.

The review corrected measured pane geometry, corner compression, horizontal versus vertical content motion, plus/X orientation, press-surface luminance, the bright tool-cell center glow, and transition softness. Initial liquid-glass selection uses a locally varying inverse displacement field rather than scaling whole icons. The source home/inbox strokes bend only as the moving optical edge crosses them.

The numeric audit includes every frame's full-image and moving-UI mean absolute RGB difference. Values are diagnostics on the 0–255 channel scale, not a claimed similarity percentage. Native PTS are used to generate the first 495 scene states; nominal 60 fps encoding changes sub-millisecond timestamp jitter only.

## Remaining limits

The original font and shader are unavailable. Independently drawn icon details, glyph metrics, phone-edge reflections, gradient-band contours, caustic highlights, and compression softness retain small visible differences. The reconstruction does not claim pixel identity. The measured visible bounds include antialiasing and optical softness; they are not recovered original CSS values. The explicit loop tail is additional motion because the source starts on Inbox and ends on Home.

An early export attempt overlapped a preceding unfinished encoder and failed decoding. It was discarded; the final export was generated serially and decoded with ffmpeg's error-stop option before review and hashing.

## Final blur-only review

An independent reviewer inspected all 495 source/replica pairs and all 27 tail frames, accepting geometry but identifying excessive blur at near-sharp transition frames. Only the source-sharpness-to-grid-blur response was changed. All 73 native frames with a visible affected grid were re-inspected after export. The remaining 422 native states retain their reviewed visible drawing:189 complete SVG states are byte-identical;233 differ only in the blur definition of a fully transparent grid. The 27 tail states also change only that invisible filter definition. A per-frame SVG hash/opacity delta report binds this coverage; all 495 final paired sheets are retained for independent checking.
