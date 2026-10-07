# Horse gait

Newly authored illustration animation informed by real-video study, not recovered original-footer motion or copied footage.

## Motion model

- Three-link proximal/forearm/cannon chain with phase-specific carpal/hock flexion; loaded fore carpi approximately 160–177 degrees
- Fixed six-unit pastern with gradual loading/unloading
- Continuous hoof angle and angular velocity through toe-off/touchdown
- Low tuck → forward reach → settle recovery
- Mobile shoulder/pelvis attachments, restrained trunk pitch and separate rider pelvis, upper-body and arm responses
- Forward travel: 36 artwork px/s, or 252 px over the seven-second preview; fixed camera

## References

- [Gillian Higgins / Horses Inside Out, The Biomechanics of Walk](https://www.horsesinsideout.com/post/understanding-assessing-your-horse-s-movement-part-1-the-biomechanics-of-walk): loaded support, low recovery, extension and quiet rider. Study only; footage is not redistributed.
- [cottonbro studio, Video of a Walking Horse](https://www.pexels.com/video/video-of-a-walking-horse-9943096/): qualitative gait reference; [Pexels license](https://www.pexels.com/license/).
- [Starke & Clayton, PeerJ (2015), Table 1](https://pure-oai.bham.ac.uk/ws/portalfiles/portal/25096740/Starke_Clayton_Universal_approach_determine_footfall_PeerJ.pdf): roughly 63.5% stance starting point.

`horse-motion.js` implements the pose. `node test-motion.mjs` checks planted toes, fixed link lengths, reachable chains, support count, loaded carpi, hoof angular continuity, travel and pause/reduced-motion restoration. These checks prevent structural regressions, not certify naturalness. Browser behavior remains unverified.
