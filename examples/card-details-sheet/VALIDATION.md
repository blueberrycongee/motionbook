# Run and validation

Open `index.html`. Details opens the sheet; activating the dashboard dismisses it. Repeated activation queues a complete open/close movement. Copy buttons use fictional sample data. Escape closes immediately; reduced motion uses immediate state changes.

- Test: `node test.cjs`
- Render: `node render.cjs` with Sharp and FFmpeg installed; `--stills` exports selected PNGs

Tests cover finite geometry, native tracks, loop endpoints, queued toggles, Escape, reduced motion and clipboard behavior. Previews use the same SVG scene as the page. Real-browser rendering, pointer hit areas, clipboard permissions and performance remain unverified.
