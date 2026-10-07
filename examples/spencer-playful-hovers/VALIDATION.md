# Run and controls

Open `index.html` directly. Add `?demo` to cycle through all four projects. No install or build is required.

Hover or Tab reveals a project. Enter or tap pins it; repeat to close. Arrow keys move focus, Escape resets, and manual interaction stops autoplay. Reduced motion disables autoplay and makes transitions immediate.

Motion uses a 500 ms zero-bounce spring, distinct card paths, 87 px row expansion and bottom-anchored reveal.

- `node test-motion.cjs && node test-motion-v2.cjs`: states, interruption, easing and target checks.
- `node --check app.js && node --check motion.js`: syntax checks.
- `python render_preview.py`: regenerate previews; requires Pillow, FFmpeg and rasterized SVGs in `preview/assets/`.

The preview is an offline render. Browser interaction, mobile layout and performance remain untested.
