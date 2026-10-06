# Run and validation

Open `index.html` to play the 19-second demonstration. Move the pointer over the card to control the light, and select the chrome switch to toggle Easy Mode. Leaving the card resets the switch and light. The switch accepts keyboard focus and activation. Press R to replay.

Run `node --test test.cjs`. Nine tests cover hover reversal, leave/reset, repeated toggles, finite SVG output, all 1,031 source timestamps, the recorded switch cycle, the loop join, bounded states and traveling border strokes. These are model and SVG tests; actual browser execution has not been verified.

## Visual review

The original is 1506 × 1502 with 1,031 frames at their actual PTS. Every original frame was inspected on 2026-10-06. Every final source/replica pair, including all four lighting cycles, border travel, tooltip entry, On transition, reset and cursor exit, was visually compared. All 108 authored tail frames were also inspected. Native-size focus checks cover dark, lit, partial-light, tooltip, switch and reverse states. Eighteen fresh scene rasters match the final preview frames byte for byte before encoding.

The GIF and MP4 are offline renders from `scene.js` and `timeline.js`, produced with Sharp/librsvg and FFmpeg. They are not browser captures. The MP4 is 752 × 750 at 60 fps, 1,140 frames and 19 seconds. The original lacks one nominal 60 fps sample; that single preview sample is interpolated, while all 1,031 source timestamps remain in the timeline. The final 1.8 seconds are an authored cursor return and hold. The GIF uses 30 fps. Both files are fully decoded during validation, and the first and final uncompressed preview states are identical.

## Reproduce a raster

The demo needs no build step or network dependencies. Optional offline rendering uses Node.js and `sharp` 0.35.4 from npm. After installing that optional dependency, run `node scripts/render.cjs 8.35 output.png`; add `--native` for 1506 × 1502. Run `node scripts/render.cjs all output-directory` for the complete 60 fps sequence. The script uses the bundled font faces through a temporary Fontconfig file.

## Fidelity limits

The feather, cursor, chrome surfaces, shadows and Gaussian light field are independently authored. Fine edge antialiasing, the original compression texture and late emitter edge steps and rim contour differ slightly. Space Grotesk was selected visually and is not a creator-confirmed font identification. Manual hover uses a response model; the replay follows measured source timing. Browser font/SVG rendering and live performance still need a real browser check. Independent review of the final bound correction is pending; automated tests do not establish fidelity.

## Emitter correction

This revision refines the white slit’s fading height, upper band and lower halo after independent review. The replay, feather, card geometry, controls and controller are unchanged from the prior candidate. Exact comparisons cover all 1,140 uncompressed preview states. All changed pixels lie in bounds [79, 0, 674, 393] on the 752 × 750 preview. Beyond the emitter region, sparse beam alpha-compositing differences reach at most three gray levels; the largest affected set is 595 pixels. Every pixel below row 393 is unchanged. Native emitter crops are generated from complete native rasters, because a viewBox-only shortcut changed filter-edge pixels and was rejected.
