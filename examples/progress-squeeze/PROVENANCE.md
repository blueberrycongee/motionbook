# Source and independent reconstruction, revision 2

- Reference: https://www.inspora.design/posts/progress-bar-animation
- Posted by Petar Cirkovic (@kippe07): https://x.com/kippe07/status/2105216988855542196
- Original media URL, verified against the post's original-media field: https://media.inspora.design/posts/b85fd425-322a-411e-85e6-dd79c160756c.mp4
- Source SHA-256: 0649cfb9dfca5fd97172b3d63c46bfdc2a7c483f026bc3620591a53d58fd63dc

## Correct frame accounting

The original is 1912 × 1432 and 5.441667 seconds, with 312 encoded, variable-rate frames. Its nominal rate is 120 fps, but that is not its unique-frame count. Revision 1 incorrectly described a 653-frame 120 fps resampling as source-frame decoding. This revision uses the original presentation timestamps directly, without frame duplication. Original frame 0 is at 0.000000s and frame 311 at 5.425000s.

Every one of those 312 source frames and 312 regenerated matching-timestamp frames was inspected in numbered contact sheets. Entry/exit transitions and icon transformations were also inspected in enlarged crops. Numerical comparisons run at every original timestamp.

## Recreated motion

The line advances across cobalt, stops at 31% and 81%, folds into an overshooting pinch as the canvas turns orange, then recoils into a shallow wave when resumed. The control crossfades/scales between pause and circular arrows.

All paths and behavior were independently implemented. Work coordinates are 956 × 716. Baseline y=359; control center (478,509); percentage baseline y=239. Revision 2 fits a damped spring to observed amplitude (pause angular frequency ≈16.67 rad/s, damping ratio ≈0.423; release ≈15.94 rad/s, ≈0.386), plus independently drawn cubic contour anchors. It stores 95 measured scalar color/fill controls and 101 observed counter changes. These are scene parameters, not video frames, textures or reference artwork.

The 6.6-second clean preview includes the whole observed interaction followed by an authored return-to-start after 5.62s. Direct button/keyboard control is an addition. No original code, image, footage, font or screenshot is embedded.

## Rights

The reference remains attributable to its creator. No original reuse license was shown in the inspected post. This educational reconstruction grants no rights in that design. Obtain any necessary permission before commercial reuse.
