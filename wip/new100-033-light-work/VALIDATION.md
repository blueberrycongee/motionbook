# Run and validation

Open `index.html`. Hover over the card to illuminate it. Select the chrome switch to toggle Easy Mode. Moving outside the card resets the effect. The switch can also be focused and activated with the keyboard.

Run `node --test test.cjs`. Four fresh tests cover smooth hover/reverse, exit reset, repeated toggles and finite SVG output. They do not establish visual fidelity. Two offline SVG stills were inspected during implementation; no browser runtime or recording is claimed. Native-frame replica comparison and final media validation remain open.
