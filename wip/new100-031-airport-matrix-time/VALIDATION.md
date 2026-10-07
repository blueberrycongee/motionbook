# Run

Open `index.html` in a modern browser; no build step is needed.

- Open the city capsule and search by city, country or GMT offset.
- Use Arrow Up/Down and Enter to select; Escape or a background click closes search and restores focus.
- Open the palette, then select the light or dark swatch.
- Press R outside the input to replay the reveal. Reduced motion shows settled states.

Run `node --test test.cjs app.test.cjs` for the source and DOM-adapter tests.

The adapter tests use a mocked DOM. Browser layout, assistive technology and reference fidelity remain unverified; pictured controls beyond those listed above are unfinished.
