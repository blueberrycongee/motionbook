# Reference and construction

- Creator: @jeetnirnejak
- [Original post](https://x.com/jeetnirnejak/status/2084627211257339954)
- [Inspora page](https://www.inspora.design/posts/1-44)
- [Original video](https://media.inspora.design/posts/f0e2b882-7b0c-4030-9a5d-bc89e8bd995b.mp4)
- Observed 5 October 2026. The original is 1924 × 1518, 687 variable-rate frames, 14.716667 seconds. Native presentation timestamps, rather than an assumed constant rate, drive comparison.

The earlier curator preview was used for initial reconnaissance. Final timing and comparison use the original media file linked above. The original video, source crops and comparison sheets are analysis material and are not redistributed in this package.

## Observed sequence

1. A rounded four-city panel begins at 05:00 UTC.
2. Scrubbing changes the selected hour immediately. The tall outlined cursor and its top cap travel behind that selected value with a spring-like response.
3. Local clocks, previous/next-day indicators and the overlap footer update. At 16:00 UTC all four cities are in working hours and the outline turns green. The cap color and footer settle on separate timelines.
4. Direct jumps traverse across the grid, including 23:00 → 02:00 and 02:00 → 16:00.
5. Find best time performs a stepped hour search and a staggered fading wave across the colored cells before settling on the common hour.

## Independent implementation

The scene is authored SVG with JavaScript state calculation, four fixed timezone offsets and 24 working-hour choices. `motion-data.js` stores measured scalar timestamps, cursor positions, selected-hour values and cap colors. `pulse-data.js` stores measured scalar opacity values for the grid wave. Neither file contains reference images, source code, fonts or audio.

The renderer and browser page call the same scene function. The clean loop retains the complete original sequence and adds an authored return from 16:00 to the initial 05:00 after 14.85 seconds. Its total duration is 16.8 seconds.
