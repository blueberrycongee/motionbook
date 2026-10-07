# Run and controls

Run `npm start` with Node.js 20+ and open `http://localhost:4177`. The browser demo has no runtime dependencies. Add Card toggles local state; Expand opens a detail view. Escape closes it. Reduced motion starts paused.

- `npm test`: state/render checks.
- `npm install && npm run render:full`: regenerate previews from the shared Canvas renderer; requires FFmpeg.

The offline MP4 shows the full sequence; the GIF is an excerpt. Browser interaction, mobile layout and performance remain untested. Geometry, shading, glyphs and avatars are independently drawn approximations.
