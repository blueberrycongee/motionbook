# Run and controls

Run `python3 -m http.server 8000` so local fonts can load, then open `index.html`. No build or external service is required.

Show ticket / Hide ticket changes the card. Repeated clicks queue the latest state until the current dissolve finishes. Taking over autoplay preserves its transition and camera position. Escape restores the summary. Reduced motion starts still and completes changes immediately. Other screen elements are visual UI; no ticket is booked, paid for or validated.

- `node test.cjs`: source cycles, camera/scene bounds, loop closure, repeated/interrupted clicks, Escape, reduced motion and font-load gate.
- `node render.cjs`: regenerate previews; requires Node, Sharp and FFmpeg.

Previews are offline SVG renders. Browser rendering, font loading, hit areas and performance remain untested. See [timing](SOURCE.md) and [visual limitations](VISUAL_REVIEW.md).
