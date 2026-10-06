# Review evidence

- Reference: 720 × 720, 10.005933 s, 576 native decoded frames. Actual pixels were inspected before work began.
- Re-created all three presented Update → Updating → cancel cycles. The connected circular cancel control, spring overshoot, internal blue fill, and cursor movement are included.
- Every one of the 576 native reference timestamps has a rendered SVG frame and a pixel comparison. Mean absolute RGB error is 1.868/255 over the complete frame and 6.338/255 over the fixed button region. Median blue-icon horizontal error is 1 px; 95th percentile is 2 px. These are measured errors, not a claimed perceptual-match percentage.
- Six tests pass, covering the motion model, three native cycles, repeated clicks, cancellation, restart, Escape event wiring, focus, reduced motion, simulated completion, finite scene output, and every native timestamp.
- Encoded MP4 preserves all 576 native timestamps exactly (maximum timestamp difference 0 s); its last sample ends at 9.988911 s, 17 ms before the original container duration. The GIF is a 30 fps viewing copy.
- MP4 and GIF contain only the interaction and intrinsic UI. No explanations, parameters, labels, or watermarks are added. The pointer is independently drawn, with a motion trace derived from the original footage.
- The preview is an offline render of the same SVG scene used by the interactive HTML. It is not a browser recording. A live-browser pass is still outstanding.
- The open-source Nunito typeface substitutes for the original proprietary rounded font. Internal blue shading and cursor outlines are independent approximations.
- This supplemental case is separate from the numbered collection.

Native comparison values and encoded-timestamp checks are in `evidence/`. Original footage and reference-containing contact sheets are excluded.
