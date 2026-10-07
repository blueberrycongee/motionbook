# Run and scope

Run `npm ci`, then `npm start` and open the printed localhost address. `?demo` uses deterministic sample data.

Reuse `src/model.mjs` and `src/controller.mjs` for local task state, `src/dom-renderer.mjs` for the interface, and `scripts/native-workflow-view.mjs` for the offline preview.

Local edits autosave after 600 ms; cloud sample tasks require Save. Pause/resume, simulated runs/history, creation, validation, cancel/delete, scheduling and pane sizing are functional. The standalone pane uses a 600 px fallback and 500 ms spring; stored local width may override it.

- Test: `npm test`
- Render: `npm run render` (offline SVG through Sharp and FFmpeg)

The workflow adds an authored cross-dissolve to close its loop.

The regular/inset layout is a study preset. Native app execution, real-browser layout and account-specific compact/team variants remain unverified.
