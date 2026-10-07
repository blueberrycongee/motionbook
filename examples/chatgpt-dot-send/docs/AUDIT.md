# Send geometry and timing

## Coordinate spaces

Compute layout in CSS pixels and apply export scale only during rasterization. Normalize measured rectangles with `currentCSSZoom`, not `devicePixelRatio`. Keep the message-body rectangle, bubble rectangle and measured text width separate: travel/squish use the body; background morphing uses the bubble.

## Bubble and layout

- Morph three pieces: a rounded left cap, a center strip scaled about its right edge and a stationary rounded right cap. Use circular corner arcs, CSS border-radius normalization and `1/currentCSSZoom` seam overlap.
- Remove temporary pieces and the text-width lock at 190 ms. Keep the body width/send marker until 800 ms.
- Default message typography: 1 rem text, 1.5 rem line-height, 10 px vertical/16 px horizontal padding, 22 px radius. The fixture uses a 16 px root size.
- Same-sender messages with matching source/direction within 30 minutes group. The preceding row loses its 12 px bottom margin; the 4 px list gap remains.
- Footer spacing uses 220 ms `padding-block`/`margin-bottom` transitions with cubic-bezier(.2,0,0,1). Keep normal-flow movement separate from the 600 ms travel track.
- The no-attachment fixture uses a 44 px single-line and 98 px two-line composer: 40 px collapses immediately, followed by 14 px animated spacing. Outgoing line boxes are 24 px; multiline editor spacing is 20 px.

## Track synchronization

Capture the origin before submission. After the pending row appears, start tracks on the next animation frame with a shared `document.timeline.currentTime`; this is not a measurement of click latency. Keep translation and scale as separate tracks.

Changing footer size can move the destination while travel is running. Account for normal flow and scroll anchoring instead of freezing the destination rectangle.

`src/pipeline.mjs` implements these contracts. [Numerical comparisons](../evidence/protocol-comparison.json) cover synthetic fixtures; [VALIDATION.md](VALIDATION.md) records runtime limits.
