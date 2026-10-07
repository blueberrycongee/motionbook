# What is measured, and what is not

This is a source-calibrated motion study, not a claim of 100% native equivalence.

## Reconstructed sequence

1. At rest the blue plus is near (449, 838), radius about 32.7 source pixels
2. Press begins at 0.200 s; the disk contracts before its lift overshoot
3. The lifted disk follows the source drag path, crossing discrete list insertion slots rather than moving one generic gap
4. The final slot settles above the Planning heading; the source plus reaches approximately (273, 514)
5. Release begins at 1.767 s. The list scrolls upward, keyboard rises, and task editor expands into white space
6. The open editor is approximately x=0, y=352, width=500, height=208, with keyboard top near y=600
7. After the authored title is entered, collapse starts at 6.233 s. The list ends at about 121 px of upward scroll, retaining the new task

Exact numeric observations, confidence flags, and interpolation conventions are in `validation/`. Screen-space pixel measurements have compression, threshold, clipping, and template-matching uncertainty. Retaining a fitted observation exactly is a fit result, not an independent accuracy measure.

The public bundle keeps numerical observations and independent reconstruction imagery only. Reference footage and reference-pixel comparison media are excluded; the public tests verify numerical continuity and normal-media integrity, not a fresh pixel comparison against the proprietary source.

## Intentional changes

- Original project and task text, with independently drawn generic UI icons
- Bundled Inter instead of the original platform font
- English illustrative keyboard rather than the source's German-layout keyboard
- Simplified note/tag icons, status-bar symbols, input caret, and keyboard key highlights
- Source keyboard typing is represented by timed authored title reveal; no claim of measured native key-touch mechanics
- Browser controls, manual typing, safe cancellation, replay, pause/seek, repeat, hidden-page behavior, and reduced motion are supplemental
- Manual insertion is limited to one demonstrated target and one task per cycle

## Not observable or not verified

The native touch down/up events, hit slop, long-press duration, velocity response, spring implementation, haptics, full drag target behaviors, and system-keyboard transitions are not inferable from this short video alone. Other product views and later cycles are outside scope.

Browser rendering and real touch/a11y testing were not run. A previously reported localhost browser security warning was not bypassed. Exported GIF/MP4 files are offline renders of the runtime's shared SVG scene, not browser recordings or device captures.
