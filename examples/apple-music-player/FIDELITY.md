# What the numbers do and do not establish

## Scope

The target is one observed source path. 145 geometry observations cover the changing frames and compact/expanded anchors. Native PTS are retained; the interpolation does not manufacture additional evidence. Animation start/finish statements carry at least one source-frame timing uncertainty, about 33.37 ms.

The phone is only 432 pixels wide inside the 1080p talk video. Cover measurements have roughly 1.5 px uncertainty in large unobstructed frames and 2.5 px at small/blurred frames. Sheet-edge uncertainty is roughly 2–3 px. Continuous-corner radii are approximate circular fits, not recovered UIKit geometry.

## Why the final replay retains every observation

A historical trial withheld every third measurement (47 rows), fitting the other 98 rows with shape-preserving cubic interpolation. Cover-y MAE on held-out rows was 2.34 px, with a 40.01 px worst case; sheet-y MAE was 2.61 px, worst case 45.31 px. Fast transitions expose source frame-pacing details that sparse interpolation misses. Static holds must not conceal those maxima.

The final replay therefore uses all 145 observed geometry rows. Evaluating it again at those same points is an **in-sample alignment diagnostic**, not independent accuracy. Zero geometric residual at an interpolation knot is expected by construction; it does not mean zero error in the observations, native renderer, unseen gestures, or Apple implementation. Original split labels are retained alongside the final fit labels.

The historical model and motion implementation are frozen separately under `validation/withheld-*`; `tools/evaluate-withheld.cjs` reproduces that historical trial. It is not the model driving the final GIF.

## Layer evidence

The shared cover, sheet top, background scale/top, separate tab strip, title/control offsets, color tokens, and opacity phases are derived or estimated independently. Geometry is much more directly observable than opacity: compressed RGB is a composite of several layers. Appearance knots retain that limitation and should not be read as exact Apple opacity constants.

The downward drag keeps a nearly 379 px cover until the final collapse. The final cover then moves about 12 px below its resting top before settling. This is a visible closing rebound; there is no confirmed canceled return-to-open in this selected clip.

## What remains different

- Original artwork and fictional text deliberately replace the source content
- Inter text, approximate icons, circular/SVG corners, shadows and web rasterization differ from Apple's native renderer
- The ambient field is a static color approximation carried with the sheet; subtle evolving source colors are not fully reproduced
- The default replay follows sampled visual output. It cannot reveal finger position, native initial velocity, spring constants, or unseen behavior
- The free-gesture controller and pose-preserving replay handoff are supplemental design. Their thresholds/spring are not calibrated native behavior
- Offline media is deterministic shared-SVG rendering. It does not measure browser latency, native 120 Hz behavior, GPU performance, or device accessibility

The deliverable makes no 100% or percentage-similarity claim. Whole-screen RGB difference is reported only as a diagnostic because replacement content and font metrics dominate it.
