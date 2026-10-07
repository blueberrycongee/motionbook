# Run

- Browser demo: `npm start` (Node 20.11+), then open `http://127.0.0.1:4317/`
- Native target: `npm run mac` (macOS 13+ and Xcode Command Line Tools)
- Tests: `npm test` and `python3 test/verify_snap_independent.py`
- Previews: `npm install && npm run render` (FFmpeg required)

Add/update local cards, then hover, drag, resize or change placement. Start with `src/stack-behavior.mjs` for reusable interaction behavior.

Tests read the compressed snap trajectory directly. `node scripts/draw-control-icons.mjs` regenerates the original control artwork; after changes, rerun `node test/render-hover-v3.mjs` and the preview encoder.
