# Source and rights

- Reference: [pill buttons](https://www.inspora.design/posts/pill-buttons), by [@wherescz](https://x.com/wherescz).
- Original post: https://x.com/wherescz/status/2100473433897222224
- Observed footage: https://media.inspora.design/posts/07e91691-4a33-4180-8208-8ababe0f94a0.mp4
- Inspected on 2026-10-05. 1080 × 608, 30 fps, 40.866667 seconds. This implementation covers the first flight-card interaction only. Delete and payment variants in the source compilation are excluded.
- Source footage license is unspecified. The source video, screenshots, cursor, poster and other third-party assets are not redistributed.
- All UI paths, typography layout, flight arc, airplane and animation code in this package were independently authored. System Arial/Helvetica is requested; font software is not bundled. The reference's short interface labels and flight data identify the observed interaction.
- The implementation and vector artwork are independently authored. No blanket license grant is made on the user’s behalf; see the rights notice in LICENSE. No rights are granted in the source creator’s original footage, design or assets.

## Observed timing

The first flight interaction was inspected as a 4 fps contact sheet, full-resolution frames, and 30 fps dark-card boundary measurements. The source cursor was excluded when identifying the shape expansion.

- 0.000–2.267 s: approximately 155 × 42 px pill centered at (540, 306.5).
- 2.300 s: 198 px card width. 2.333 s: 262 px. 2.367 s: 342 px. 2.433 s: 410 px. 2.700 s: 454 px.
- Expanded card: about (312, 150), 456 × 314 px, 27 px corner radius.
- Details blur/fade in after the expanding dark surface; title moves from the pill to the upper-left without replacement.
- 2.4–2.7 s: route, airport labels and status settle; plane moves along the first half of the arc.
- 5.067 s: card begins collapsing; contents fade faster than the surface. By about 5.35 s the pill is restored.
- This 6.1-second loop returns to the initial still before repeating. Cursor motion and repeated demonstrations in the compilation are omitted.
