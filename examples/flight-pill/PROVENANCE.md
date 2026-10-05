# Source and rights

- Reference: [pill buttons](https://www.inspora.design/posts/pill-buttons).
- Creator: R, currently [@wheresryan22](https://x.com/wheresryan22); the curator identifies the earlier handle @wherescz.
- Original post: https://x.com/wheresryan22/status/2100473433897222224
- Original media: https://media.inspora.design/posts/b2909ab7-5353-4fc0-b009-daccd391ced6.mp4
- Inspected 2026-10-05. Original file: 1920 × 1080, 60 fps, 2448 frames, 40.8 seconds. This reconstruction selects the first complete flight interaction, [0, 6.1) seconds, and renders all 366 corresponding native-cadence frames. Later repetitions and the compilation's deletion/payment examples are outside this case.
- The source footage has no stated reuse license. No source footage, source frames, poster, or recording cursor is distributed.
- Interface geometry, airplane, route, icon paths, animation logic and application code are independently authored. Numeric motion tracks were measured from the reference; no reference pixels are used in the demo or previews.
- Inter 4.001 Regular, Medium, SemiBold and Bold are bundled from the official [Inter project](https://github.com/rsms/inter) and [font distribution](https://rsms.me/inter/). Actual weight-specific font files are loaded rather than allowing medium/semibold to fall back to the regular file. The font is used under its [SIL Open Font License](assets/Inter-LICENSE.txt), preserved unchanged. The source's exact font is not published; Inter was selected and sized against the observed glyphs.
- No blanket license grant is made on the user’s behalf. The source creator's material is excluded; see LICENSE.

## Native-frame reconstruction

Early analysis used the curator's 30 fps preview. Comparison with the original revealed a 50 ms preview delay and missing intermediate frames. The final motion follows the original 60 fps PTS, rather than assuming the preview is equivalent.

- Approximately 2.15–2.22 s: pressed pill briefly contracts.
- 2.233–2.667 s: the surface expands from its compact centered pill to the full flight card. Measured position/size and title trajectories are interpolated between native-frame observations.
- Separate metadata, airports, route, lower status, close-button and counter reveals preserve the source's delayed blur staging.
- Plane and solid route advance together; the landing time uses independently rolling digits.
- Around 5.0 s: counter/route begin reversing. At 5.05 s the container begins its measured collapse, followed by a short settling tail.
- The final idle hold returns to the starting geometry for a clean loop.

The complete native-frame audit is summarized in VALIDATION.md and numeric audit files. Source imagery used for comparison is not part of this package.
