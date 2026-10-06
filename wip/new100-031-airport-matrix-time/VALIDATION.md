# Run and validation

Open `index.html`. Select the bottom city capsule, type a city fragment and select a result. Select the top palette and choose the gray or black circle to change theme. Press R to repeat the character reveal. Reduced-motion mode shows the settled matrix.

Run `node --test test.cjs`. The fresh tests cover font completeness, deterministic reveal, row isolation, filtering and theme endpoints. They do not establish frame-level fidelity. Browser runtime has not been executed. No GIF, MP4 or native-frame comparison is included in this source-only milestone. Exact motion and typography refinement remain open.
