# Real-video reference and motion revision

This is newly authored illustration animation, informed by real video. It is not a recovered original-footer animation or a rotoscoped copy of reference footage.

## Modern video inspected

1. Gillian Higgins / Horses Inside Out, “Understanding & Assessing Your Horse's Movement: Part 1 — The Biomechanics of Walk.” Its publicly embedded video includes modern side-on ridden and loose horses with skeletal markings, at normal and slow speeds. The mounted side-view sequence around 82–89 seconds was inspected across 175 decoded frames; its quiet rider, loaded support, low recovery and gradual extension informed this revision.
https://www.horsesinsideout.com/post/understanding-assessing-your-horse-s-movement-part-1-the-biomechanics-of-walk

This footage is used only for private visual analysis. No permission to republish it is asserted, and the footage is not included in the implementation or source package.

2. cottonbro studio, Pexels video 9943096, “Video of a Walking Horse.” Fifty consecutive 25 fps frames were inspected from the beginning. This is a modern saddled horse without a rider, slightly oblique and on uneven ground, so its sequence was used as a qualitative guide rather than copying every projected position or playback timing.
https://www.pexels.com/video/video-of-a-walking-horse-9943096/
https://www.pexels.com/license/

3. Background timing reference: Starke & Clayton, PeerJ (2015), Table 1. Its straight-walk averages support the roughly 63.5% stance starting point; they do not establish that an animation looks natural.
https://pure-oai.bham.ac.uk/ws/portalfiles/portal/25096740/Starke_Clayton_Universal_approach_determine_footfall_PeerJ.pdf

## What was wrong in the previous animation

- The loaded foreleg stayed crouched: its carpus remained approximately 125–151 degrees during support.
- The short proximal link and two-link solution made support and swing silhouettes too similar.
- The pastern was a variable-length visual connector and could appear folded backward.
- The hoof angle changed velocity abruptly at toe-off, creating a flick even though the tracked contact point did not slide.
- The torso and rider were treated as nearly rigid pieces.

## What changed

- Three-link proximal/forearm/cannon solution with phase-specific carpal and hock flexion. Loaded fore carpi are now approximately 160–177 degrees; folding is reserved for recovery.
- A separate, fixed six-unit pastern between fetlock and coronary band, with gradual loading and unloading.
- Continuous-value and continuous-velocity hoof-angle tracks through toe-off and touchdown.
- Low tuck → forward reach → settle foot recovery, rather than a high-knee march.
- Mobile shoulder/pelvic attachment, restrained trunk pitch, and separate rider pelvis, upper body and arm responses.
- Slimmer distal contours, a curved wedge hoof and lighter far legs improve overlap readability without removing the stronger upper-limb mass.
- Actual forward travel remains 36 artwork pixels/second, or 252 pixels in the seven-second preview. The scene/camera remain fixed.

## Validation

The actual final MP4 was decoded and reviewed through 28 consecutive frames covering a stride. The visual comparison is separate from numerical regression checks.

`node test-motion.mjs` checks planted toe position, fixed upper/middle/cannon/pastern lengths, reachable chains, two or three supporting hooves, near-extended loaded fore carpi, continuous hoof angular velocity, forward travel, and pause/reduced-motion/page-restoration logic. Numerical results are in `preview/kinematic-checks.json`.

These checks guard against specific structural regressions; they do not certify naturalness. The preview is an offline rendering of actual SVG/JavaScript source, not a browser capture. Browser runtime remains unverified.
