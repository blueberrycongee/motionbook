# Run and validation

Open `index.html` directly. Add `?demo` to cycle through all four projects. No install or build step is required.

Hover or Tab to reveal a project. Enter or tap pins it; repeat to close it. Arrow keys move focus; Escape resets. Manual interaction stops autoplay. Reduced-motion preferences disable autoplay and use immediate transitions.

- `node test-motion.cjs && node test-motion-v2.cjs`: state, interruption, easing and measured-target checks.
- `node --check app.js && node --check motion.js`: syntax checks.
- `python render_preview.py`: regenerate offline GIF, MP4 and stills; requires Pillow, ffmpeg and rasterized SVGs under `preview/assets/`.
- Approved v2 motion is unchanged: 500 ms zero-bounce spring, distinct card paths, 87 px row expansion and bottom-anchored reveal.
- Preview: 250 offline frames at 24 fps, 10.417 seconds. The animation uses the measured motion targets; it is not a browser or native recording.
- Browser interaction, mobile layout and performance have not been verified here because browser execution was blocked.
- All-four state sheet contains only the reconstruction. No original-source comparison is included in the preview deliverable.
