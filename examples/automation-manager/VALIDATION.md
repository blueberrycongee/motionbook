# Run and scope

Run `npm install`, then `npm start`. Open the localhost address printed by the server. `?demo` uses deterministic sample data. Run `npm test` for the 80 passing model, event, layout and state tests.

This independent study simulates task management locally. It does not create real ChatGPT tasks or execute AI requests. The regular/inset layout is an explicit study preset: search, status navigation and application actions are separated; opening detail moves status navigation to the toolbar. Initial filtering is Active. Actual account-specific compact/team variants are not inferred.

Local editing autosaves after 600 ms; cloud sample tasks require Save. Pause/resume, local simulated runs/history, creation, validation, cancel/delete, schedule controls and pane sizing remain functional. The standalone pane uses the observed 600 px fallback and 500 ms spring; stored local width may override it.

80 Node tests pass. Native app execution and actual browser layout are untested. The existing M07 movie predates these corrections and is not included as proof of this checkpoint.

## Fresh media

`npm run render` renders `preview/` offline: 2,112 frames of SVG rasterised through Sharp, encoded to `native-automation-workflow-60fps.mp4` (1280×840, 60 fps, 35.2 s, 2,112 frames) and `native-automation-workflow.gif` (1280×840, 50 fps, 1,760 frames). Both files decode completely, and sampled GIF frames are all distinct, so the preview is animated rather than a static loop.

The workflow timeline is a one-shot narrative. It opens on the Active filter with two tasks and settles on the All filter after create, edit, pause and delete, so it never returns to its own first frame. The final 72 frames are an authored smoothstep cross-dissolve from the settled list back into the opening frame, which makes the GIF loop. Those closure frames are an authored transition, not recorded behaviour. Source frames 0 and 2111 are pixel-identical, and the decoded first and last GIF frames match.

These are offline SVG renders, not browser recordings. Fonts, hinting and antialiasing differ from the product studied. The preview choreography and task content are authored sample data. Independent review has not been run for this study.
