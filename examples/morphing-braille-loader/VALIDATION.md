# Run and validation

Run `python3 -m http.server 4173` from this directory and open `http://localhost:4173`. No build or network service is required by the demo. Search for a label, create one, choose its color, and toggle selection. Back, Escape and the plus control make the flow reversible. See [RUNNING.md](RUNNING.md) for the development-only renderer.

## Executed checks

- `node --check scene.js` and `node --check app.js`: passed.
- `node --test tests/*.test.cjs`: 8 passed, 0 failed; output in `tests/results.txt`. These cover state, the actual event adapter, canceled/stale completion, selection reversal, recorded search ranking, header/width independence, tag-to-dots ordering, finite geometry and loop endpoints.
- `node --expose-gc render.cjs`: exported 840 frames at 60 fps, 1080 × 1028, 14 seconds. The GIF is 864 × 822, 20 fps, 280 frames, infinite loop.
- Full MP4 decode completed without errors. Scene pixels at 0, 13.983333 and 14 seconds match exactly. Media encoding can introduce small differences.
- All 661 original native source frames were visually reviewed as paired renders at their exact PTS, including every transition. All 80 frames changed by the final focused correction were re-viewed; 581 previously reviewed frames are exactly unchanged. All 179 added closure frames plus the final source frame were viewed. Full-resolution follow-ups checked typography, icons, disabled colors, row ranking, header transitions and camera motion. [SELF-REVIEW.md](SELF-REVIEW.md) records scope; [REVIEW-BINDING.json](REVIEW-BINDING.json) binds code, media and evidence.

Actual browser runtime not executed in this validation; preview rendered offline from shared scene code. DOM-event adapter tests do not establish browser rendering/performance. Real-browser layout, accessibility and pointer handling remain unverified. No external account or application is contacted.
