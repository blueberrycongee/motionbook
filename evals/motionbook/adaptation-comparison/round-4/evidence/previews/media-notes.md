# Media sources and transformations

All app pixels come from actual Chromium browser artifacts in CI run 37816365890. No app redraws, generated imagery, contrast changes, or synthetic animation were used. Neutral labels appear outside app pixels. No conditions map or judge reports were consulted.

- `composer-expanded-comparison.png`: A/C/E, `motionbook-round-4-browser/{letter}-960-no-preference/02-draft-expanded.png`. Original 960×720 full captures scaled uniformly to 640×480. Normal motion; expanded draft state.
- `tags-filtered-comparison.png`: B/D/F, `motionbook-round-4-browser/{letter}-960-reduce/02-filtered.png`. Original 960×720 full captures scaled uniformly to 640×480. Reduced-motion stable captures, same “Res” filtered-query checkpoint. Existing selections are preserved as captured. This replaces the initial normal-motion comparison to avoid showing different entrance-animation phases.
- `composer-actual-browser-comparison.gif`: A/C/E first desktop normal-motion recordings, `motionbook-round-4-video-{letter}/{letter}-960-no-preference/*.webm`. Uses recording time 0.00–7.60 seconds, scaled uniformly from 960×720 to 480×360 per panel. Same playback speed and start time in each recording; test actions are not synchronized across recordings, as the visible footer states. No event alignment, speed changes, interpolated frames, or holds were added. Output: 1488×444, 190 frames, 7.57 seconds; 25 fps source, GIF frame delays 40 ms except a 10 ms final encoder frame. Looping. GIF palette quantization is the only additional color transformation.

The separate `tags-B-failure-capture.png` is an optional already-created source capture, outside the three requested primary deliverables; it is not needed for the comparison. It uses B desktop normal-motion `03-failure-selection-persists-after-Escape-and-reopening.png`, at original size, with an external neutral source label. It does not establish a cause or ranking.

Verification: source screenshots and representative video frames were visually inspected; GIF was reopened with Pillow and every frame delay counted. No uploads or commits were performed.
