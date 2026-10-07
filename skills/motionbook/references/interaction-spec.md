# Reading a reference

These examples show how to explain a particular work without turning its design into a universal recipe. Read only the example useful to the task. A short inline explanation is usually enough; there is no required specification format.

## Apple Music Player: a cover stays the same object

[View the study](https://github.com/blueberrycongee/motionbook/blob/main/examples/apple-music-player/README.md) and follow its `referenceAt` and `Controller` catalog anchors.

The cover travels from the compact strip into the expanded panel while the background retreats and controls appear on separate clocks. The closing cover rebound is not simply the opening played backward. Those coordinated relationships give this example more character than a generic expand/fade animation.

The shared cover can help convey continuity between two views of the same media; that is a design rationale, not a measured usability result. Source-time geometry and appearance are sampled in `referenceAt`. The interactive controller's springs, release thresholds, and canceled-drag behavior are supplemental design, not recovered Apple parameters. Its validation notes distinguish offline SVG output and simulated adapter tests from unverified browser/device behavior.

For another player, the valuable reference may be the cover's identity and the independent layer timing. An exact recreation also makes the measured geometry and asymmetric closing relevant. A new layout need not inherit the demo's fixed coordinates or artwork.

## Micro progress button: feedback stays at the action

[View the study](https://github.com/blueberrycongee/motionbook/blob/main/examples/micro-progress-button/README.md) and follow `ProgressController` and `outline`.

The Update control grows to include Updating and an attached cancel control while the blue fill changes. Shape, label, and feedback stay around the place the user activated. That compact relationship is worth studying for short actions; it does not establish that this is the right progress treatment for every task.

In this implementation, `ProgressController.sample()` calls `cancel()` after a fixed duration. That is a demonstration reset, not success or cancellation of a real request. The README's review describes simulated completion; inspect the source before interpreting that as a business outcome. An adaptation can retain the visual relationship while connecting pending, success, failure, and cancel to the target operation. Its offline GIF and automated tests do not verify actual browser behavior.

## ChatGPT Space: depth without importing the whole scene

[View the study](https://github.com/blueberrycongee/motionbook/blob/main/examples/chatgpt-space-welcome/README.md) and use the `starfield` query for the selected background anchors.

Star size, depth, color, drift, and phase-offset twinkle produce the background's sense of space. Floating cards, collaborators, and the exit warp are other parts of the scene. A request for that atmosphere may need only `StarField`, cached glows, and the star drawing loop. There is no need to invent a navigation benefit for the expressive effect.

The extraction boundary matters: `StarField` uses helpers including `COLORS`, `starCount`, `createRng`, and `clamp`; disabling pointer input and omitting `beginWarp()` avoids unrelated interaction. A still variant can freeze evolution, but must not inherit the whole scene's zero-opacity first frame. The indexed reduced-motion branch is a source clue, not verified accessibility. Density, legibility, and runtime cost depend on the target; the source's 1,000–11,000 stars are not a universal recommendation.
