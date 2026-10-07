# Independent timing audit: delivered v0

This is a historical audit of version 0, not a fresh public-release test. The public preview is the corrected 50 fps export. The official source video and all source-containing crops/comparisons are not bundled.

## Main finding

The delivered GIF has no encoded global speed-up. It really lasts 3.600 seconds: 108 frames, with 72 delays of 30 ms and 36 of 40 ms. It is an offline 30 fps render, not a browser screen recording. The original promotional MP4 is 1080×1080, 570 frames, 60 fps, 9.500 seconds, with consistent native presentation timestamps.

The short reveal feels more abrupt because the old export samples the hidden state exactly at its 1.300 s click, then skips to 33.333 ms into the reveal. Only five nonterminal revealing images survive. The weak initial ramp is missing. Photo detail is already about half recovered at GIF 1.370 s and essentially recovered at 1.430–1.470 s; terminal runtime state first appears at 1.500 s. A 180 ms model parameter is not 180 ms of equally visible change.

## Native-source reveal timing

All frame numbers below are zero-based. Prior packaged notes use one-based PNG numbers.

- First reveal: faint onset candidate n79 at 1.3167 s, confident first-visible n80 at 1.3333 s; midpoint roughly 1.4667–1.4833 s; 90% recovered detail about 1.5167–1.5333 s; practically clear 1.5500–1.5667 s. Visible span roughly 220–250 ms. Intro bubble/media framing moves; slight remaining scaling and possible promotional retiming limit precision.
- Second stationary reveal: hidden n452 at 7.5333 s, first-visible n453 at 7.5500 s; midpoint 7.6000–7.6167 s; 90% recovered detail 7.6500–7.6667 s; practically clear 7.7000–7.7333 s. First-visible-to-clear span roughly 150–183 ms, with onset-bracket uncertainty supporting a conservative roughly 180–200 ms target. Thus 180 ms is defensible for this particular second segment, not a universal original-client constant.
- The second tutorial touch ring appears at approximately 7.1167–7.1333 s, about 0.42 s before actual image clearing. Counting that marker would make the apparent interaction much longer. The first marker appears around 0.93–0.98 s, also before its actual reveal.

## Holds and looping

The GIF holds exactly the same clear media pixels from 1.500 to 3.070 s, then hard-cuts to hidden. Its code threshold is 3.050 s, rounded to the next sampled frame. There is a 0.530 s trailing hidden hold; across the loop this joins the next 1.300 s initial hold for 1.830 s hidden before the next trigger. Loop count 0 means infinite looping. The demo's 240 ms interactive hide duration is not used in this export.

## What the evidence establishes

- Encoding duration is correct; ordinary GIF centisecond quantization is not an acceleration bug
- Temporal sampling/phase loses early reveal information and can account for a snap-like first change
- The two source-video sequences have different apparent pace, so presenting one exact universal original duration would overstate the evidence
- The official source is a 2022 composed promotional video; no current native Telegram client was measured
- The offline render also does not establish browser playback smoothness on the user's device

## Pixel method and evidence

Native-frame contact sheets were inspected. Approximate photo-detail recovery was estimated by high-pass RGB regression against fully clear reference frames, cross-checked with local texture estimates and a tutorial-annulus exclusion. The first sequence additionally received small similarity registration. These are recovered-photo-detail thresholds, not exact mask-area/alpha measurements. Compression, tutorial overlay, source motion, artistic differences and threshold definitions limit precision by at least a frame or two.

Retained numeric evidence: [summary](source-timing-audit.json), [historical GIF timeline](gif-timeline.json), [source timestamps](source-pts.json), [full pixel metrics](pixel-metrics-all.json), [pixel metrics](pixel-metrics.json), and [registered first-reveal metrics](first-aligned-metrics.json). Source-containing contact sheets and the old GIF are excluded from the public bundle. Unregistered first-reveal regression or annulus-excluded means alone should not be treated as literal full-image clear fractions.
