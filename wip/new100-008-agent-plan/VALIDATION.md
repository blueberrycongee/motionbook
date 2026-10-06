# Run and checkpoint scope

Serve this directory with `python3 -m http.server 4173` and open `http://localhost:4173` in a Canvas-capable browser. Approve or skip steps, undo decisions, approve all, run the local simulation, or start a new plan. Escape resets an interrupted run. Reduced-motion preference starts in manual mode.

The initial checkpoint passes JavaScript syntax checks and six local state tests with `node --test tests/*.test.cjs`. These cover decisions, undo, disabled Run, execution of the approved queue, interruption, repeated use, recorded-to-manual takeover, and loop state.

Preview generation uses the pinned `@napi-rs/canvas` development dependency and FFmpeg: `node --expose-gc render.cjs`. The current checkpoint has only an initial visual comparison to recovered prior output. Complete frame review, encoded media validation and independent review are pending. Original creator footage is not currently available locally.

Actual browser runtime not executed in this validation; preview rendered offline from shared scene code. DOM-event adapter tests do not establish browser rendering/performance. This checkpoint currently has pure-state tests; DOM-adapter coverage is still pending.
