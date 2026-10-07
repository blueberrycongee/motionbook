# Source and motion

Reference: [Progress bar animation](https://www.inspora.design/posts/progress-bar-animation), by [Petar Cirkovic / @kippe07](https://x.com/kippe07/status/2105216988855542196). [Original footage](https://media.inspora.design/posts/b85fd425-322a-411e-85e6-dd79c160756c.mp4).

The line advances across cobalt, pauses at 31% and 81%, folds into an overshooting pinch as the canvas turns orange, then recoils into a shallow wave on resume. The control crossfades/scales between pause and circular arrows. Counter changes have their own timing.

The model follows the original variable-rate timing. Its damped spring uses pause frequency ≈16.67 rad/s and damping ratio ≈0.423; release uses ≈15.94 rad/s and ≈0.386. Cubic contour anchors and measured color/fill controls refine the shape. Work coordinates are 956×716, baseline y=359, control center (478,509) and percentage baseline y=239.

The closing return and direct button/keyboard control are authored demo behavior.

All paths and behavior are independently implemented; no source code, footage, images or fonts are embedded. No reuse license for the original design was established. Attribution grants no rights to it; obtain any needed permission for commercial reuse.
