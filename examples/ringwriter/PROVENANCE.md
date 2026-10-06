# Source and independent assets

Reference: [Ringwriter on Inspora](https://www.inspora.design/posts/1-60), credited to @edo_lunardi and linked to [the original post](https://x.com/edo_lunardi/status/2079129478630977948). The [author’s lab page](https://www.edoardolunardi.dev/lab/ringwriter) presents the experiment as a video. No original implementation or authoritative technique description was used.

The [original media](https://media.inspora.design/posts/6d134bd8-7e48-4cba-bcd7-7d29b9357b9b.mp4) contains 486 actual native frames at 1728×1728 and 60fps. Its PTS run from 0 to 8.083333 seconds. SHA-256: `cd577d97e239c866200fc574045ca60106aa85285efb498b3b06014585c69f81`. The original, rather than a gallery preview transcode, was used for measurement and visual comparison. Original footage and analysis crops are not included in this package, and no redistribution license for them is asserted.

The runtime draws dots, independently converted licensed glyph outlines and an independently drawn vector cursor. Packed motion data contains scalar ring radii, phases, character identities, letter scale/opacity, dot radius/opacity and local letter offsets. It contains no source pixel arrays, footage, textures, screenshots or copied implementation code. The font derivative is named Replica Ring Mono; its upstream attribution and SIL Open Font License are included in `licenses/`.

Measured motions include the outward reveal, enlarged letters at the wave front, independent letter movement during the hold, radial contraction, release wave and pointer/label movement. Weak early radii were fitted from measurable neighboring rings and checked against visible letters. Opaque caption and cursor regions were excluded when fitting partially hidden letters. These are reconstruction methods, not claims about the author’s original technique.

The recorded replay follows the observed native timeline. Live pointer hover, hold/release, cancellation and keyboard controls use an independent interaction model with the measured pose transitions. Responses to unrecorded gestures are an extension. The 72-frame fade and blank hold after the original recording are also authored, making the preview loop back to its starting background.

The exact reference font is unproven. Fine glyph and pointer contours, antialiasing and captured-video texture differ. No pixel identity or full-image similarity percentage is claimed. Execution and visual checks are documented in [VALIDATION.md](VALIDATION.md).
