# Run and controls

Open `index.html` directly. No build, account, API key or network service is required.

Run pipeline / Replay starts a clean sequence, including after repeated clicks. Reset or Escape returns to Ready. Reduced motion starts Ready and completes an activated run immediately. This visual demo does not retrieve documents or generate answers from an API.

- `node test.cjs`: scene states, bounded geometry, independent timer, loop endpoints, repeated restart, reset, Escape and reduced motion.
- `node render.cjs`: regenerate previews; requires Node, Sharp and FFmpeg. Add `--stills` for selected PNGs.

Previews render the shared SVG scene offline. Browser rendering, font substitution, hit areas and performance remain untested. See [source and timing](SOURCE.md) and [visual limitations](VISUAL_REVIEW.md).
