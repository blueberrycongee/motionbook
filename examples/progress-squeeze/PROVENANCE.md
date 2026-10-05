# Source and reconstruction

- Reference: https://www.inspora.design/posts/progress-bar-animation
- Creator: Petar Cirkovic (@kippe07)
- Original post: https://x.com/kippe07/status/2105216988855542196
- Observed public footage: https://media.inspora.design/posts/b85fd425-322a-411e-85e6-dd79c160756c.mp4
- Inspected 2026-10-05. Footage is 1912 × 1432, 120 fps, 5.441667 seconds; all 653 frames were decoded locally and selected transition frames inspected.
- Reference SHA-256: 0649cfb9dfca5fd97172b3d63c46bfdc2a7c483f026bc3620591a53d58fd63dc.

The white line advances across a cobalt canvas. At 31% and 81% it stops, the canvas eases to orange, and a narrow folded wave pinches near the endpoint. Resuming restores blue as the fold recoils and widens into a shallow wave. A pause-circle changes to two circular arrows.

## Observed timing and geometry

Working coordinates are half the source resolution, 956 × 716. Line center is y=359; icon center is (478,509); percentage baseline is y=239. The pauses begin at approximately 0.925 and 3.442 seconds, resuming at 1.883 and 4.758 seconds. Stable line endpoints are x≈304 and x≈784. Flat color samples were taken from unobstructed parts of the footage. The independently fitted damped spring and easing reproduce the observed fold/recoil without copying a motion library or source bundle.

The 6.6-second preview includes the full observed sequence and an authored return-to-start after 5.62 seconds to produce a clean loop. This reset is an addition, not a claim about the reference. The browser demo adds direct button and keyboard interaction. No reference pixels, original code, fonts, or assets are embedded.

## Rights

Reference design remains attributable to its creator. The inspected post supplied no reuse license. This is an independent educational reconstruction; it grants no rights in the original design. Downloaded footage and reference screenshots are excluded from this package. Obtain any necessary permission before commercial use.
