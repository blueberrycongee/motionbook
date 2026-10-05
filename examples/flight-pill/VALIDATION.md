# Run and validation

Serve this directory with `python3 -m http.server 8000`, then open its `index.html` in a browser. Click the pill, close with ×, or press Escape. R replays the loop. The bundled Inter font loads before playback starts. Reduced-motion mode uses immediate state changes.

Tests: `node test.cjs`. Rebuild: install the development dependency in package.json and run `node render.cjs`. Offline font matching uses the bundled fonts.conf with fontconfig; the interactive browser loads the WOFF2 directly.

## Tests

- `node test.cjs`: PASS. Timing states, exact scene loop seam, 400 finite SVG samples, simulated-DOM open/close, interrupted Escape, replay and reduced-motion cases.
- `node render.cjs`: PASS. 366 frames, 60 fps, 1920 × 1080 MP4; 20 fps looping GIF. Both use the same vector scene as the application.
- Browser/native runtime: not run. Local browser execution and local-site access were denied in this session. The restriction was not retried or bypassed. Simulated DOM tests and offline rendering do not establish a real-browser runtime pass.

## Full-frame visual audit

All 366 source frames in the selected interval were decoded from the original 1920 × 1080, 60 fps video. They were paired with all 366 decoded replica frames. Every pair was inspected in 23 numbered contact sheets; transition outliers were additionally inspected at full resolution. Per-frame bounds and RGB differences were measured, rather than checking only representative stills.

The audit corrected the original version's over-fast collapse, expansion timing, missing intermediate frames, title trajectory, route progression, counter staging, content scaling and blur. Source preview timestamps were found to lag the original by 50 ms and were not used as native timestamps.

Numeric metrics are in audit/frame-metrics.json and audit/summary.json. They measure a fixed UI crop; the source's recording cursor remains in the error measurement. RGB error is in 0–255 channel levels, not a fidelity percentage, and cannot replace visual inspection.

The final review checks:

- Press, expansion, held card, reverse collapse and settling follow the original native-frame geometry.
- The title follows its measured path; independently delayed detail layers preserve the observed hierarchy and blur.
- The plane/route reveal and rolling digits no longer jump directly to their final states.
- First/last scene equality and a returned idle hold give a clean loop.
- Original interface typography, line artwork and colors were closely compared throughout the motion. Minor font rasterization, vector-icon and video-compression differences remain. The source recording cursor is intentionally absent from the application and clean previews.

The comparison establishes reviewed motion/layout fidelity for this independently implemented interaction, not pixel identity or a browser-runtime pass. Publication and remote verification are separate checks.

Final export reviewed on 2026-10-05T21:04:16Z. The selected crop has median RGB MAE 1.626 and maximum 4.643; detected card bounds differ by at most 4 native pixels (95th percentile 3 pixels). The small counter/blur softness difference at frames 300–305 remains; it does not change the observed state or native-frame collapse timing. The real 400/500/600/700 font files and the single-zero reset at frame 302 were checked after export.
