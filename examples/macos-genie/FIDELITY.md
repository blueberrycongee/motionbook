# Genie: frame-aligned fidelity review

## What this revision matches

This is an independently drawn reconstruction calibrated to **two recorded native macOS transitions**. It is not a Mac screen recording and is not certified pixel-identical to every macOS release. The separately delivered review comparison uses matched source-window and Dock anchors; the interactive demo retargets the same calibrated motion to its own original desktop layout.

### References

- **Minimize:** [Harshil Shah's article](https://harshil.net/blog/recreating-the-mac-genie-effect/) explicitly identifies its System Preferences clip as the standard macOS animation, distinct from the author's separate recreation. [Reference video](https://harshil.net/c43d923742c09a1704d62551cea4a912/sysprefs.mp4), 1914 × 1834. We decoded 137 displayed frames using their presentation timestamps. The container's 197-frame coded count is not the displayed sequence. There are repeated frames and timestamp gaps during the transition.
- **Restore:** [macos-defaults Dock settings page](https://macos-defaults.com/dock/mineffect), [reference video](https://macos-defaults.com/assets/genie.D0sOVPm_.mp4), 740 × 740, 96 displayed frames at encoded 30 fps.

Neither capture independently establishes the exact OS build or whether its creator changed recording speed. Timings below describe the encoded footage. Source footage is not included in the runtime. The separately delivered, attributed comparison shows only the short transition excerpts needed for critique, without audio or unrelated footage.

## Measured changes, not another easing guess

1. **The sheet stays full height.** Interior divider lines in the minimize clip move downward by essentially the same amount as the top edge. Less of the sheet remains visible because the Dock occludes it. Versions 1–2 actually compressed the texture vertically; this revision removes that scaling.
2. **The side curves stay in screen coordinates.** Both sides fit a shared world-y cosine closely. The sheet passes through that corridor. Evaluating the curve in local window coordinates would make the corridor travel with the window and produce a different effect.
3. **The mouth is not fixed-width.** Separate left/right amplitudes vary with time. In the minimize footage, the extrapolated mouth width falls to roughly 28 native pixels, then widens toward the thumbnail. A fixed target rectangle missed that behavior.
4. **Restore is separately measured.** Its top is essentially home by frame 57, but the lower edge continues opening through frames 61–62. It is not driven by an arbitrary reverse exponent anymore.
5. **The clock is shared.** Browser and preview use the same samples, interpolation, durations, geometry, clipping and drawing code. The normal preview is not a slowed substitute.

## Extraction and fitting

The window body was separated from wallpaper, shadow and Dock. We retained the native timestamps and measured top, visible bottom, and left/right body edges by scanline. Rounded corners were excluded from curve fitting. In the high-resolution minimize clip, the last 16 pixels above the Dock were treated as an uncertain blending region. Hidden bottom geometry was not treated as observed data.

The fitted spatial model is:

- C(y) = 0.5 − 0.5 cos(π clamp((y − y0) / (yD − y0), 0, 1))
- L(y,t) = L0 + AL(t) C(y)
- R(y,t) = R0 + AR(t) C(y)

The cosine form is supported by the measured contours; it is not asserted solely because a patent mentions a sine curve. Source intercepts and world-y curve bounds are fixed. Top position and the two amplitudes are stored at native frame timestamps, then interpolated with shape-preserving cubic interpolation. Recorded holds remain holds. Missing frames do not reveal a unique original system easing law.

`src/calibration-data.js` contains the compact numeric measurements. `src/calibrated.js` evaluates them. `src/motion.js` controls playback and interruption, and `src/scene.js` draws the independent artwork. During a user interruption, a short pose bridge preserves continuity; this extra behavior is not claimed to reproduce an unobserved native interruption.

### Timing anchors

- Minimize: last unchanged frame at 0.733333 s; first changed at 0.750000 s; first downward translation at 0.850000 s; first frame with no ribbon above the Dock at 1.233333 s. The chosen sampled interval is 500 ms.
- Restore: last frame without visible sheet at 1.533333 s; first protrusion at 1.566667 s; top at rest around 1.900000 s; fully resting geometry at 2.066667 s. The sampled interval is about 533 ms. Physical onset/completion are only bracketed by the capture cadence.

## Error results and what they mean

Numbers are in **original video pixels**, not the resized comparison image.

- Minimize, every fifth interior scanline held out from per-frame amplitude fitting: median absolute edge error **0.253 px**, 95th percentile **0.719 px**, RMS **0.382 px** across 9,494 edge samples. Maximum **4.42 px**. Typical threshold uncertainty is about ±1 px, conservatively ±2 px.
- Restore, held-out scanlines: median **0.121 px**, 95th percentile **0.446 px**, conservative all-raw RMS **2.237 px** across 2,614 edge samples. The all-raw value retains false edge detections and corner/codec contamination. Residual-selected “inlier” statistics are not presented as independent accuracy.
- Temporal uncertainty is much larger than the spatial fit numbers suggest. In a leave-one-frame-out test on restore, interpolated top position differed by a median **5.81 px**, maximum **18.86 px**. Retaining all observed keyframes matches the recording more closely, but does not recover unknown intermediate system frames.

These are **spatial model diagnostics on the calibration recordings**, with held-out rows. They are not independent native-device tests, whole-image pixel differences, or a guarantee that another macOS version behaves identically. Compact before/after and coverage diagnostics are in `validation/comparison-metrics.csv` and `validation/comparison-methodology.md`. Native excerpts and frame captures remain in the separate review deliverables; they are not checked into this example.

## Remaining differences

- Window contents, desktop art, icons and typography are original, so whole-image pixel parity is intentionally out of scope
- The Canvas strip rasterizer is not Apple's compositor; text filtering, rounded corners, shadows, translucent Dock blending and thumbnail handoff can differ
- Native Dock layout movement is represented in the measured window contour, but the decorative Dock in the demo does not recreate every icon's layout response
- The invisible sheet below the Dock is not measured; only its visible clipping and fixed-height behavior are supported
- The reference-aligned comparison tests captured anchors; the demo's differently sized window is a retargeted study
- The cloud browser blocked localhost preview access, so real browser layout, frame-rate and assistive-technology checks remain unverified. No denied route was bypassed

## Run

Open `index.html`, or run `npm start`. `npm test` covers state, measured landmarks, moving-mouth geometry, constant texture height, native timestamp retention, interruption continuity and normal/slow preview parity. Render with `npm run render`; use `node render.cjs --slow` for the separately labeled 0.25× study. See `VALIDATION.md` for environment details.
