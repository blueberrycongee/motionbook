# Source and independent reconstruction

- Observed source: [Angry sliders on Inspora](https://www.inspora.design/posts/angry-sliders)
- Credited creator: [@ggsimm on X](https://x.com/ggsimm/status/2099497518627184949)
- Original media: [MP4](https://media.inspora.design/posts/a7bbf19d-5138-49d0-ab8c-7ace079b4265.mp4), verified against the original-media field rather than the gallery preview
- Original file SHA-256: `698e5bed5fd70dba96eec58a6c26554a22c0f18c3b5d1f85856535e6b62127dc`
- Observed 2026-10-05. Original video: 1466 × 1588, 990 actual encoded VFR frames, native PTS 0–17.441667 seconds, video duration 17.458333 seconds. Its audio track extends to 17.514667 seconds.

All 990 original native animation frames were inspected chronologically. The moving-interface review was supplemented with all 330 full frames from 660–989 because the cursor moves outside the interface crop. The reference pulls Field of view, Bloom, Exposure and Samples away from their tracks, displays ballistic landing predictions, releases each handle, and lets it bounce into place. Final values are −2.8 EV, 68%, 103°, and 242.

The original has a real timestamp gap from 0.083333 to 0.416667 seconds. The demonstration preserves this as a hold; it does not invent source frames inside that gap. Native timestamps, rather than nominal 60 or 120 fps, govern the measurement timeline.

All paths, circles, cursor shapes, dotted arcs and elastic cords are independently drawn SVG. JavaScript uses measured scalar controls for the observed demonstration and an independently inferred drag-resistance/ballistic model for live interaction. This is not the creator's source code. No source images, footage, audio, extracted graphical assets or proprietary fonts are embedded. System Arial/Helvetica and DejaVu Sans Mono fallbacks are used.

The preview is a silent visual reconstruction: the source audio is not copied or recreated. Its 19.2-second loop preserves the complete visual sequence and adds an authored reset at 17.8–18.55 seconds followed by a neutral hold. Keyboard controls, cancellation, secondary-pointer handling, reduced motion and live physics outside the recorded sequence are authored demo behavior; the source footage does not establish these policies.

## Rights

No reusable license for the source footage or design was identified. Attribution does not grant rights to them. The reference is linked for study and is not redistributed in this package. This independent implementation does not claim ownership of the original design or endorsement by its creator.
