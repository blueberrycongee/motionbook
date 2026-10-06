# Work in progress

This is a newly authored implementation following recovery of the original reference. No old source package existed for this case. It is not yet approved for the final gallery.

Run `npm start` and open port 8030 in a permitted browser. `npm test` checks the observed sequence and interaction model. For an offline still, install the declared Sharp development dependency and run `node render.cjs <seconds> <output.png>`.

Drag the example file and flick it toward the bin, or drop it inside. A miss increments the counter and returns the file. Enter or Space on the file provides a keyboard action. Undo restores the example after deletion. These controls only affect the demo's internal state.

All 282 original frames have been visually inspected again, with the first composition enlarged. Their recovered media hash matches the previous record. The initial scalar reconstruction includes measured visible bounds plus explicitly provisional positions where the paper overlaps the bin. Those positions, material shading and full-sequence timing need fresh source/replica comparison before approval.

Browser runtime has not been executed. Previously denied local browser launch and local-site access remain respected. Offline SVG rendering and pure model tests are separate from browser validation.

The first source milestone passes six fresh Node tests covering all 282 observed pose outputs, direct drops, misses, resetting, keyboard deletion and loop-time wrapping. The initial offline raster has been inspected. It still needs source-matched typography, paper and bin surface detail, occluded trajectory fitting, all-frame review and final media.
