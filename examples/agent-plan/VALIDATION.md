# Run and validation

Serve this directory with `python3 -m http.server 4173` and open `http://localhost:4173` in a Canvas-capable browser. Approve or skip steps, undo decisions, approve all, run the local simulation, or start a new plan. Escape resets an interrupted run. Reduced-motion preference starts in manual mode. `window.demo.replay()` restarts the recorded demonstration after manual interaction.

Run `node --test tests/*.test.cjs`. Nine tests pass. Six test local state. Three execute the actual DOM adapter against a controlled DOM interface and exercise button clicks, disabled Run, undo, reset, a second complete run, Escape interruption, autoplay takeover and replay. They do not test browser rendering. No external search, document or email service is called.

The recovered original footage has 987 variable-rate native frames over 18.266667 seconds. Its SHA-256 matches the pre-loss catalog record. All 987 native source/replica pairs were visually inspected, followed by a complete second pass and bounded correction checks with exact raw-raster carry-forward for unchanged frames. Full-size details were used for type, shadows, row clipping, status changes, the skipped strike, completion and reset. Audit JSON records the exact final code and raster hashes. Native source media and comparison crops remain local analysis material and are excluded from this package.

The preview uses the same scene code as the app. Its first 18.266667 seconds follow the original demonstration. A short authored hold and fade returns to the initial state for a 20-second loop. The closure has 104 frames at 60 fps beyond the original duration; these are inspected separately and do not count as source fidelity evidence.

Install the pinned development dependency with `npm install`, then render with `npm run render`. FFmpeg must be installed. MP4 is 1080 × 882 at 60 fps; GIF is 864 × 706 at 20 fps. Export metadata and raw-frame bindings are in `preview/`.

Actual browser runtime not executed in this validation; preview rendered offline from shared scene code. DOM-event adapter tests do not establish browser rendering/performance.

Independent review of the complete preceding candidate found three bounded transition holds. This revision changes 28 native frames; all were re-inspected alongside nine unchanged boundary frames. The other 959 native rasters and all 104 tail rasters are identical to the reviewed base. Publication requires independent approval bound to this package’s exact manifest. This is newly authored reconstruction code; it is not a restoration of the lost unpublished source or its prior manifest. Prior published preview assets were recovery comparison material only.
