# Run and checkpoint scope

Serve this directory with `python3 -m http.server 4173` and open `http://localhost:4173` in a Canvas-capable browser. Approve or skip steps, undo decisions, approve all, run the local simulation, or start a new plan. Escape resets an interrupted run. Reduced-motion preference starts in manual mode.

This checkpoint passes nine tests with `node --test tests/*.test.cjs`. Six test local state. Three execute the actual DOM adapter against a controlled DOM interface and exercise button clicks, disabled Run, undo, reset, a second complete run, Escape interruption, autoplay takeover and replay. They do not test browser rendering.

The original creator footage is recovered and its SHA-256 verified. Card and row geometry, pointer positions and spinner angles were measured at all 987 original timestamps. The first rendered native comparison pass exposed a title-detection error during row handoff; template correlation corrected it. The outgoing details now slide, fade and clip independently of title motion. The first 60 native pairs and four full-size pairs were visually inspected during this iteration. That is partial review, not approval of the complete sequence. Complete native visual review, final encoded media validation and independent review remain pending.

Five stills were regenerated from this checkpoint source. Its final GIF and MP4 have not been rendered. Older working media is excluded from this checkpoint. Preview generation uses the pinned `@napi-rs/canvas` development dependency and FFmpeg: `node --expose-gc render.cjs`.

Actual browser runtime not executed in this validation; preview rendered offline from shared scene code. DOM-event adapter tests do not establish browser rendering/performance.
