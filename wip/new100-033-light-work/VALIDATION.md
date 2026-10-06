# Run and validation

Open `index.html` to play the 19-second reference-aligned demonstration. Move the pointer over the card to control the light manually, and select the chrome switch to toggle Easy Mode. Leaving the card resets the switch and light. The switch accepts keyboard focus and activation. Press R to replay the demonstration.

Run `node --test test.cjs`. Eight tests cover hover reversal, leaving/reset, repeated toggles, finite SVG output, all 1,031 actual source timestamps, the switch cycle, the authored loop join and bounded values across the whole 19-second sequence.

This is source-only recovery milestone m02. Focus stills have been generated with SVG/Sharp and compared to the original. They are offline rasters, not browser captures. Actual browser execution, the complete native-frame replica review, GIF/MP4 export, independent fidelity approval and final publication are still pending.

Known remaining work includes the traveling corner strokes during transitions, the unlit emitter's recessed edge, fine feather/material matching and complete sequence checks. Tests are not evidence of visual equivalence.
