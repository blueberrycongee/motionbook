# Run and controls

Open `index.html` directly. No build or external service is required.

- Share opens or replays the entry sequence.
- Close or Escape dismisses it.
- Hover/focus the clip to collapse the sheet fan; leave/blur to restore. Click toggles it on touch devices.
- Reduced motion removes automatic playback and shortens direct transitions.

Destination icons and the copy-link row are visual UI only; they do not send data, connect accounts or change the clipboard.

## Development

- `node test.cjs`: timeline, loop closure, repeated open/close, hover, interrupted opening and reduced-motion checks.
- `node render.cjs`: regenerate previews; requires Node, Sharp and FFmpeg.

Previews render the shared SVG scene offline. Browser rendering, touch hit areas, focus visibility and performance remain untested. See [motion and source](SOURCE.md) and [visual limitations](VISUAL_REVIEW.md).
