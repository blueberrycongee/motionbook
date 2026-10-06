# Second-pass reverse audit and r3 corrections

## What was wrong in r2

1. **Export pixels were used as CSS geometry.** The model was fed the enlarged 720 × 960 drawing's rectangles. The spring uses travel distance, and squish uses body size relative to 360 CSS px. Therefore enlarging the demonstration changed the calculation rather than merely enlarging the result. r3 computes a 360 × 480 CSS-space room first and rasterizes at 2×. This is an illustrative cropped desktop room, not a claim that the app window is a mobile viewport.
2. **Body and bubble rectangles were collapsed into one box.** The client measures the message body for travel/squish and the actual bubble separately for background morphing. r3 accepts both rectangles and retains the text's separate measured width.
3. **Bubble layers and corners were approximated.** r2 drew one variable-width rounded path using quadratic corner curves. The client creates a rounded left cap, a center strip scaled about its right edge, and a stationary rounded right cap. It uses CSS border-radius normalization and a `1/currentCSSZoom` seam overlap. r3 models those separate pieces, uses circular corner arcs, and removes the temporary pieces/text-width lock at 190 ms. The body width/send marker remain until 800 ms.
4. **Typography and geometry were hand-sized.** r2 used 28 export-pixel text, 22 export-pixel horizontal inset, 28 export-pixel radius, and manually positioned rows. Its draft baseline and outgoing start baseline differed by 3 export pixels even for the single-line example. The inspected message CSS specifies 1 rem text, 1.5 rem line-height, 10 px vertical / 16 px horizontal padding, and a 22 px radius. r3 uses the 16 px root-size fixture consistently; it does not claim that the user's root size or font is known.
5. **Consecutive-message grouping was missing.** In the traced source, same-sender user messages on the same source/direction within 30 minutes group. Their preceding row loses its ordinary 12 px bottom margin, retaining only the 4 px list gap. r2's second row movement used arbitrary 122/70 px values instead. r3 derives the row positions and grouping.
6. **The multiline destination was frozen.** The footer and empty-attachment spacer use 220 ms `padding-block` / `margin-bottom` transitions, with cubic-bezier(.2,0,0,1). This is not an explicit height tween, but the resulting composer height can still change during send. r2 modeled the whole collapse as an instantaneous 52 px change. r3 models the fixture's immediate content change and the recovered animated spacing separately. The outgoing body's normal-flow position continues moving while the independent 600 ms travel track runs.

## What the numerical audit established

The sampled spring formula itself was not the error. In seven controlled synthetic cases, every one of the 60 CSS `linear(...)` samples from the independent implementation exactly matched the samples produced by the client functions. r3's start translation, squish extrema, left-cap translation, center scale and durations also matched those generated tracks. See [numerical comparison](../evidence/protocol-comparison.json).

The cases include 24, 46, 80, 92 and 240 CSS px travel; CSS zoom 1 and 2; and a bubble narrower than its message body. All comparison errors are zero for these inputs. The client source was isolated with a mock DOM and a fixed animation clock for this check. No app launch, account access, real message, network request or native security bridge was used. Proprietary source fragments and the private instrumentation inputs are excluded from the deliverable.

The source uses `currentCSSZoom`, not `devicePixelRatio`, to normalize measured rectangles. Device-pixel raster scale must not be fed back into the motion model. The source independently animates `translate` and `transform:scale(...)`; r3's declarative track description preserves that separation. It does not replace the browser tracks with a combined transform sampled at a new rate.

## Trace and timing qualifications

The desktop call chain remains `room-view` → `native-room` → composer surface `ll` / `ul` → send observer `uc` → body travel `dc` and bubble morph `fc`, in the fingerprinted build 26.930.61225 / 13232. No send-animation option override was found in that chain. The macOS distribution is the Electron branch; this does not identify which build, platform, preference or experiment the user is running.

The send handler captures origin before submission; a MutationObserver finds the new pending row; actual tracks start at the next requested animation frame with a common `document.timeline.currentTime`. They do not necessarily start at the physical click timestamp. React commit timing, the first computed CSS-transition frame and runtime scroll measurements can change the observed screen path. The preview defines its send instant as the first visible animation frame. It does not assert measured click latency.

`ResizeObserver` synchronizes footer spacing and the scroll controller. The client suppresses a normal reset path while a send marker is present, but the remaining scroll-to-bottom / anchor logic still runs as sizes change. In r3, the fixture's changing footer is included in normal-flow coordinates rather than baking a permanently fixed destination into the spring. The illustrative no-attachments branch is modeled with a 44 px single-line composer and a 98 px two-line composer: the collapse initially reduces content by 40 px, then settles the remaining 14 px spacing over 220 ms. These are CSS-derived fixture dimensions, not values read from the user's running app.

## Limits that remain

- No recording, runtime DOM rectangles, viewport/root-font configuration, app version or zoom was supplied for the user's exact interface. Therefore “identical to your app” is not established.
- Noto Sans CJK SC is used for the independent preview. macOS system Chinese glyph metrics, user font overrides and browser fallback differ. Message wrapping, CJK baselines and multiline editor baseline offsets cannot be certified without the real font/runtime measurements. The fixture uses a 24 px outgoing line box and 20 px multiline editor line spacing from the inspected default styles.
- No live browser/layout/compositor verification was available. The preview is an offline rendering of the corrected model and source-derived contracts. It is not ChatGPT footage.
- Original r1/r2 material is preserved separately. This package contains only the r3 accepted by the user for publication to their private reference repository. Earlier prototypes and media are not included.

## Best next verification input

A short original recording of one single-line send and one multiline send, with the full composer and last two message rows visible, plus platform/build and any zoom change, would let us measure the actual geometry and screen-space trajectory. It should avoid private chat content. Until then r3 is a corrected source-grounded candidate, not a pixel- or timing-certified match to the user's device.
